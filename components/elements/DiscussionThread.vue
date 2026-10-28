<script setup lang="ts">
import { nextTick, onMounted, ref, useId } from 'vue'
import { Loader2, MessagesSquare, Send } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { useDiscussionService } from '~/services/discussion.service'
import type { DiscussionMessage, DiscussionRole, DiscussionSubject } from '~/types/discussion.type'

// viewer: the side the current page writes as; its messages sit on the right
const props = defineProps<{ subjectType: DiscussionSubject; subjectId: number; viewer: DiscussionRole }>()

const MAX_LENGTH = 2000
const { t, locale } = useI18n()
const inputId = useId()
const { messages, loading, sending, load, post, listen } = useDiscussionService(props.subjectType, () => props.subjectId)

const draft = ref('')
const loadFailed = ref(false)
const listEl = ref<HTMLElement | null>(null)

const scrollToEnd = async (onlyIfNear = false) => {
  await nextTick()
  const el = listEl.value
  if (!el) return
  if (onlyIfNear && el.scrollHeight - el.scrollTop - el.clientHeight > 120) return
  el.scrollTop = el.scrollHeight
}

const fetchThread = async () => {
  loadFailed.value = false
  try {
    await load()
    scrollToEnd()
  } catch {
    loadFailed.value = true
  }
}

onMounted(() => {
  fetchThread()
  listen(() => scrollToEnd(true))
})

const send = async () => {
  const text = draft.value.trim()
  if (!text || sending.value) return
  try {
    await post(text)
    draft.value = ''
    scrollToEnd()
  } catch {
    toast.error(t('app.discussion.sendFailed'))
  }
}

const onEnter = (e: KeyboardEvent) => {
  // Shift+Enter and IME composition keep the newline
  if (e.shiftKey || e.isComposing) return
  e.preventDefault()
  send()
}

const isMine = (m: DiscussionMessage) => m.author_role === props.viewer
const authorLabel = (m: DiscussionMessage) => {
  if (props.viewer === 'customer' && m.author_role === 'customer') return t('app.discussion.you')
  return m.author_role === 'staff' ? t('app.discussion.staffName', { name: m.author_name }) : t('app.discussion.customerName', { name: m.author_name })
}
const formatWhen = (iso: string) =>
  new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
</script>

<template>
  <section class="rounded-xl border bg-card p-4 text-sm shadow-sm md:p-5">
    <h2 class="flex items-center gap-2 font-semibold">
      <MessagesSquare class="size-4 text-green-700" /> {{ $t('app.discussion.title') }}
    </h2>
    <p class="mt-1 text-xs text-muted-foreground">
      {{ viewer === 'customer' ? $t('app.discussion.hintCustomer') : $t('app.discussion.hintStaff') }}
    </p>

    <div ref="listEl" class="mt-3 max-h-96 space-y-3 overflow-y-auto rounded-lg bg-muted/50 p-3" aria-live="polite">
      <p v-if="loading && !messages.length" class="flex items-center justify-center gap-2 py-6 text-muted-foreground">
        <Loader2 class="size-4 animate-spin" /> {{ $t('app.discussion.loading') }}
      </p>
      <div v-else-if="loadFailed" class="py-6 text-center text-muted-foreground">
        {{ $t('app.discussion.loadFailed') }}
        <button type="button" class="ml-1 font-medium text-green-700 hover:underline" @click="fetchThread">{{ $t('app.discussion.retry') }}</button>
      </div>
      <p v-else-if="!messages.length" class="py-6 text-center text-muted-foreground">{{ $t('app.discussion.empty') }}</p>
      <div v-for="m in messages" :key="m.id" class="flex" :class="isMine(m) ? 'justify-end' : 'justify-start'">
        <div class="max-w-[85%] min-w-0">
          <p class="mb-0.5 text-[11px] text-muted-foreground" :class="isMine(m) && 'text-right'">
            <span class="font-medium text-foreground">{{ authorLabel(m) }}</span> · {{ formatWhen(m.created_at) }}
          </p>
          <p
            class="whitespace-pre-wrap break-words rounded-2xl px-3 py-2"
            :class="isMine(m) ? 'rounded-br-sm bg-green-600 text-white' : 'rounded-bl-sm border bg-background text-foreground'"
          >{{ m.message }}</p>
        </div>
      </div>
    </div>

    <form class="mt-3 flex items-end gap-2" @submit.prevent="send">
      <label :for="inputId" class="sr-only">{{ $t('app.discussion.placeholder') }}</label>
      <!-- Enter sends, Shift+Enter adds a line; grows with the text up to the max height -->
      <textarea
        :id="inputId"
        v-model="draft"
        rows="2"
        :maxlength="MAX_LENGTH"
        :placeholder="$t('app.discussion.placeholder')"
        :disabled="sending"
        class="field-sizing-content max-h-40 min-h-16 flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-base leading-6 shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 md:text-sm"
        @keydown.enter="onEnter"
      />
      <Button type="submit" size="icon" class="bg-green-600 hover:bg-green-700" :disabled="sending || !draft.trim()" :aria-label="$t('app.discussion.send')">
        <Loader2 v-if="sending" class="size-4 animate-spin" />
        <Send v-else class="size-4" />
      </Button>
    </form>
    <p class="mt-1 text-[11px] text-muted-foreground">{{ $t('app.discussion.enterHint') }}</p>
  </section>
</template>
