<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { FileText, Upload, X } from 'lucide-vue-next'

// a clearly visible file picker: a dashed drop zone to choose (or drag) files, then the chosen
// files with a thumbnail, size and remove button. The parent validates and owns the files.
const props = withDefaults(defineProps<{
  id: string
  files: File[]
  accept?: string
  multiple?: boolean
  label?: string
  hint?: string
  disabled?: boolean
}>(), { accept: 'image/*,application/pdf' })
const emit = defineEmits<{ pick: [files: File[]]; remove: [index: number] }>()

const input = ref<HTMLInputElement | null>(null)
const dragging = ref(false)

// thumbnails for chosen pictures; URLs are released when their file goes away
const previews = new Map<File, string>()
const previewOf = ref<Record<number, string>>({})
watch(() => props.files, (files) => {
  for (const [file, url] of previews) {
    if (!files.includes(file)) {
      URL.revokeObjectURL(url)
      previews.delete(file)
    }
  }
  const next: Record<number, string> = {}
  files.forEach((f, i) => {
    if (!f.type.startsWith('image/')) return
    if (!previews.has(f)) previews.set(f, URL.createObjectURL(f))
    next[i] = previews.get(f)!
  })
  previewOf.value = next
}, { immediate: true })
onBeforeUnmount(() => previews.forEach(url => URL.revokeObjectURL(url)))

const onChange = () => {
  const picked = Array.from(input.value?.files || [])
  // lets the same file be picked again after removing it
  if (input.value) input.value.value = ''
  if (picked.length) emit('pick', picked)
}
const onDrop = (e: DragEvent) => {
  dragging.value = false
  if (props.disabled) return
  const dropped = Array.from(e.dataTransfer?.files || [])
  if (dropped.length) emit('pick', props.multiple ? dropped : dropped.slice(0, 1))
}
const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
</script>

<template>
  <div>
    <input :id="id" ref="input" type="file" class="peer sr-only" :accept="accept" :multiple="multiple" :disabled="disabled" @change="onChange">
    <!-- the zone stays visible with several files so more can be added -->
    <label
      v-if="!files.length || multiple"
      :for="id"
      class="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-green-600 peer-focus-visible:ring-offset-2"
      :class="[
        dragging ? 'border-green-600 bg-green-50' : 'border-slate-300 bg-slate-50 hover:border-green-600 hover:bg-green-50',
        disabled && 'pointer-events-none opacity-50',
      ]"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
    >
      <span class="flex size-10 items-center justify-center rounded-full bg-green-100 text-green-700"><Upload class="size-5" /></span>
      <span class="text-sm font-semibold text-green-700">{{ label || $t('app.filePick.choose') }}</span>
      <span class="hidden text-xs text-slate-500 md:block">{{ $t('app.filePick.drop') }}</span>
      <span v-if="hint" class="text-xs text-slate-500">{{ hint }}</span>
    </label>

    <ul v-if="files.length" class="space-y-2" :class="multiple && 'mt-2'">
      <li v-for="(f, i) in files" :key="`${f.name}-${f.size}-${i}`" class="flex items-center gap-3 rounded-lg border bg-white p-2">
        <img v-if="previewOf[i]" :src="previewOf[i]" alt="" class="size-12 shrink-0 rounded-md object-cover">
        <span v-else class="flex size-12 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500"><FileText class="size-6" /></span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-medium text-slate-900">{{ f.name }}</span>
          <span class="block text-xs text-slate-500">{{ formatSize(f.size) }}</span>
        </span>
        <label v-if="!multiple" :for="id" class="shrink-0 cursor-pointer text-xs font-semibold text-green-700 hover:underline">{{ $t('app.filePick.change') }}</label>
        <button
          type="button"
          class="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-red-600 disabled:opacity-50"
          :disabled="disabled"
          :aria-label="$t('app.filePick.remove', { name: f.name })"
          @click="emit('remove', i)"
        >
          <X class="size-4" />
        </button>
      </li>
    </ul>
  </div>
</template>
