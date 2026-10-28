<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { FileText, Loader2, MessagesSquare, Paperclip, Send, X } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useDiscussionService } from '~/services/discussion.service'
import type { DiscussionAttachment, DiscussionMessage, DiscussionRole, DiscussionSubject } from '~/types/discussion.type'

// viewer: the side the current page writes as; its messages sit on the right
const props = defineProps<{ subjectType: DiscussionSubject; subjectId: number; viewer: DiscussionRole }>()

const MAX_LENGTH = 2000
// the backend refuses larger files; pictures are converted to WebP there
const MAX_FILE_MB = 5
const { t, locale } = useI18n()
const STORAGE_URL = useRuntimeConfig().public.STORAGE_URL
const { convertToBase64 } = useFileToBase64()
const inputId = useId()
const { messages, loading, sending, load, post, listen } = useDiscussionService(props.subjectType, () => props.subjectId)

const draft = ref('')
const loadFailed = ref(false)
const listEl = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const pickedFile = ref<File | null>(null)
const pickedPreview = ref('')
// covers reading the file before the request starts
const busy = ref(false)
const canSend = computed(() => !busy.value && !sending.value && (!!draft.value.trim() || !!pickedFile.value))

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

const dropPreview = () => {
  if (pickedPreview.value) URL.revokeObjectURL(pickedPreview.value)
  pickedPreview.value = ''
}
const clearFile = () => {
  dropPreview()
  pickedFile.value = null
}
onBeforeUnmount(dropPreview)

const pickFile = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  // lets the same file be picked again after removing it
  input.value = ''
  if (!file) return
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    toast.error(t('app.discussion.fileTooLarge', { max: MAX_FILE_MB }))
    return
  }
  clearFile()
  pickedFile.value = file
  if (file.type.startsWith('image/')) pickedPreview.value = URL.createObjectURL(file)
}

const send = async () => {
  if (!canSend.value) return
  const text = draft.value.trim()
  const file = pickedFile.value
  busy.value = true
  try {
    const attachment = file ? { file_name: file.name, content_type: file.type || undefined, content: await convertToBase64(file) } : undefined
    await post(text, attachment)
    draft.value = ''
    clearFile()
    scrollToEnd()
  } catch {
    toast.error(t('app.discussion.sendFailed'))
  } finally {
    busy.value = false
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
const formatSize = (bytes: number) => {
  const fmt = new Intl.NumberFormat(locale.value === 'en' ? 'en-US' : 'id-ID', { maximumFractionDigits: 1 })
  return bytes >= 1024 * 1024 ? `${fmt.format(bytes / 1024 / 1024)} MB` : `${fmt.format(Math.max(1, Math.round(bytes / 1024)))} KB`
}
const isImage = (a: DiscussionAttachment) => a.content_type.startsWith('image/')
const fileUrl = (a: DiscussionAttachment) => (a.path.startsWith('http') ? a.path : `${STORAGE_URL}${a.path}`)

// a picture opens in a popup over the thread
const viewing = ref<DiscussionAttachment | null>(null)
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
          <div
            class="rounded-2xl"
            :class="[
              isMine(m) ? 'rounded-br-sm bg-green-600 text-white' : 'rounded-bl-sm border bg-background text-foreground',
              m.attachment && isImage(m.attachment) && !m.message ? 'p-1' : 'px-3 py-2',
            ]"
          >
            <!-- pictures show as a thumbnail that opens the full WebP in a popup -->
            <button
              v-if="m.attachment && isImage(m.attachment)"
              type="button"
              class="block cursor-zoom-in overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              :aria-label="$t('app.discussion.viewImage', { name: m.attachment.file_name })"
              @click="viewing = m.attachment"
            >
              <img :src="fileUrl(m.attachment)" :alt="m.attachment.file_name" loading="lazy" class="max-h-56 w-auto max-w-full object-cover">
            </button>
            <a
              v-else-if="m.attachment"
              :href="fileUrl(m.attachment)"
              target="_blank"
              rel="noopener"
              class="-mx-1 flex items-center gap-2 rounded-lg p-2"
              :class="isMine(m) ? 'bg-white/15 hover:bg-white/25' : 'bg-muted hover:bg-muted/70'"
            >
              <FileText class="size-6 shrink-0" />
              <span class="min-w-0">
                <span class="block truncate font-medium">{{ m.attachment.file_name }}</span>
                <span class="text-xs opacity-80">{{ formatSize(m.attachment.size) }}</span>
              </span>
            </a>
            <p v-if="m.message" class="whitespace-pre-wrap break-words" :class="m.attachment && 'mt-2'">{{ m.message }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="pickedFile" class="mt-3 flex items-center gap-3 rounded-lg border bg-muted/40 p-2">
      <!-- formats the browser cannot preview (e.g. HEIC) fall back to the file icon -->
      <img v-if="pickedPreview" :src="pickedPreview" alt="" class="size-14 shrink-0 rounded-md object-cover" @error="dropPreview">
      <FileText v-else class="size-8 shrink-0 text-muted-foreground" />
      <div class="min-w-0 flex-1">
        <p class="truncate font-medium">{{ pickedFile.name }}</p>
        <p class="text-xs text-muted-foreground">{{ formatSize(pickedFile.size) }}</p>
      </div>
      <button
        type="button"
        class="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
        :disabled="busy || sending"
        :aria-label="$t('app.discussion.removeFile')"
        @click="clearFile"
      >
        <X class="size-4" />
      </button>
    </div>

    <form class="mt-3 flex items-end gap-2" @submit.prevent="send">
      <input ref="fileInput" type="file" class="sr-only" tabindex="-1" aria-hidden="true" @change="pickFile">
      <Button
        type="button"
        variant="outline"
        size="icon"
        class="shrink-0"
        :disabled="busy || sending"
        :aria-label="$t('app.discussion.attach')"
        :title="$t('app.discussion.attach')"
        @click="fileInput?.click()"
      >
        <Paperclip class="size-4" />
      </Button>
      <label :for="inputId" class="sr-only">{{ $t('app.discussion.placeholder') }}</label>
      <!-- Enter sends, Shift+Enter adds a line; grows with the text up to the max height -->
      <textarea
        :id="inputId"
        v-model="draft"
        rows="2"
        :maxlength="MAX_LENGTH"
        :placeholder="$t('app.discussion.placeholder')"
        :disabled="busy || sending"
        class="field-sizing-content max-h-40 min-h-16 min-w-0 flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-base leading-6 shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 md:text-sm"
        @keydown.enter="onEnter"
      />
      <Button type="submit" size="icon" class="shrink-0 bg-green-600 hover:bg-green-700" :disabled="!canSend" :aria-label="$t('app.discussion.send')">
        <Loader2 v-if="busy || sending" class="size-4 animate-spin" />
        <Send v-else class="size-4" />
      </Button>
    </form>
    <p class="mt-1 text-[11px] text-muted-foreground">{{ $t('app.discussion.enterHint', { max: MAX_FILE_MB }) }}</p>

    <Dialog :open="!!viewing" @update:open="(open: boolean) => { if (!open) viewing = null }">
      <DialogContent class="max-w-[calc(100%-2rem)] gap-3 p-3 sm:max-w-3xl">
        <DialogTitle class="truncate pr-8 text-sm font-medium">{{ viewing?.file_name }}</DialogTitle>
        <DialogDescription class="sr-only">{{ $t('app.discussion.imageDialog') }}</DialogDescription>
        <img
          v-if="viewing"
          :src="fileUrl(viewing)"
          :alt="viewing.file_name"
          class="mx-auto max-h-[75vh] w-auto max-w-full rounded-md object-contain"
        >
      </DialogContent>
    </Dialog>
  </section>
</template>
