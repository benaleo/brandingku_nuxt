<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bell, CheckCheck, FileText, MessageSquare, Package } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AppNotification } from '~/types/notification.type'

const { t, te, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const { feed, badge, refresh, markRead, markAllRead, start, stop } = useNotifications()
const { reconnect } = useChatSocket()
const token = useCookie<string | null>('token', { sameSite: 'lax' })
const open = ref(false)

onMounted(() => {
  if (!token.value) return
  refresh()
  start()
})
onBeforeUnmount(() => stop())

// a new login re-authenticates the shared socket so the subscription runs as that account
watch(token, (value) => {
  if (!value) return stop()
  reconnect()
  refresh()
  start()
})
// cheap catch-up after actions on other pages, and whenever the panel opens
watch(() => route.path, () => { if (token.value) refresh() })
watch(open, (isOpen) => { if (isOpen) refresh() })

const statusLabel = (status: string) => (te(`app.orderStatus.${status}`) ? t(`app.orderStatus.${status}`) : status.replaceAll('_', ' '))
const title = (n: AppNotification) =>
  n.kind === 'discussion'
    ? t('app.notifications.discussionTitle', { code: n.subject_label })
    : t('app.notifications.statusTitle', { code: n.subject_label, status: statusLabel(n.action) })

const intlLocale = computed(() => (locale.value === 'en' ? 'en-US' : 'id-ID'))
const ago = (iso: string) => {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return t('app.notifications.justNow')
  const rtf = new Intl.RelativeTimeFormat(intlLocale.value, { numeric: 'auto' })
  if (s < 3600) return rtf.format(-Math.round(s / 60), 'minute')
  if (s < 86400) return rtf.format(-Math.round(s / 3600), 'hour')
  if (s < 604800) return rtf.format(-Math.round(s / 86400), 'day')
  return new Intl.DateTimeFormat(intlLocale.value, { dateStyle: 'medium' }).format(new Date(iso))
}

const openNotification = async (n: AppNotification) => {
  if (!n.read) markRead(n.id).catch(() => {})
  await router.push(n.link)
}
const badgeText = computed(() => (badge.value > 99 ? '99+' : String(badge.value)))
</script>

<template>
  <!-- stays mounted while signed out so the token watcher sees the next login -->
  <DropdownMenu v-if="token" v-model:open="open">
    <DropdownMenuTrigger as-child>
      <button
        type="button"
        class="relative inline-flex text-slate-700 hover:text-black"
        :title="$t('app.notifications.title')"
        :aria-label="badge ? $t('app.notifications.openWithCount', { count: badge }) : $t('app.notifications.title')"
      >
        <Bell class="size-6" />
        <span
          v-if="badge"
          class="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold leading-none text-white"
          aria-hidden="true"
        >{{ badgeText }}</span>
      </button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" :side-offset="14" class="w-[min(calc(100vw-1.5rem),380px)] p-0">
      <div class="flex items-center justify-between gap-2 border-b px-4 py-3">
        <p class="font-semibold text-slate-900">{{ $t('app.notifications.title') }}</p>
        <button
          v-if="feed.unread_count"
          type="button"
          class="inline-flex items-center gap-1 text-xs font-medium text-green-700 hover:underline"
          @click="markAllRead().catch(() => {})"
        >
          <CheckCheck class="size-3.5" /> {{ $t('app.notifications.markAll') }}
        </button>
      </div>

      <div class="max-h-[70vh] overflow-y-auto">
        <!-- running quotations stay on top until they move on, so they always count -->
        <section v-if="feed.quotations.length" class="space-y-2 p-3">
          <p class="px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{{ $t('app.notifications.quotations') }}</p>
          <DropdownMenuItem v-for="q in feed.quotations" :key="q.order_id" as-child class="block p-0 focus:bg-transparent">
            <NuxtLink
              :to="`/orders/${q.code}`"
              class="block rounded-lg border bg-white p-3 shadow-xs transition-colors hover:border-green-600 focus-visible:border-green-600"
            >
              <span class="flex items-start justify-between gap-2">
                <span class="flex min-w-0 items-center gap-2">
                  <FileText class="size-4 shrink-0 text-green-700" />
                  <span class="truncate font-semibold text-slate-900">{{ q.code }}</span>
                </span>
                <span class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium" :class="ORDER_STATUS_STYLE[q.status]">{{ statusLabel(q.status) }}</span>
              </span>
              <span v-if="q.first_item" class="mt-1 block truncate text-sm text-slate-600">
                {{ q.first_item }}<template v-if="q.item_count > 1"> · {{ $t('app.notifications.moreItems', { count: q.item_count - 1 }) }}</template>
              </span>
              <span class="mt-1 block text-xs text-slate-400">{{ ago(q.updated_at) }}</span>
            </NuxtLink>
          </DropdownMenuItem>
        </section>

        <section :class="feed.quotations.length && 'border-t'">
          <p class="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{{ $t('app.notifications.others') }}</p>
          <p v-if="!feed.items.length" class="px-4 pb-6 pt-3 text-center text-sm text-slate-500">{{ $t('app.notifications.empty') }}</p>
          <DropdownMenuItem
            v-for="n in feed.items"
            :key="n.id"
            class="flex cursor-pointer items-start gap-3 rounded-none px-4 py-3"
            :class="!n.read && 'bg-green-50/70'"
            @select="openNotification(n)"
          >
            <span class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full" :class="n.kind === 'discussion' ? 'bg-sky-100 text-sky-700' : 'bg-green-100 text-green-700'">
              <MessageSquare v-if="n.kind === 'discussion'" class="size-4" />
              <Package v-else class="size-4" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-sm text-slate-900" :class="!n.read && 'font-semibold'">{{ title(n) }}</span>
              <span v-if="n.body" class="mt-0.5 line-clamp-2 block text-xs text-slate-600">{{ n.body }}</span>
              <span class="mt-1 block text-[11px] text-slate-400">{{ ago(n.created_at) }}</span>
            </span>
            <span v-if="!n.read" class="mt-1.5 size-2 shrink-0 rounded-full bg-green-600" :aria-label="$t('app.notifications.unread')" />
          </DropdownMenuItem>
        </section>
      </div>

      <div class="border-t p-2">
        <DropdownMenuItem as-child class="justify-center text-sm font-medium text-green-700">
          <NuxtLink to="/profile/order-histories">{{ $t('app.notifications.viewOrders') }}</NuxtLink>
        </DropdownMenuItem>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
