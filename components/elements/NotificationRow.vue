<script setup lang="ts">
import { MessageSquare, Package } from 'lucide-vue-next'
import type { AppNotification } from '~/types/notification.type'

// the content of one notification; the dropdown and the page supply the clickable wrapper
defineProps<{ notification: AppNotification }>()
const { titleOf, timeAgo } = useNotifications()
</script>

<template>
  <span class="flex w-full items-start gap-3 text-left">
    <span
      class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full"
      :class="notification.kind === 'discussion' ? 'bg-sky-100 text-sky-700' : 'bg-green-100 text-green-700'"
    >
      <MessageSquare v-if="notification.kind === 'discussion'" class="size-4" />
      <Package v-else class="size-4" />
    </span>
    <span class="min-w-0 flex-1">
      <span class="block text-sm text-slate-900" :class="!notification.read && 'font-semibold'">{{ titleOf(notification) }}</span>
      <span v-if="notification.body" class="mt-0.5 line-clamp-2 block text-xs text-slate-600">{{ notification.body }}</span>
      <span class="mt-1 block text-[11px] text-slate-400">{{ timeAgo(notification.created_at) }}</span>
    </span>
    <span v-if="!notification.read" class="mt-1.5 size-2 shrink-0 rounded-full bg-green-600" :aria-label="$t('app.notifications.unread')" />
  </span>
</template>
