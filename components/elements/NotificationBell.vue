<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bell, CheckCheck } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'vue-sonner'
import { useDiscussionIncoming } from '~/services/discussion.service'
import type { AppNotification } from '~/types/notification.type'

const route = useRoute()
const router = useRouter()
const { feed, badge, refresh, markRead, markAllRead, start, stop } = useNotifications()
const { reconnect } = useChatSocket()
const token = useCookie<string | null>('token', { sameSite: 'lax' })
const open = ref(false)

// admin replies on the customer's own threads pop up unless that thread is on screen;
// staff hear about customer messages in the console instead
const { t } = useI18n()
const onScreen = useDiscussionOnScreen()
const incoming = useDiscussionIncoming(({ message, label, link }) => {
  if (message.author_role !== 'staff' || onScreen(message.subject_type, message.subject_id)) return
  toast.info(t('app.discussion.newToast', { code: label }), {
    description: message.message || message.attachment?.file_name,
    action: { label: t('app.discussion.open'), onClick: () => router.push(link) },
  })
})

onMounted(() => {
  if (!token.value) return
  refresh()
  start()
  incoming.start()
})
onBeforeUnmount(() => stop())

// a new login re-authenticates the shared socket so the subscription runs as that account
watch(token, (value) => {
  if (!value) {
    incoming.stop()
    return stop()
  }
  reconnect()
  refresh()
  start()
  incoming.start()
})
// cheap catch-up after actions on other pages, and whenever the panel opens
watch(() => route.path, () => { if (token.value) refresh() })
watch(open, (isOpen) => { if (isOpen) refresh() })

const openNotification = async (n: AppNotification) => {
  if (!n.read) markRead(n.id).catch(() => {})
  await router.push(n.link)
}
const badgeText = computed(() => (badge.value > 99 ? '99+' : String(badge.value)))
</script>

<template>
  <!-- stays mounted while signed out so the token watcher sees the next login -->
  <template v-if="token">
    <!-- phones open the notifications page instead of a floating panel -->
    <NuxtLink
      to="/notifications"
      class="relative inline-flex text-slate-700 hover:text-black md:hidden"
      :aria-label="badge ? $t('app.notifications.openWithCount', { count: badge }) : $t('app.notifications.title')"
    >
      <Bell class="size-6" />
      <span v-if="badge" class="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold leading-none text-white" aria-hidden="true">{{ badgeText }}</span>
    </NuxtLink>

    <DropdownMenu v-model:open="open">
      <DropdownMenuTrigger as-child>
        <button
          type="button"
          class="relative hidden text-slate-700 hover:text-black md:inline-flex"
          :title="$t('app.notifications.title')"
          :aria-label="badge ? $t('app.notifications.openWithCount', { count: badge }) : $t('app.notifications.title')"
        >
          <Bell class="size-6" />
          <span v-if="badge" class="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold leading-none text-white" aria-hidden="true">{{ badgeText }}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" :side-offset="14" class="w-[380px] p-0">
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
              <ElementsNotificationQuotationCard :quotation="q" />
            </DropdownMenuItem>
          </section>

          <section :class="feed.quotations.length && 'border-t'">
            <p class="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{{ $t('app.notifications.others') }}</p>
            <p v-if="!feed.items.length" class="px-4 pb-6 pt-3 text-center text-sm text-slate-500">{{ $t('app.notifications.empty') }}</p>
            <DropdownMenuItem
              v-for="n in feed.items"
              :key="n.id"
              class="cursor-pointer rounded-none px-4 py-3"
              :class="!n.read && 'bg-green-50/70'"
              @select="openNotification(n)"
            >
              <ElementsNotificationRow :notification="n" />
            </DropdownMenuItem>
          </section>
        </div>

        <div class="border-t p-2">
          <DropdownMenuItem as-child class="justify-center text-sm font-medium text-green-700">
            <NuxtLink to="/notifications">{{ $t('app.notifications.viewAll') }}</NuxtLink>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  </template>
</template>
