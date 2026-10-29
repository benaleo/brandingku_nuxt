import { computed } from 'vue'
import { useGql } from './useGql'
import type { AppNotification, NotificationFeed } from '~/types/notification.type'

const FEED_LIMIT = 30
const FEED_QUERY = `
  query myNotifications($limit: Int) {
    myNotifications(limit: $limit) {
      quotations { order_id code access_token status first_item item_count updated_at }
      items { id kind action subject_type subject_id subject_label body link read created_at }
      unread_count badge_count
    }
  }
`
// the change signal can arrive just before the writing transaction commits
const SIGNAL_DELAY_MS = 800

const emptyFeed = (): NotificationFeed => ({ quotations: [], items: [], unread_count: 0, badge_count: 0 })

// one subscription per tab, shared by every component that uses the bell state
let stopRealtime: (() => void) | null = null
let signalTimer: ReturnType<typeof setTimeout> | null = null

// the signed-in account's bell: running quotations plus notifications, kept live over the websocket
export const useNotifications = () => {
  const { gqlFetch } = useGql()
  const token = useCookie<string | null>('token', { sameSite: 'lax' })
  const feed = useState<NotificationFeed>('notifications', emptyFeed)
  const badge = computed(() => feed.value.badge_count)
  const { t, te, locale } = useI18n()

  // shared wording for the dropdown and the notifications page
  const statusLabel = (status: string) => (te(`app.orderStatus.${status}`) ? t(`app.orderStatus.${status}`) : status.replaceAll('_', ' '))
  const titleOf = (n: AppNotification) =>
    n.kind === 'discussion'
      ? t('app.notifications.discussionTitle', { code: n.subject_label })
      : t('app.notifications.statusTitle', { code: n.subject_label, status: statusLabel(n.action) })
  const timeAgo = (iso: string) => formatRelativeTime(iso, locale.value === 'en' ? 'en-US' : 'id-ID') ?? t('app.notifications.justNow')

  // the header comes from this ref: after login, other useCookie refs only catch up asynchronously
  const run = (query: string, variables: Record<string, any> = {}) =>
    gqlFetch(query, variables, { headers: { Authorization: `Bearer ${token.value}` } })

  const refresh = async () => {
    if (!import.meta.client) return
    if (!token.value) {
      feed.value = emptyFeed()
      return
    }
    // notifications stay unread until opened from the bell or read all, so every new one counts
    try {
      const res = await run(FEED_QUERY, { limit: FEED_LIMIT }) as { myNotifications: NotificationFeed }
      feed.value = res.myNotifications
    } catch {
      // the bell keeps its last known state
    }
  }

  const markRead = async (id: number) => {
    await run('mutation markNotificationRead($id: Int!) { markNotificationRead(id: $id) }', { id })
    await refresh()
  }

  const markAllRead = async () => {
    await run('mutation markAllNotificationsRead { markAllNotificationsRead }')
    await refresh()
  }

  const start = () => {
    if (!import.meta.client || stopRealtime) return
    const { subscribe, onReconnect } = useChatSocket()
    const unsubscribe = subscribe('subscription notificationsChanged { notificationsChanged }', {}, {
      next: () => {
        if (signalTimer) clearTimeout(signalTimer)
        signalTimer = setTimeout(() => {
          signalTimer = null
          refresh()
        }, SIGNAL_DELAY_MS)
      },
    })
    const offReconnect = onReconnect(() => refresh())
    stopRealtime = () => {
      unsubscribe()
      offReconnect()
      stopRealtime = null
    }
  }

  const stop = () => {
    stopRealtime?.()
    feed.value = emptyFeed()
  }

  return { feed, badge, refresh, markRead, markAllRead, start, stop, statusLabel, titleOf, timeAgo }
}
