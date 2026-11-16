<script setup lang="ts">
import {toast} from 'vue-sonner'
import {ArrowDown, ArrowUp, ImagePlus, Loader2, Save, Trash2} from 'lucide-vue-next'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {useLandingGalleryService, type LandingGallery} from '~/services/landing-gallery.service'

defineProps<{ canEdit: boolean }>()

const MAX = 5
const {getLandingGalleries, createLandingGallery, updateLandingGallery, reorderLandingGalleries, deleteLandingGallery} = useLandingGalleryService()
const {convertToBase64} = useFileToBase64()
const STORAGE_URL = useRuntimeConfig().public.STORAGE_URL

type Row = LandingGallery & { draftTitle: string; draftLink: string }
const rows = ref<Row[]>([])
const loading = ref(true)
const busy = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const toRow = (g: LandingGallery): Row => ({...g, draftTitle: g.title, draftLink: g.link})
const src = (path: string) => (path.startsWith('http') ? path : `${STORAGE_URL}${path}`)
const dirty = (r: Row) => r.draftTitle.trim() !== r.title || r.draftLink.trim() !== r.link
const message = (e: any, fallback: string) => String(e?.message || fallback).replace(/^\[GQL\] Request failed:\s*/, '')

// every change is saved right away, so refresh the hero's cached data in this session too
const changed = () => refreshNuxtData('landing-main-galleries')

onMounted(async () => {
  try {
    rows.value = (await getLandingGalleries()).map(toRow)
  } catch (e: any) {
    toast.error(message(e, 'Gagal memuat main galleries'))
  } finally {
    loading.value = false
  }
})

async function run(action: () => Promise<void>, fallback: string) {
  if (busy.value) return
  busy.value = true
  try {
    await action()
    await changed()
  } catch (e: any) {
    toast.error(message(e, fallback))
  } finally {
    busy.value = false
  }
}

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  await run(async () => {
    rows.value.push(toRow(await createLandingGallery(await convertToBase64(file))))
    toast.success('Gambar berhasil diupload')
  }, 'Gagal mengupload gambar')
}

const saveRow = (r: Row) => run(async () => {
  Object.assign(r, toRow(await updateLandingGallery(r.id, r.draftTitle.trim(), r.draftLink.trim())))
  toast.success('Gallery berhasil disimpan')
}, 'Gagal menyimpan gallery')

const moveRow = (i: number, dir: number) => run(async () => {
  const ids = rows.value.map(r => r.id)
  const j = i + dir
  ;[ids[i], ids[j]] = [ids[j]!, ids[i]!]
  const saved = await reorderLandingGalleries(ids)
  // keep unsaved title/link edits while the rows change places
  const drafts = new Map(rows.value.map(r => [r.id, r]))
  rows.value = saved.map(g => ({...toRow(g), draftTitle: drafts.get(g.id)?.draftTitle ?? g.title, draftLink: drafts.get(g.id)?.draftLink ?? g.link}))
}, 'Gagal mengubah urutan')

const removeRow = (r: Row) => {
  if (!window.confirm('Hapus gambar ini dari main galleries?')) return
  return run(async () => {
    await deleteLandingGallery(r.id)
    rows.value = rows.value.filter(x => x.id !== r.id)
    toast.success('Gambar berhasil dihapus')
  }, 'Gagal menghapus gambar')
}
</script>

<template>
  <FormsFormSection
    title="Main Galleries"
    description="Gambar promo atau info yang tampil di hero paling atas landing page, bertumpuk seperti kipas. Setiap perubahan langsung tersimpan dan berlaku di website."
  >
    <div class="space-y-3">
      <div class="flex items-center justify-between gap-2">
        <p class="text-sm font-medium">{{ rows.length }} / {{ MAX }} gambar</p>
        <template v-if="canEdit">
          <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/heic,.heic" class="hidden" @change="onFile">
          <Button type="button" variant="outline" size="sm" :disabled="busy || loading || rows.length >= MAX" @click="fileInput?.click()">
            <Loader2 v-if="busy" class="size-4 animate-spin"/>
            <ImagePlus v-else class="size-4"/>
            Upload gambar
          </Button>
        </template>
      </div>

      <p v-if="loading" class="text-sm text-muted-foreground">Memuat…</p>
      <p v-else-if="!rows.length" class="text-sm text-muted-foreground">Belum ada gambar. Hero landing page tampil tanpa gallery.</p>

      <div v-for="(row, i) in rows" :key="row.id" class="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center">
        <img :src="src(row.image)" alt="" class="size-20 shrink-0 rounded object-cover">
        <div class="grid min-w-0 flex-1 gap-2">
          <p class="text-xs text-muted-foreground">{{ i === 0 ? 'Paling depan' : `Layer ${i + 1}` }}</p>
          <Input v-model="row.draftTitle" placeholder="Judul (opsional), tampil di bawah gambar" maxlength="120" :aria-label="`Judul gambar ${i + 1}`" :disabled="!canEdit || busy" @keydown.enter.prevent="dirty(row) && saveRow(row)"/>
          <Input v-model="row.draftLink" placeholder="Link saat diklik (opsional): /product atau https://…" :aria-label="`Link gambar ${i + 1}`" :disabled="!canEdit || busy" @keydown.enter.prevent="dirty(row) && saveRow(row)"/>
        </div>
        <div v-if="canEdit" class="flex shrink-0 items-center gap-1">
          <Button type="button" variant="outline" size="icon" aria-label="Simpan judul dan link" :disabled="busy || !dirty(row)" @click="saveRow(row)">
            <Save class="size-4"/>
          </Button>
          <Button type="button" variant="ghost" size="icon" aria-label="Naikkan" :disabled="busy || i === 0" @click="moveRow(i, -1)">
            <ArrowUp class="size-4"/>
          </Button>
          <Button type="button" variant="ghost" size="icon" aria-label="Turunkan" :disabled="busy || i === rows.length - 1" @click="moveRow(i, 1)">
            <ArrowDown class="size-4"/>
          </Button>
          <Button type="button" variant="ghost" size="icon" aria-label="Hapus" :disabled="busy" @click="removeRow(row)">
            <Trash2 class="size-4"/>
          </Button>
        </div>
      </div>

      <p class="text-xs text-muted-foreground">Maksimal {{ MAX }} gambar, disarankan persegi (1:1). Gambar dikonversi otomatis ke WebP. Yang pertama tampil paling depan.</p>
    </div>
  </FormsFormSection>
</template>
