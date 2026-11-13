<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { toast } from 'vue-sonner'
import { ArrowLeft, FileSearch, Loader2, RefreshCw, Upload } from 'lucide-vue-next'
import { useProductImportService } from '~/services/product-import.service'
import type {
  ProductImportDryRun,
  ProductImportJob,
  ProductImportReportRow,
} from '~/types/product-import.type'

definePageMeta({ layout: 'console-secret' })
useHead({ title: 'Import Produk' })

const MAX_CATALOG_BYTES = 5 * 1024 * 1024
const MAX_IMAGES_BYTES = 400 * 1024 * 1024

const router = useRouter()
const service = useProductImportService()

const catalogFiles = ref<File[]>([])
const imageFiles = ref<File[]>([])
const checking = ref(false)
const starting = ref(false)
const preview = ref<ProductImportDryRun | null>(null)
const job = ref<ProductImportJob | null>(null)
const uploadError = ref('')

let stopPoll: (() => void) | null = null

const catalog = computed<File | null>(() => catalogFiles.value[0] ?? null)
const images = computed<File | null>(() => imageFiles.value[0] ?? null)
const report = computed(() => job.value?.report ?? null)
const reportRows = computed<ProductImportReportRow[]>(() => report.value?.rows ?? [])

const isRunning = computed(() => job.value?.status === 'queued' || job.value?.status === 'running')
const isFinished = computed(() => job.value?.status === 'done' || job.value?.status === 'failed')
const busy = computed(() => checking.value || starting.value || isRunning.value)

const progressPercent = computed(() => {
  const current = job.value
  if (!current) return 0
  if (current.status === 'done') return 100
  const total = Number(current.total) || 0
  const processed = Number(current.processed) || 0
  if (!total) return 0
  return Math.min(100, Math.max(0, Math.round((processed / total) * 100)))
})

const statusLabel = computed(() => {
  switch (job.value?.status) {
    case 'queued': return 'Menunggu antrean'
    case 'running': return 'Sedang berjalan'
    case 'done': return 'Selesai'
    case 'failed': return 'Gagal'
    default: return 'Belum dimulai'
  }
})

const jobStatusClass = computed(() => {
  switch (job.value?.status) {
    case 'done': return 'border-transparent bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
    case 'failed': return 'border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
    case 'running': return 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
    default: return 'border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }
})

// the report is authoritative once available; live counters keep the cards useful while running
const summary = computed(() => {
  const source = report.value ?? job.value
  return {
    created: source?.created ?? 0,
    updated: source?.updated ?? 0,
    failed: source?.failed ?? 0,
    imagesUploaded: source?.images_uploaded ?? 0,
    imagesFailed: source?.images_failed ?? 0,
  }
})

const ACTION_LABELS: Record<ProductImportReportRow['action'], string> = {
  created: 'Dibuat',
  updated: 'Diperbarui',
  failed: 'Gagal',
}

const actionLabel = (action: ProductImportReportRow['action']) => ACTION_LABELS[action] ?? action

const actionClass = (action: ProductImportReportRow['action']) => {
  if (action === 'created') return 'border-transparent bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
  if (action === 'updated') return 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
  return 'border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
}

// the proxy forwards the backend's Indonesian `{ error }` message; fall back to the shared mapper
const importErrorMessage = (error: unknown): string => {
  const data = (error as { data?: { error?: unknown } } | null)?.data
  const message = data?.error
  if (typeof message === 'string' && message.trim()) return message
  return getErrorMessage(error)
}

const formatDuration = (ms: number) => {
  if (!Number.isFinite(ms) || ms <= 0) return '—'
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return `${seconds} detik`
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return rest ? `${minutes} menit ${rest} detik` : `${minutes} menit`
}

const stopPolling = () => {
  stopPoll?.()
  stopPoll = null
}

const clearResult = () => {
  stopPolling()
  preview.value = null
  job.value = null
  uploadError.value = ''
}

const pickCatalog = (files: File[]) => {
  const file = files[0]
  if (!file) return
  if (!/\.xlsx$/i.test(file.name)) {
    toast.error('File katalog harus berformat .xlsx')
    return
  }
  if (file.size > MAX_CATALOG_BYTES) {
    toast.error('Ukuran file Excel maksimal 5 MB')
    return
  }
  catalogFiles.value = [file]
  clearResult()
}

const pickImages = (files: File[]) => {
  const file = files[0]
  if (!file) return
  if (!/\.zip$/i.test(file.name)) {
    toast.error('File gambar harus berformat .zip')
    return
  }
  if (file.size > MAX_IMAGES_BYTES) {
    toast.error('Ukuran file ZIP maksimal 400 MB')
    return
  }
  imageFiles.value = [file]
  clearResult()
}

const removeCatalog = () => {
  catalogFiles.value = []
  clearResult()
}

const removeImages = () => {
  imageFiles.value = []
  clearResult()
}

// dry run: only the spreadsheet is sent, so a 400 MB ZIP is not uploaded just to validate
const check = async () => {
  const file = catalog.value
  if (!file || busy.value) return
  checking.value = true
  clearResult()
  try {
    const result = await service.upload({ catalog: file, dryRun: true })
    preview.value = result
    toast.success(`File valid: ${result.total} baris pada sheet "${result.sheet}"`)
  } catch (error) {
    uploadError.value = importErrorMessage(error)
    toast.error(uploadError.value)
  } finally {
    checking.value = false
  }
}

const onJobUpdate = (next: ProductImportJob) => {
  job.value = next
  if (next.status === 'done') {
    stopPoll = null
    toast.success(`Impor selesai: ${next.created} dibuat, ${next.updated} diperbarui, ${next.failed} gagal.`)
  } else if (next.status === 'failed') {
    stopPoll = null
    toast.error(next.error || 'Impor gagal diproses.')
  }
}

const startImport = async () => {
  const file = catalog.value
  if (!file || busy.value) return
  starting.value = true
  clearResult()
  try {
    const result = await service.upload({ catalog: file, images: images.value })
    job.value = {
      id: result.job_id,
      status: result.status,
      stage: 'Menunggu antrean',
      total: 0,
      processed: 0,
      created: 0,
      updated: 0,
      failed: 0,
      images_uploaded: 0,
      images_failed: 0,
      error: '',
      started_at: '',
      finished_at: '',
      report: null,
    }
    toast.success('Impor dimulai. Proses berjalan di latar belakang.')
    const handle = service.poll(result.job_id, onJobUpdate, {
      onError: (error) => {
        stopPoll = null
        uploadError.value = error instanceof Error && error.message
          ? error.message
          : importErrorMessage(error)
        toast.error(uploadError.value)
      },
    })
    stopPoll = handle.stop
  } catch (error) {
    uploadError.value = importErrorMessage(error)
    toast.error(uploadError.value)
  } finally {
    starting.value = false
  }
}

const resetAll = () => {
  clearResult()
  catalogFiles.value = []
  imageFiles.value = []
}

onBeforeUnmount(stopPolling)
</script>

<template>
  <div class="space-y-6">
    <AppBreadcrumb />

    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">Import Produk dari Excel</h1>
        <p class="mt-1 max-w-3xl text-sm text-muted-foreground">
          Unggah satu file Excel berisi daftar produk, dan bila perlu satu file ZIP berisi gambar produk.
          Proses berjalan di latar belakang, jadi halaman ini boleh ditinggalkan setelah unggahan selesai.
        </p>
      </div>
      <UiButton variant="outline" as-child>
        <NuxtLink to="/console/secret/products">
          <ArrowLeft class="size-4" /> Kembali ke Produk
        </NuxtLink>
      </UiButton>
    </div>

    <UiCard>
      <UiCardHeader>
        <UiCardTitle>1. Pilih berkas</UiCardTitle>
        <UiCardDescription>
          File Excel wajib berformat .xlsx (maks. 5 MB). ZIP gambar opsional (maks. 400 MB).
          Kolom <code class="rounded bg-muted px-1 py-0.5 text-xs">product_code</code> dipakai sebagai slug produk,
          sedangkan harga tidak diimpor dari file ini.
        </UiCardDescription>
      </UiCardHeader>
      <UiCardContent class="space-y-6">
        <div class="grid gap-6 md:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-medium">
              Katalog produk <span class="text-destructive">*</span>
            </p>
            <ElementsFilePickField
              id="import-catalog"
              :files="catalogFiles"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              label="Pilih file Excel"
              hint="Format .xlsx, maks. 5 MB"
              :disabled="busy"
              @pick="pickCatalog"
              @remove="removeCatalog"
            />
          </div>
          <div class="space-y-2">
            <p class="text-sm font-medium">
              Gambar produk <span class="font-normal text-muted-foreground">(opsional)</span>
            </p>
            <ElementsFilePickField
              id="import-images"
              :files="imageFiles"
              accept=".zip,application/zip,application/x-zip-compressed"
              label="Pilih file ZIP gambar"
              hint="Format .zip, maks. 400 MB"
              :disabled="busy"
              @pick="pickImages"
              @remove="removeImages"
            />
            <p class="text-xs text-muted-foreground">
              Nama file di dalam ZIP harus sama dengan nilai kolom gambar pada sheet Excel.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UiButton variant="outline" :disabled="!catalog || busy" @click="check">
            <Loader2 v-if="checking" class="size-4 animate-spin" />
            <FileSearch v-else class="size-4" />
            {{ checking ? 'Memeriksa…' : 'Cek File' }}
          </UiButton>
          <UiButton variant="primary" :disabled="!catalog || busy" @click="startImport">
            <Loader2 v-if="starting || isRunning" class="size-4 animate-spin" />
            <Upload v-else class="size-4" />
            {{ starting ? 'Mengunggah…' : isRunning ? 'Mengimpor…' : 'Mulai Import' }}
          </UiButton>
          <span class="text-xs text-muted-foreground">
            &quot;Cek File&quot; hanya memvalidasi isi Excel, belum menyimpan apa pun.
          </span>
        </div>

        <p
          v-if="uploadError"
          role="alert"
          class="rounded-lg border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {{ uploadError }}
        </p>
      </UiCardContent>
    </UiCard>

    <UiCard v-if="preview">
      <UiCardHeader>
        <UiCardTitle>2. Pratinjau file</UiCardTitle>
        <UiCardDescription>
          Sheet <span class="font-medium text-foreground">{{ preview.sheet }}</span> ·
          {{ preview.total }} baris produk terdeteksi. Hanya baris pertama yang ditampilkan di bawah ini.
        </UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <p v-if="!preview.preview.length" class="text-sm text-muted-foreground">
          Tidak ada baris produk pada file ini.
        </p>
        <div v-else class="overflow-hidden rounded-lg border">
          <UiTable>
            <UiTableHeader>
              <UiTableRow>
                <UiTableHead class="w-16">Baris</UiTableHead>
                <UiTableHead>Kode</UiTableHead>
                <UiTableHead>Nama</UiTableHead>
                <UiTableHead>Kategori</UiTableHead>
                <UiTableHead>Subkategori</UiTableHead>
                <UiTableHead class="text-right">Gambar</UiTableHead>
                <UiTableHead class="text-right">Branding</UiTableHead>
              </UiTableRow>
            </UiTableHeader>
            <UiTableBody>
              <UiTableRow v-for="row in preview.preview" :key="row.line">
                <UiTableCell class="text-muted-foreground">{{ row.line }}</UiTableCell>
                <UiTableCell class="font-mono text-xs">{{ row.code }}</UiTableCell>
                <UiTableCell class="font-medium">{{ row.name }}</UiTableCell>
                <UiTableCell>{{ row.category }}</UiTableCell>
                <UiTableCell>{{ row.subcategory }}</UiTableCell>
                <UiTableCell class="text-right">{{ row.galleries }}</UiTableCell>
                <UiTableCell class="text-right">{{ row.brandings }}</UiTableCell>
              </UiTableRow>
            </UiTableBody>
          </UiTable>
        </div>
      </UiCardContent>
    </UiCard>

    <UiCard v-if="job">
      <UiCardHeader>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <UiCardTitle>{{ isFinished ? '3. Hasil import' : '3. Progres import' }}</UiCardTitle>
            <UiCardDescription>
              ID pekerjaan: <span class="font-mono text-xs">{{ job.id }}</span>
            </UiCardDescription>
          </div>
          <UiBadge :class="jobStatusClass">{{ statusLabel }}</UiBadge>
        </div>
      </UiCardHeader>
      <UiCardContent class="space-y-6">
        <div
          v-if="job.status === 'failed'"
          role="alert"
          class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          <p class="font-semibold">Import gagal</p>
          <p>{{ job.error || 'Terjadi kesalahan saat memproses file.' }}</p>
        </div>

        <div v-if="!isFinished" class="space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-1 text-sm">
            <span class="font-medium">{{ job.stage || statusLabel }}</span>
            <span class="text-muted-foreground">
              {{ job.processed }} / {{ job.total || '…' }} baris
            </span>
          </div>
          <div
            class="h-2.5 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            :aria-valuenow="progressPercent"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="statusLabel"
          >
            <div class="h-full rounded-full bg-blue-600 transition-all" :style="{ width: `${progressPercent}%` }" />
          </div>
          <p class="text-xs text-muted-foreground">
            {{ progressPercent }}% selesai — progres diperbarui otomatis setiap ±1,5 detik.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div class="rounded-xl border bg-card p-4">
            <p class="text-xs text-muted-foreground">Dibuat</p>
            <p class="mt-1 text-2xl font-semibold text-green-700 dark:text-green-400">{{ summary.created }}</p>
          </div>
          <div class="rounded-xl border bg-card p-4">
            <p class="text-xs text-muted-foreground">Diperbarui</p>
            <p class="mt-1 text-2xl font-semibold text-blue-700 dark:text-blue-400">{{ summary.updated }}</p>
          </div>
          <div class="rounded-xl border bg-card p-4">
            <p class="text-xs text-muted-foreground">Gagal</p>
            <p class="mt-1 text-2xl font-semibold text-red-700 dark:text-red-400">{{ summary.failed }}</p>
          </div>
          <div class="rounded-xl border bg-card p-4">
            <p class="text-xs text-muted-foreground">Gambar diunggah</p>
            <p class="mt-1 text-2xl font-semibold">{{ summary.imagesUploaded }}</p>
            <p v-if="summary.imagesFailed" class="text-xs text-red-600 dark:text-red-400">
              {{ summary.imagesFailed }} gambar gagal
            </p>
          </div>
        </div>

        <div v-if="report" class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="text-sm font-semibold">Rincian per baris</h2>
            <p class="text-xs text-muted-foreground">
              Sheet {{ report.sheet }} · {{ report.total }} baris · {{ formatDuration(report.duration_ms) }}
            </p>
          </div>

          <p
            v-if="report.truncated"
            class="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
          >
            Daftar baris dipotong karena jumlahnya terlalu banyak. Hanya sebagian baris yang ditampilkan.
          </p>

          <p v-if="!reportRows.length" class="text-sm text-muted-foreground">
            Tidak ada baris pada laporan ini.
          </p>
          <div v-else class="max-h-[28rem] overflow-auto rounded-lg border">
            <UiTable>
              <UiTableHeader>
                <UiTableRow>
                  <UiTableHead class="sticky top-0 z-10 w-16 bg-card">Baris</UiTableHead>
                  <UiTableHead class="sticky top-0 z-10 bg-card">Kode</UiTableHead>
                  <UiTableHead class="sticky top-0 z-10 bg-card">Nama</UiTableHead>
                  <UiTableHead class="sticky top-0 z-10 bg-card">Aksi</UiTableHead>
                  <UiTableHead class="sticky top-0 z-10 bg-card">Pesan</UiTableHead>
                </UiTableRow>
              </UiTableHeader>
              <UiTableBody>
                <UiTableRow v-for="row in reportRows" :key="row.line">
                  <UiTableCell class="text-muted-foreground">{{ row.line }}</UiTableCell>
                  <UiTableCell class="font-mono text-xs">{{ row.code }}</UiTableCell>
                  <UiTableCell class="font-medium">{{ row.name }}</UiTableCell>
                  <UiTableCell>
                    <UiBadge :class="actionClass(row.action)">{{ actionLabel(row.action) }}</UiBadge>
                  </UiTableCell>
                  <UiTableCell class="whitespace-normal text-muted-foreground">
                    {{ row.message || '—' }}
                  </UiTableCell>
                </UiTableRow>
              </UiTableBody>
            </UiTable>
          </div>
        </div>

        <div v-if="isFinished" class="flex flex-wrap gap-2">
          <UiButton variant="outline" @click="resetAll">
            <RefreshCw class="size-4" /> Import Produk Lain
          </UiButton>
          <UiButton variant="primary" @click="router.push('/console/secret/products')">
            Lihat Daftar Produk
          </UiButton>
        </div>
      </UiCardContent>
    </UiCard>
  </div>
</template>
