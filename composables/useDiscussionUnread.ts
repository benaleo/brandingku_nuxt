import { computed } from 'vue'
import { useGql } from './useGql'
import type { DiscussionSubject } from '~/types/discussion.type'

type UnreadEntry = { count: number; viewing: number; lastMarked: number }

// raised whenever a thread is marked read, so inbox counts know to refetch
export const useDiscussionInboxStale = () => useState('discussion-inbox-stale', () => 0)

// whether a thread is on screen right now, e.g. to skip a toast for it
export const useDiscussionOnScreen = () => {
  const entries = useState<Record<string, UnreadEntry>>('discussion-unread', () => ({}))
  return (subjectType: DiscussionSubject, subjectId: number) => (entries.value[`${subjectType}:${subjectId}`]?.viewing ?? 0) > 0
}

// Unread messages of one discussion for the signed-in user, shared by its floating button
// and every thread showing it. A thread on screen counts as reading: it marks the thread
// read and keeps the count at zero while it stays visible.
export const useDiscussionUnread = (subjectType: DiscussionSubject, subjectId: () => number) => {
  const { gqlFetch } = useGql()
  const entries = useState<Record<string, UnreadEntry>>('discussion-unread', () => ({}))
  const inboxStale = useDiscussionInboxStale()
  const entry = () => {
    const key = `${subjectType}:${subjectId()}`
    if (!entries.value[key]) entries.value[key] = { count: 0, viewing: 0, lastMarked: 0 }
    return entries.value[key]!
  }

  const count = computed(() => entry().count)

  const refresh = async () => {
    if (entry().viewing > 0) {
      entry().count = 0
      return
    }
    try {
      const res = await gqlFetch<{ discussionUnread: number }>(
        'query discussionUnread($type: String!, $id: Int!) { discussionUnread(subject_type: $type, subject_id: $id) }',
        { type: subjectType, id: subjectId() },
        { auth: true },
      )
      // a thread may have come on screen while the request was out
      entry().count = entry().viewing > 0 ? 0 : res.discussionUnread
    } catch {
      // the badge keeps its last value
    }
  }

  // lastId: the newest message on screen; nothing is sent again for messages already marked
  const markRead = async (lastId: number) => {
    const e = entry()
    e.count = 0
    if (lastId <= e.lastMarked) return
    e.lastMarked = lastId
    try {
      await gqlFetch(
        'mutation markDiscussionRead($type: String!, $id: Int!) { markDiscussionRead(subject_type: $type, subject_id: $id) }',
        { type: subjectType, id: subjectId() },
        { auth: true },
      )
      inboxStale.value++
    } catch {
      e.lastMarked = 0
    }
  }

  // a message from the other side while no thread is on screen
  const bump = () => {
    if (entry().viewing === 0) entry().count++
  }

  const setViewing = (on: boolean) => {
    const e = entry()
    e.viewing = Math.max(0, e.viewing + (on ? 1 : -1))
  }

  return { count, refresh, markRead, bump, setViewing }
}
