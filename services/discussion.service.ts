import { onBeforeUnmount, ref } from 'vue'
import { useGql } from '~/composables/useGql'
import type { EmailAttachmentInput } from '~/types/admin-smtp.type'
import type { DiscussionActivity, DiscussionMessage, DiscussionSubject, DiscussionThread } from '~/types/discussion.type'

const MESSAGE_FIELDS = 'id subject_type subject_id author_name author_role message attachment { file_name content_type size path } created_at'

// one discussion thread, kept live over the shared websocket while the component is mounted
export const useDiscussionService = (subjectType: DiscussionSubject, subjectId: () => number) => {
  const { gqlFetch } = useGql()
  const { subscribe, onReconnect } = useChatSocket()

  const messages = ref<DiscussionMessage[]>([])
  const loading = ref(false)
  const sending = ref(false)

  // the poster also gets its own message from the subscription, so merge by id
  const merge = (incoming: DiscussionMessage[]) => {
    const known = new Set(messages.value.map(m => m.id))
    const added = incoming.filter(m => !known.has(m.id))
    if (added.length) messages.value = [...messages.value, ...added].sort((a, b) => a.id - b.id)
    return added
  }

  const load = async () => {
    loading.value = true
    try {
      const res = await gqlFetch<{ getDiscussion: DiscussionMessage[] }>(
        `query getDiscussion($type: String!, $id: Int!) { getDiscussion(subject_type: $type, subject_id: $id) { ${MESSAGE_FIELDS} } }`,
        { type: subjectType, id: subjectId() },
        { auth: true },
      )
      messages.value = res.getDiscussion
    } finally {
      loading.value = false
    }
  }

  // attachment.content is a data URL; the upload can take a while for a 5 MB file
  const post = async (message: string, attachment?: EmailAttachmentInput) => {
    sending.value = true
    try {
      const res = await gqlFetch<{ postDiscussionMessage: DiscussionMessage }>(
        `mutation postDiscussionMessage($type: String!, $id: Int!, $message: String, $attachment: EmailAttachmentInput) {
          postDiscussionMessage(subject_type: $type, subject_id: $id, message: $message, attachment: $attachment) { ${MESSAGE_FIELDS} }
        }`,
        { type: subjectType, id: subjectId(), message, attachment: attachment ?? null },
        { auth: true, timeout: 60000 },
      )
      merge([res.postDiscussionMessage])
    } finally {
      sending.value = false
    }
  }

  let stop: (() => void) | null = null
  const listen = (onNew?: (added: DiscussionMessage[]) => void) => {
    stop?.()
    const unsubscribe = subscribe(
      `subscription discussionMessageAdded($type: String!, $id: Int!) {
        discussionMessageAdded(subject_type: $type, subject_id: $id) { ${MESSAGE_FIELDS} }
      }`,
      { type: subjectType, id: subjectId() },
      {
        next: (data) => {
          const added = merge(data?.discussionMessageAdded ? [data.discussionMessageAdded] : [])
          if (added.length) onNew?.(added)
        },
      },
    )
    // messages sent while the socket was down arrive with the refetch
    const offReconnect = onReconnect(() => load().catch(() => {}))
    stop = () => {
      unsubscribe()
      offReconnect()
      stop = null
    }
  }

  onBeforeUnmount(() => stop?.())

  return { messages, loading, sending, load, post, listen }
}

// messages from the other side of every thread the signed-in user takes part in
export const useDiscussionIncoming = (onIncoming: (a: DiscussionActivity) => void) => {
  const { subscribe, onReconnect } = useChatSocket()
  let stops: (() => void)[] = []
  const start = (onReconnected?: () => void) => {
    stop()
    stops = [subscribe(
      `subscription discussionIncoming { discussionIncoming { message { ${MESSAGE_FIELDS} } label link } }`,
      {},
      { next: (data) => { if (data?.discussionIncoming) onIncoming(data.discussionIncoming) } },
    )]
    if (onReconnected) stops.push(onReconnect(onReconnected))
  }
  const stop = () => { stops.splice(0).forEach(s => s()) }
  onBeforeUnmount(stop)
  return { start, stop }
}

export const useDiscussionInbox = () => {
  const { gqlFetch } = useGql()
  const threads = ref<DiscussionThread[]>([])
  const loading = ref(false)
  const error = ref('')

  const load = async (unreadOnly = false) => {
    loading.value = true
    error.value = ''
    try {
      const res = await gqlFetch<{ getDiscussionInbox: DiscussionThread[] }>(
        `query getDiscussionInbox($unread: Boolean) { getDiscussionInbox(unread_only: $unread) {
          subject_type subject_id label customer_name unread last_message { ${MESSAGE_FIELDS} }
        } }`,
        { unread: unreadOnly },
        { auth: true },
      )
      threads.value = res.getDiscussionInbox
    } catch (e: any) {
      error.value = e?.message || 'Gagal memuat diskusi'
    } finally {
      loading.value = false
    }
  }

  return { threads, loading, error, load }
}

// threads with unread messages, shared by the console sidebar and anything that reads a thread
export const useDiscussionInboxCount = () => {
  const { gqlFetch } = useGql()
  const count = useState('discussion-inbox-unread', () => 0)
  const refresh = async () => {
    try {
      const res = await gqlFetch<{ discussionInboxUnread: number }>('query { discussionInboxUnread }', {}, { auth: true })
      count.value = res.discussionInboxUnread
    } catch {
      // the badge keeps its last value
    }
  }
  return { count, refresh }
}
