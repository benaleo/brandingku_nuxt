import { computed, getCurrentScope, onScopeDispose } from 'vue'
import { toast } from 'vue-sonner'
import { useGql } from './useGql'
import type { AppNotification, NotificationFeed } from '~/types/notification.type'

const FEED_LIMIT = 30
const MAX_TOASTS = 3
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
// ids already announced so a refetch never repeats a toast; null until the first load
let seen: Set<number> | null = null
type NewItemsListener = (items: AppNotification[]) => void
const listeners = new Set<NewItemsListener>()

// the signed-in account's bell: running quotations plus notifications, kept live over the websocket
export const useNotifications = () => {
  const { gqlFetch } = useGql()
  const token = useCookie<string | null>('token', { sameSite: 'lax' })
  const feed = useState<NotificationFeed>('notifications', emptyFeed)
  const badge = computed(() => feed.value.badge_count)
  const { t, te, locale } = useI18n()
  const router = useRouter()

  // shared wording for the dropdown and the notifications page
  const statusLabel = (status: string) => (te(`app.orderStatus.${status}`) ? t(`app.orderStatus.${status}`) : status.replaceAll('_', ' '))
  const titleOf = (n: AppNotification) =>
    n.kind === 'stock_available'
      ? t('app.notifications.stockTitle', { name: n.subject_label })
      : n.kind === 'discussion'
      ? t('app.notifications.discussionTitle', { code: n.subject_label })
      : t('app.notifications.statusTitle', { code: n.subject_label, status: statusLabel(n.action) })
  const timeAgo = (iso: string) => formatRelativeTime(iso, locale.value === 'en' ? 'en-US' : 'id-ID') ?? t('app.notifications.justNow')

  // the header comes from this ref: after login, other useCookie refs only catch up asynchronously
  const run = (query: string, variables: Record<string, any> = {}) =>
    gqlFetch(query, variables, { headers: { Authorization: `Bearer ${token.value}` } })

  // pages react to the same subscription; the callback gets the items that arrived since the last refetch
  const onNewNotifications = (cb: NewItemsListener) => {
    listeners.add(cb)
    const off = () => { listeners.delete(cb) }
    if (getCurrentScope()) onScopeDispose(off)
    return off
  }

  const announce = (items: AppNotification[]) => {
    const added = items.filter(n => !seen!.has(n.id))
    // discussion replies already toast through the discussion socket; the open order page updates itself
    const fresh = added.filter(n => !n.read && n.kind !== 'discussion' && n.link !== router.currentRoute.value.path)
    items.forEach(n => seen!.add(n.id))
    if (added.length) listeners.forEach(cb => cb(added))
    // oldest first so the newest ends on top of the stack
    for (const n of fresh.slice(0, MAX_TOASTS).reverse()) {
      toast.info(titleOf(n), {
        id: `notification-${n.id}`,
        description: n.body,
        duration: 8000,
        action: {
          label: t('app.discussion.open'),
          onClick: () => {
            markRead(n.id).catch(() => {})
            router.push(n.link)
          },
        },
      })
    }
    if (fresh.length > MAX_TOASTS) {
      toast.info(t('app.notifications.moreToast', { count: fresh.length - MAX_TOASTS }), { duration: 8000 })
    }
  }

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
      // the first load only records what is already there
      if (!seen) seen = new Set(res.myNotifications.items.map(n => n.id))
      else announce(res.myNotifications.items)
    } catch {
      // the bell keeps its last known state
    }
  }

  const markRead = async (id: number) => {
    await run('mutation markNotificationRead($id: Int!) { markNotificationRead(id: $id) }', { id })
    await refresh()
  }

  // opening an order clears everything about it
  const markSubjectRead = async (subjectType: string, subjectID: number) => {
    await run('mutation markSubjectNotificationsRead($type: String!, $id: Int!) { markSubjectNotificationsRead(subject_type: $type, subject_id: $id) }', { type: subjectType, id: subjectID })
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
    if (signalTimer) clearTimeout(signalTimer)
    signalTimer = null
    seen = null
    feed.value = emptyFeed()
  }

  return { feed, badge, refresh, markRead, markAllRead, start, stop, onNewNotifications, markSubjectRead, statusLabel, titleOf, timeAgo }
}
