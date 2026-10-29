<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ImagePlus, Loader2, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useFileToBase64 } from '~/composables/useFileToBase64'

// shared by product galleries (`image`) and portfolio galleries (`file`); the src field must hold a displayable url
type GalleryItem = { id: string | number; orders: number; _raw?: string; [key: string]: any }

const props = withDefaults(defineProps<{
  modelValue: GalleryItem[]
  disabled?: boolean
  imageKey?: string
  title?: string
}>(), { imageKey: 'image', title: 'Galleries' })

const emit = defineEmits<{
  (e: 'update:modelValue', v: GalleryItem[]): void
}>()

// ids of galleries that already exist in the DB and were removed here; the parent deletes them on save
const removedIds = defineModel<string[]>('removedIds', { default: () => [] })

const isPersisted = (g: GalleryItem) => /^\d+$/.test(String(g.id ?? ''))

// orders always mirror the position in the grid (1-based)
const renumber = (items: GalleryItem[]) => items.map((g, i) => ({ ...g, orders: i + 1 }))

const list = ref<GalleryItem[]>([])
watch(
  () => props.modelValue,
  (v) => {
    if (v === list.value) return
    list.value = renumber([...(v || [])].sort((a, b) => Number(a.orders) - Number(b.orders)))
  },
  { immediate: true },
)
const commit = (items: GalleryItem[]) => {
  list.value = renumber(items)
  emit('update:modelValue', list.value)
}

// upload area
const fileInput = ref<HTMLInputElement>()
const dragOver = ref(false)
const processing = ref(0)

async function addFiles(files: FileList | File[] | null | undefined) {
  if (!files || props.disabled) return
  const images = Array.from(files).filter(f => f.type.startsWith('image/'))
  const skipped = Array.from(files).length - images.length
  if (skipped > 0) toast.error(`${skipped} file bukan gambar dan dilewati`)
  if (!images.length) return

  processing.value += images.length
  const { convertToBase64 } = useFileToBase64()
  const added: GalleryItem[] = []
  for (const file of images) {
    try {
      const dataUrl = await convertToBase64(file)
      const comma = dataUrl.indexOf(',')
      added.push({
        id: `new-${Math.random().toString(36).slice(2)}`,
        [props.imageKey]: dataUrl,
        _raw: comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl,
        orders: 0,
      })
    } catch {
      toast.error(`Gagal membaca ${file.name}`)
    } finally {
      processing.value--
    }
  }
  commit([...list.value, ...added])
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  // tile reordering also uses drag events; only accept real files here
  if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files)
}

function onPick(e: Event) {
  const input = e.target as HTMLInputElement
  addFiles(input.files)
  input.value = ''
}

function removeItem(idx: number) {
  const item = list.value[idx]
  if (item && isPersisted(item) && !removedIds.value.includes(String(item.id))) {
    removedIds.value = [...removedIds.value, String(item.id)]
  }
  commit(list.value.filter((_, i) => i !== idx))
}

// drag tiles to reorder
const dragIndex = ref<number | null>(null)
const overIndex = ref<number | null>(null)

function onTileDragStart(idx: number, e: DragEvent) {
  dragIndex.value = idx
  e.dataTransfer?.setData('text/plain', String(idx))
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function onTileDrop(idx: number) {
  const from = dragIndex.value
  dragIndex.value = null
  overIndex.value = null
  if (from == null || from === idx) return
  const items = [...list.value]
  const [moved] = items.splice(from, 1)
  items.splice(idx, 0, moved)
  commit(items)
}

const busy = computed(() => processing.value > 0)
</script>

<template>
  <div class="w-full space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h3 class="font-bold">{{ title }}</h3>
      <span class="text-xs text-muted-foreground">{{ list.length }} gambar</span>
    </div>

    <!-- upload area -->
    <div
      v-if="!disabled"
      role="button"
      tabindex="0"
      class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors"
      :class="dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/60 hover:bg-muted/40'"
      @click="fileInput?.click()"
      @keydown.enter.prevent="fileInput?.click()"
      @keydown.space.prevent="fileInput?.click()"
      @dragover.prevent="dragIndex === null && (dragOver = true)"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
    >
      <Loader2 v-if="busy" class="size-8 animate-spin text-muted-foreground" />
      <ImagePlus v-else class="size-8 text-muted-foreground" />
      <p class="text-sm font-medium">
        {{ busy ? 'Memproses gambar…' : 'Tarik & lepas gambar ke sini, atau klik untuk memilih' }}
      </p>
      <p class="text-xs text-muted-foreground">Bisa pilih banyak sekaligus. Urutan mengikuti posisi, geser kartu untuk mengubah.</p>
      <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onPick" />
    </div>

    <p v-if="list.length === 0" class="text-sm text-muted-foreground">Belum ada gambar gallery.</p>

    <!-- thumbnails, sorted by order -->
    <div v-else class="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      <div
        v-for="(g, idx) in list"
        :key="g.id"
        class="group relative aspect-square overflow-hidden rounded-lg border bg-muted/30 transition"
        :class="[
          !disabled && 'cursor-grab active:cursor-grabbing',
          dragIndex === idx && 'opacity-40',
          overIndex === idx && dragIndex !== idx && 'ring-2 ring-primary',
        ]"
        :draggable="!disabled"
        @dragstart="onTileDragStart(idx, $event)"
        @dragend="dragIndex = null; overIndex = null"
        @dragover.prevent.stop="dragIndex !== null && (overIndex = idx)"
        @drop.prevent.stop="onTileDrop(idx)"
      >
        <img :src="g[imageKey]" :alt="`Gallery ${g.orders}`" class="size-full object-cover" draggable="false" />
        <span class="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-xs font-semibold text-white">
          {{ g.orders }}
        </span>
        <button
          v-if="!disabled"
          type="button"
          class="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-md bg-destructive text-white opacity-90 shadow hover:opacity-100"
          :aria-label="`Hapus gambar ${g.orders}`"
          @click.stop="removeItem(idx)"
        >
          <Trash2 class="size-4" />
        </button>
      </div>
    </div>
  </div>
</template>
