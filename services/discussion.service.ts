import { onBeforeUnmount, ref } from 'vue'
import { useGql } from '~/composables/useGql'
import type { EmailAttachmentInput } from '~/types/admin-smtp.type'
import type { DiscussionMessage, DiscussionSubject } from '~/types/discussion.type'

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
