import { computed, getCurrentScope, onScopeDispose } from 'vue'
import { toast } from 'vue-sonner'
import { useGql } from './useGql'
import type { AppNotification, StaffNotificationFeed } from '~/types/notification.type'

const FEED_LIMIT = 30
const MAX_TOASTS = 3
const FEED_QUERY = `
  query staffNotifications($limit: Int) {
    staffNotifications(limit: $limit) {
      items { id kind action subject_type subject_id subject_label body link read created_at }
      unread_count
    }
  }
`
// the change signal can arrive just before the writing transaction commits
const SIGNAL_DELAY_MS = 800

const emptyFeed = (): StaffNotificationFeed => ({ items: [], unread_count: 0 })

// one subscription per tab; ids already announced so a refetch never repeats a toast
let stopRealtime: (() => void) | null = null
let signalTimer: ReturnType<typeof setTimeout> | null = null
let seen: Set<number> | null = null
type NewItemsListener = (items: AppNotification[]) => void
const listeners = new Set<NewItemsListener>()

// the console bell for staff: order and discussion activity from customers, live over the websocket
export const useStaffNotifications = () => {
  const { gqlFetch } = useGql()
  const token = useCookie<string | null>('token', { sameSite: 'lax' })
  const router = useRouter()
  const feed = useState<StaffNotificationFeed>('staff-notifications', emptyFeed)
  const badge = computed(() => feed.value.unread_count)
  const { locale } = useI18n()

  const titleOf = (n: AppNotification) =>
    n.kind === 'staff_discussion' ? `Pesan baru - ${n.subject_label}` : `Pesanan ${n.subject_label}`
  const timeAgo = (iso: string) => formatRelativeTime(iso, locale.value === 'en' ? 'en-US' : 'id-ID') ?? 'Baru saja'

  const run = (query: string, variables: Record<string, any> = {}) =>
    gqlFetch(query, variables, { headers: { Authorization: `Bearer ${token.value}` } })

  const markRead = async (id: number) => {
    await run('mutation markStaffNotificationRead($id: Int!) { markStaffNotificationRead(id: $id) }', { id })
    await refresh()
  }

  const markAllRead = async () => {
    await run('mutation markAllStaffNotificationsRead { markAllStaffNotificationsRead }')
    await refresh()
  }

  // pages react to the same subscription; the callback gets the items that arrived since the last refetch
  const onNewNotifications = (cb: NewItemsListener) => {
    listeners.add(cb)
    const off = () => { listeners.delete(cb) }
    if (getCurrentScope()) onScopeDispose(off)
    return off
  }

  const announce = (items: AppNotification[]) => {
    const added = items.filter(n => !seen!.has(n.id))
    const fresh = added.filter(n => !n.read && n.link !== router.currentRoute.value.path)
    items.forEach(n => seen!.add(n.id))
    if (added.length) listeners.forEach(cb => cb(added))
    // oldest first so the newest ends on top of the stack
    const shown = fresh.slice(0, MAX_TOASTS).reverse()
    for (const n of shown) {
      toast.info(titleOf(n), {
        id: `staff-notification-${n.id}`,
        description: n.body,
        duration: 8000,
        action: {
          label: 'Buka',
          onClick: () => {
            markRead(n.id).catch(() => {})
            router.push(n.link)
          },
        },
      })
    }
    if (fresh.length > MAX_TOASTS) {
      toast.info(`${fresh.length - MAX_TOASTS} notifikasi baru lainnya`, { duration: 8000 })
    }
  }

  const refresh = async () => {
    if (!import.meta.client) return
    if (!token.value) {
      feed.value = emptyFeed()
      return
    }
    try {
      const res = await run(FEED_QUERY, { limit: FEED_LIMIT }) as { staffNotifications: StaffNotificationFeed }
      feed.value = res.staffNotifications
      // the first load only records what is already there
      if (!seen) seen = new Set(res.staffNotifications.items.map(n => n.id))
      else announce(res.staffNotifications.items)
    } catch {
      // the bell keeps its last known state
    }
  }

  const start = () => {
    if (!import.meta.client || stopRealtime) return
    const { subscribe, onReconnect } = useChatSocket()
    const unsubscribe = subscribe('subscription staffNotificationsChanged { staffNotificationsChanged }', {}, {
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

  return { feed, badge, titleOf, timeAgo, refresh, markRead, markAllRead, start, stop, onNewNotifications }
}
