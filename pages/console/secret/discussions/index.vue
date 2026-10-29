<template>
  <div>
    <AppBreadcrumb/>
    <AppTableHeader :pageTitle="pageTitle"/>

    <div class="mt-2 flex gap-2">
      <Button
          v-for="tab in tabs"
          :key="tab.value"
          size="sm"
          :variant="unreadOnly === tab.value ? 'default' : 'outline'"
          @click="unreadOnly = tab.value"
      >
        {{ tab.label }}
      </Button>
    </div>

    <div class="mt-4">
      <div v-if="error" class="py-4 text-center text-red-500">{{ error }}</div>
      <div v-else-if="loading && !threads.length" class="py-8 text-center text-sm text-muted-foreground">Memuat diskusi…</div>
      <div v-else-if="!threads.length" class="py-8 text-center text-sm text-muted-foreground">
        {{ unreadOnly ? 'Tidak ada diskusi yang belum dibaca.' : 'Belum ada diskusi.' }}
      </div>
      <ul v-else class="divide-y rounded-lg border bg-background">
        <li v-for="thread in threads" :key="`${thread.subject_type}:${thread.subject_id}`">
          <NuxtLink
              :to="`/console/secret/orders/${thread.subject_id}/detail`"
              class="flex items-start gap-3 px-4 py-3 hover:bg-muted/50"
          >
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="font-semibold" :class="{ 'text-primary': thread.unread > 0 }">{{ thread.label }}</span>
                <span class="truncate text-sm text-muted-foreground">{{ thread.customer_name }}</span>
              </div>
              <p class="mt-0.5 truncate text-sm" :class="thread.unread > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'">
                <span>{{ thread.last_message.author_role === 'staff' ? `${thread.last_message.author_name} (admin)` : thread.last_message.author_name }}:</span>
                {{ thread.last_message.message || thread.last_message.attachment?.file_name }}
              </p>
            </div>
            <div class="flex shrink-0 flex-col items-end gap-1">
              <span class="text-xs text-muted-foreground">{{ formatTime(thread.last_message.created_at) }}</span>
              <span
                  v-if="thread.unread > 0"
                  class="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white"
              >
                {{ thread.unread > 99 ? '99+' : thread.unread }}
              </span>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import AppBreadcrumb from '~/components/elements/AppBreadcrumb.vue'
import AppTableHeader from '~/components/elements/AppTableHeader.vue'
import {Button} from '~/components/ui/button'
import {useDiscussionInbox, useDiscussionIncoming} from '~/services/discussion.service'

const pageTitle = 'Discussion'
const tabs = [
  {label: 'Semua', value: false},
  {label: 'Belum dibaca', value: true},
]
const unreadOnly = ref(false)
const {threads, loading, error, load} = useDiscussionInbox()
const reload = () => load(unreadOnly.value)

const {start} = useDiscussionIncoming(reload)
onMounted(() => {
  reload()
  start(reload)
})
watch(unreadOnly, reload)

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})

useHead({title: pageTitle})

definePageMeta({
  layout: 'console-secret'
})
</script>
