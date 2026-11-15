<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Bell, CheckCheck } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AppNotification } from '~/types/notification.type'

const route = useRoute()
const router = useRouter()
const { feed, badge, titleOf, timeAgo, refresh, markRead, markAllRead, start, stop } = useStaffNotifications()
const token = useCookie<string | null>('token', { sameSite: 'lax' })
const open = ref(false)

onMounted(() => {
  if (!token.value) return
  refresh()
  start()
})
onBeforeUnmount(() => stop())

watch(token, (value) => {
  if (!value) return stop()
  refresh()
  start()
})
// catch-up after actions on other pages, and whenever the panel opens
watch(() => route.path, () => { if (token.value) refresh() })
watch(open, (isOpen) => { if (isOpen) refresh() })

const openNotification = async (n: AppNotification) => {
  if (!n.read) markRead(n.id).catch(() => {})
  await router.push(n.link)
}
const badgeText = computed(() => (badge.value > 99 ? '99+' : String(badge.value)))
</script>

<template>
  <DropdownMenu v-model:open="open">
    <DropdownMenuTrigger as-child>
      <button
        type="button"
        class="relative inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :aria-label="badge ? `Notifikasi, ${badge} belum dibaca` : 'Notifikasi'"
      >
        <Bell class="size-5"/>
        <span
          v-if="badge"
          class="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-white"
          aria-hidden="true"
        >{{ badgeText }}</span>
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" :collision-padding="8" class="w-[calc(100vw-1rem)] p-0 sm:w-96">
      <div class="flex items-center justify-between border-b px-3 py-2">
        <p class="text-sm font-medium">Notifikasi</p>
        <button
          v-if="badge"
          type="button"
          class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          @click="markAllRead().catch(() => {})"
        >
          <CheckCheck class="size-3.5"/>
          Tandai semua dibaca
        </button>
      </div>
      <div class="max-h-[min(24rem,70vh)] overflow-y-auto">
        <p v-if="!feed.items.length" class="px-4 py-8 text-center text-sm text-muted-foreground">Belum ada notifikasi</p>
        <DropdownMenuItem
          v-for="n in feed.items"
          :key="n.id"
          class="flex cursor-pointer items-start gap-3 rounded-none border-b px-3 py-3 last:border-b-0"
          :class="n.read ? '' : 'bg-muted/50'"
          @select="openNotification(n)"
        >
          <span class="mt-1.5 size-2 shrink-0 rounded-full" :class="n.read ? 'bg-transparent' : 'bg-destructive'" aria-hidden="true"/>
          <span class="min-w-0 flex-1">
            <span class="flex items-baseline justify-between gap-2">
              <span class="truncate text-sm" :class="n.read ? '' : 'font-semibold'">{{ titleOf(n) }}</span>
              <span class="shrink-0 text-xs text-muted-foreground">{{ timeAgo(n.created_at) }}</span>
            </span>
            <span class="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{{ n.body }}</span>
          </span>
        </DropdownMenuItem>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
