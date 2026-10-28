<script setup lang="ts">
import { FileText } from 'lucide-vue-next'
import type { NotificationQuotation } from '~/types/notification.type'

// a running quotation in the bell dropdown and on the notifications page
defineProps<{ quotation: NotificationQuotation }>()
const { statusLabel, timeAgo } = useNotifications()
</script>

<template>
  <NuxtLink
    :to="`/orders/${quotation.code}`"
    class="block rounded-lg border bg-white p-3 shadow-xs transition-colors hover:border-green-600 focus-visible:border-green-600"
  >
    <span class="flex items-start justify-between gap-2">
      <span class="flex min-w-0 items-center gap-2">
        <FileText class="size-4 shrink-0 text-green-700" />
        <span class="truncate font-semibold text-slate-900">{{ quotation.code }}</span>
      </span>
      <span class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium" :class="ORDER_STATUS_STYLE[quotation.status]">{{ statusLabel(quotation.status) }}</span>
    </span>
    <span v-if="quotation.first_item" class="mt-1 block truncate text-sm text-slate-600">
      {{ quotation.first_item }}<template v-if="quotation.item_count > 1"> · {{ $t('app.notifications.moreItems', { count: quotation.item_count - 1 }) }}</template>
    </span>
    <span class="mt-1 block text-xs text-slate-400">{{ timeAgo(quotation.updated_at) }}</span>
  </NuxtLink>
</template>
