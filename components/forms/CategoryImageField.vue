<script setup lang="ts">
import { ref } from 'vue'
import { ImagePlus, X } from 'lucide-vue-next'

// one image slot of a product category (list card, detail cover or landing page)
const props = defineProps<{
  label: string
  hint: string
  preview: string
  disabled?: boolean
  aspect?: string
}>()

const emit = defineEmits<{
  (e: 'select', file: File): void
  (e: 'remove'): void
}>()

const input = ref<HTMLInputElement | null>(null)
const isImage = (f?: File) => !!f && (f.type.startsWith('image/') || /\.hei[cf]$/i.test(f.name))

const pick = (f?: File) => {
  if (isImage(f)) emit('select', f as File)
}
const onChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  pick(target.files?.[0])
  target.value = ''
}
</script>

<template>
  <div class="min-w-0 space-y-2">
    <div>
      <p class="text-sm font-medium">{{ props.label }}</p>
      <p class="text-xs text-muted-foreground">{{ props.hint }}</p>
    </div>
    <div
      class="relative flex items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 text-center transition-colors"
      :class="[props.aspect || 'aspect-video', props.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-gray-400']"
      @click="!props.disabled && input?.click()"
      @dragover.prevent
      @drop.prevent="(e) => !props.disabled && pick(e.dataTransfer?.files?.[0])"
    >
      <input ref="input" type="file" accept="image/*,.heic,.heif" class="hidden" :disabled="props.disabled" @change="onChange" />
      <img v-if="props.preview" :src="props.preview" :alt="props.label" class="size-full object-contain" />
      <div v-else class="space-y-1 p-4">
        <ImagePlus class="mx-auto size-8 text-gray-400" />
        <p class="text-sm text-gray-600">Tarik & lepas atau klik untuk memilih</p>
        <p class="text-xs text-gray-500">PNG, JPG, WEBP, HEIC</p>
      </div>
      <button
        v-if="props.preview && !props.disabled"
        type="button"
        class="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
        :aria-label="`Hapus ${props.label}`"
        @click.stop="emit('remove')"
      >
        <X class="size-4" />
      </button>
    </div>
  </div>
</template>
