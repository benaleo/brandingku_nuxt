<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { MessagesSquare, X } from 'lucide-vue-next'
import { useDiscussionService } from '~/services/discussion.service'
import type { DiscussionRole, DiscussionSubject } from '~/types/discussion.type'

// Floating button that opens a record's discussion, with the viewer's unread count on it.
// Phones get the thread as a full-screen modal, larger screens a floating panel.
const props = defineProps<{ subjectType: DiscussionSubject; subjectId: number; viewer: DiscussionRole; label: string }>()

const { t } = useI18n()
const open = ref(false)
const unread = useDiscussionUnread(props.subjectType, () => props.subjectId)

// new messages from the other side raise the count while the thread is not on screen
const { listen } = useDiscussionService(props.subjectType, () => props.subjectId)
onMounted(() => {
  unread.refresh()
  listen((added) => {
    for (const m of added) if (m.author_role !== props.viewer) unread.bump()
  })
})

// below Tailwind's sm the thread takes the whole screen and the page behind it stays put
const isPhone = ref(false)
let phoneQuery: MediaQueryList | null = null
const syncPhone = () => { isPhone.value = !!phoneQuery?.matches }
onMounted(() => {
  phoneQuery = window.matchMedia('(max-width: 639px)')
  syncPhone()
  phoneQuery.addEventListener('change', syncPhone)
})
const onEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') open.value = false }
watch([open, isPhone], ([shown, phone]) => {
  document.body.style.overflow = shown && phone ? 'hidden' : ''
  if (shown) window.addEventListener('keydown', onEscape)
  else window.removeEventListener('keydown', onEscape)
})
onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onEscape)
  phoneQuery?.removeEventListener('change', syncPhone)
})
</script>

<template>
  <div class="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 [.has-bottom-bar_&]:bottom-24 lg:[.has-bottom-bar_&]:bottom-5">
    <div
      v-if="open"
      role="dialog"
      :aria-modal="isPhone ? 'true' : undefined"
      :aria-label="`${t('app.discussion.title')} ${label}`"
      class="flex flex-col overflow-hidden bg-background max-sm:fixed max-sm:inset-0 sm:h-[520px] sm:w-[92vw] sm:max-w-sm sm:rounded-2xl sm:border sm:shadow-2xl"
    >
      <div class="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
        <div class="flex flex-col">
          <span class="font-semibold">{{ t('app.discussion.title') }}</span>
          <span class="text-xs opacity-80">{{ label }}</span>
        </div>
        <button class="text-primary-foreground/80 hover:text-primary-foreground" :aria-label="t('app.common.close')" @click="open = false">
          <X class="size-5" />
        </button>
      </div>
      <ElementsDiscussionThread
        embedded
        :subject-type="subjectType"
        :subject-id="subjectId"
        :viewer="viewer"
        class="mx-auto min-h-0 w-full max-w-3xl flex-1 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      />
    </div>

    <!-- on phones it hides under the open modal, which closes from its header -->
    <button
      type="button"
      class="relative size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition hover:scale-105"
      :class="open ? 'hidden sm:flex' : 'flex'"
      :aria-label="unread.count.value > 0 ? `${t('app.discussion.title')} ${label} (${unread.count.value})` : `${t('app.discussion.title')} ${label}`"
      :aria-expanded="open"
      @click="open = !open"
    >
      <MessagesSquare class="size-6" />
      <span
        v-if="unread.count.value > 0 && !open"
        class="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white"
      >
        {{ unread.count.value > 9 ? '9+' : unread.count.value }}
      </span>
    </button>
  </div>
</template>
