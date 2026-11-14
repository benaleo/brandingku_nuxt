<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, X } from 'lucide-vue-next'

// Full-screen preview with arrows, keyboard and pointer swipe. Used by the product
// carousel; it starts on the picture that was clicked and loops in both directions.
const props = defineProps<{
  images: string[]
  open: boolean
  index: number
  alt?: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'update:index', value: number): void
}>()

const current = computed(() => {
  const total = props.images.length
  if (!total) return 0
  return Math.min(Math.max(props.index ?? 0, 0), total - 1)
})
const hasMany = computed(() => props.images.length > 1)

const strip = ref<HTMLElement | null>(null)
const dragX = ref(0)
const dragging = ref(false)
let startX = 0
let startY = 0
let tracking = false

const close = () => emit('update:open', false)
const go = (delta: number) => {
  if (!hasMany.value) return
  const total = props.images.length
  emit('update:index', (current.value + delta + total) % total)
}

const onKeydown = (event: KeyboardEvent) => {
  if (!props.open) return
  if (event.key === 'Escape') close()
  else if (event.key === 'ArrowLeft') go(-1)
  else if (event.key === 'ArrowRight') go(1)
}

const onPointerDown = (event: PointerEvent) => {
  if (!hasMany.value) return
  tracking = true
  dragging.value = true
  startX = event.clientX
  startY = event.clientY
  dragX.value = 0
  ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
}

const onPointerMove = (event: PointerEvent) => {
  if (!tracking) return
  const dx = event.clientX - startX
  const dy = event.clientY - startY
  // ignore a mostly vertical gesture so the page can still scroll behind on touch
  if (Math.abs(dy) > Math.abs(dx) * 1.5) return
  dragX.value = dx
}

const onPointerUp = () => {
  if (!tracking) return
  tracking = false
  dragging.value = false
  const threshold = 50
  if (dragX.value <= -threshold) go(1)
  else if (dragX.value >= threshold) go(-1)
  dragX.value = 0
}

// keep the active thumbnail visible when the picture changes
watch([current, () => props.open], ([index, open]) => {
  if (!open || !strip.value) return
  const item = strip.value.children[index] as HTMLElement | undefined
  item?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
})

watch(
  () => props.open,
  (open) => {
    if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
  },
)

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      @click.self="close"
    >
      <button
        type="button"
        class="absolute right-4 top-4 z-10 inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        :aria-label="$t('app.common.close')"
        @click="close"
      >
        <X class="size-5" />
      </button>

      <button
        v-if="hasMany"
        type="button"
        class="absolute left-3 z-10 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
        :aria-label="$t('app.common.previousImage')"
        @click.stop="go(-1)"
      >
        <ChevronLeft class="size-6" />
      </button>
      <button
        v-if="hasMany"
        type="button"
        class="absolute right-3 z-10 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
        :aria-label="$t('app.common.nextImage')"
        @click.stop="go(1)"
      >
        <ChevronRight class="size-6" />
      </button>

      <figure class="flex max-h-[88vh] max-w-[92vw] select-none flex-col items-center">
        <img
          :src="images[current]"
          :alt="alt || ''"
          draggable="false"
          class="max-h-[68vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
          :style="{
            transform: dragX ? `translateX(${dragX}px)` : 'none',
            transition: dragging ? 'none' : 'transform 150ms ease',
            cursor: hasMany ? 'grab' : 'default',
            touchAction: 'pan-y',
          }"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
        />
        <figcaption class="mt-3 flex w-full flex-col items-center gap-2 text-sm text-white/90">
          <span v-if="hasMany">{{ current + 1 }} / {{ images.length }}</span>
          <!-- thumbnail strip: jump to any picture without closing the preview -->
          <div
            v-if="hasMany"
            ref="strip"
            class="flex max-w-[92vw] items-center gap-2 overflow-x-auto px-1 pb-1"
          >
            <button
              v-for="(image, index) in images"
              :key="index"
              type="button"
              class="shrink-0 overflow-hidden rounded-md transition"
              :class="index === current
                ? 'ring-2 ring-white'
                : 'opacity-60 ring-1 ring-white/30 hover:opacity-100'"
              :aria-label="alt || ''"
              :aria-current="index === current ? 'true' : undefined"
              @click.stop="emit('update:index', index)"
            >
              <img
                :src="image"
                :alt="alt || ''"
                draggable="false"
                class="h-14 w-14 object-cover"
              />
            </button>
          </div>
        </figcaption>
      </figure>
    </div>
  </Teleport>
</template>
