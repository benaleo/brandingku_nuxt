<template>
  <div v-if="loading" class="text-center py-4">
    Loading...
  </div>
  <div v-else-if="error" class="text-center py-4 text-red-500">
    {{ error }}
  </div>
  <div v-else-if="inquiry" class="editor-form break-words">
    <FormsFormSection title="Detail inquiry" description="Informasi pengirim dan pesan yang diterima.">
    <div class="form-grid">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <p class="text-gray-900">{{ inquiry.name }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <p class="text-gray-900">{{ inquiry.email }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <p class="text-gray-900">{{ inquiry.subject }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Model</label>
        <p class="text-gray-900">{{ inquiry.model }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium" :class="statusMeta.class">{{ statusMeta.label }}</span>
        <p v-if="inquiry.closed_at" class="mt-1 text-xs text-muted-foreground">Ditutup {{ formatDateTime(inquiry.closed_at) }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Created At</label>
        <p class="text-gray-900">{{ formatDateTime(inquiry.created_at) }}</p>
      </div>

      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <p class="text-gray-900 whitespace-pre-wrap">{{ inquiry.message }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Created By</label>
        <p class="text-gray-900">{{ inquiry.created_by || '-' }}</p>
      </div>
    </div>
    </FormsFormSection>

    <!-- reply composer -->
    <FormsFormSection
      v-if="showResponse"
      title="Kirim balasan"
      :description="`Email akan dikirim ke ${inquiry.email} melalui akun SMTP aktif di Email List, lengkap dengan link balasan yang berlaku 7 hari.`"
    >
      <p v-if="inquiry.status === 'closed'" class="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Inquiry ini sudah ditutup. Mengirim balasan akan membukanya kembali.
      </p>
      <div class="space-y-2">
        <Label for="response-subject">Subject</Label>
        <Input id="response-subject" v-model="subject" placeholder="Subject email" :disabled="sending" />
      </div>

      <div class="min-w-0 space-y-2">
        <Label>Pesan</Label>
        <ClientOnly>
          <QuillEditor
            v-model:content="body"
            toolbar="essential"
            :options="{ placeholder: 'Tulis balasan…' }"
            :read-only="sending"
            class="response-editor"
          />
        </ClientOnly>
      </div>

      <div class="space-y-2">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <Label>Lampiran</Label>
          <span class="text-xs text-muted-foreground">
            Maks {{ MAX_FILES }} file, {{ MAX_FILE_MB }} MB per file, total {{ MAX_TOTAL_MB }} MB
          </span>
        </div>
        <div v-if="files.length" class="space-y-2">
          <div
            v-for="(f, i) in files"
            :key="f.name + f.size + i"
            class="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2 text-sm"
          >
            <Paperclip class="size-4 shrink-0 text-muted-foreground" />
            <span class="min-w-0 flex-1 truncate">{{ f.name }}</span>
            <span class="shrink-0 text-xs text-muted-foreground">{{ formatSize(f.size) }}</span>
            <button
              type="button"
              class="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              :aria-label="`Hapus ${f.name}`"
              :disabled="sending"
              @click="files.splice(i, 1)"
            >
              <X class="size-4" />
            </button>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" :disabled="sending || files.length >= MAX_FILES" @click="fileInput?.click()">
          <Paperclip class="size-4" /> Tambah lampiran
        </Button>
        <input ref="fileInput" type="file" multiple class="hidden" @change="onPickFiles" />
      </div>

      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" class="sm:min-w-28" :disabled="sending" @click="showResponse = false">Batal</Button>
        <Button type="button" class="sm:min-w-32" :disabled="sending" @click="sendResponse">
          <Loader2 v-if="sending" class="size-4 animate-spin" />
          <Send v-else class="size-4" />
          {{ sending ? 'Mengirim…' : 'Kirim email' }}
        </Button>
      </div>
    </FormsFormSection>

    <!-- sent history -->
    <FormsFormSection title="Riwayat percakapan" description="Email dari admin dan balasan pelanggan melalui link di email.">
      <p v-if="historyLoading" class="text-sm text-muted-foreground">Memuat riwayat…</p>
      <p v-else-if="!responses.length" class="text-sm text-muted-foreground">Belum ada balasan.</p>
      <div v-else class="space-y-4">
        <article
          v-for="r in responses"
          :key="r.id"
          class="rounded-xl border p-4"
          :class="r.direction === 'inbound' ? 'border-blue-200 bg-blue-50/50' : ''"
        >
          <header class="flex flex-wrap items-start justify-between gap-2">
            <h3 class="font-semibold">{{ r.subject }}</h3>
            <span v-if="r.direction === 'inbound'" class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              Dari pelanggan
            </span>
            <span
              v-else
              class="rounded-full px-2 py-0.5 text-xs font-medium"
              :class="r.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
            >
              {{ r.status === 'sent' ? 'Terkirim' : 'Gagal' }}
            </span>
          </header>
          <p v-if="r.direction === 'inbound'" class="mt-1 text-xs text-muted-foreground">
            {{ formatDateTime(r.created_at) }} · {{ r.sent_by || 'Pelanggan' }} ({{ r.from_email }})
          </p>
          <p v-else class="mt-1 text-xs text-muted-foreground">
            {{ formatDateTime(r.created_at) }} · dari {{ r.from_email || '-' }} ke {{ r.to_email }}
            <template v-if="r.sent_by"> · oleh {{ r.sent_by }}</template>
            <template v-if="r.reply_expires_at"> · link balasan berlaku sampai {{ formatDateTime(r.reply_expires_at) }}</template>
          </p>
          <p v-if="r.error_message" class="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{{ r.error_message }}</p>
          <div class="response-body mt-3 text-sm" v-html="sanitize(r.body)" />
          <ul v-if="r.attachments.length" class="mt-3 flex flex-wrap gap-2">
            <li v-for="a in r.attachments" :key="a.id">
              <a
                v-if="a.path"
                :href="`${STORAGE_URL}${a.path}`"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs hover:bg-muted"
              >
                <Paperclip class="size-3.5" /> {{ a.file_name }} <span class="text-muted-foreground">({{ formatSize(a.size) }})</span>
              </a>
              <span v-else class="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs text-muted-foreground">
                <Paperclip class="size-3.5" /> {{ a.file_name }} (tidak tersimpan)
              </span>
            </li>
          </ul>
        </article>
      </div>
    </FormsFormSection>

    <div class="form-actions">
      <Button type="button" variant="outline" class="w-full sm:w-auto sm:min-w-28" @click="goBack">Kembali</Button>
      <Button
        v-if="canRespond && !showResponse"
        type="button"
        class="w-full sm:w-auto sm:min-w-32"
        @click="openResponse"
      >
        <Reply class="size-4" /> Response
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { toast } from 'vue-sonner'
import { Loader2, Paperclip, Reply, Send, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import QuillEditor from '~/components/editor/QuillEditor.vue'
import { useWebContactService } from '~/services/web-contact.service'
import { useInquiryResponseService } from '~/services/inquiry-response.service'
import { useFileToBase64 } from '~/composables/useFileToBase64'
import type { InquiryResponse } from '~/types/admin-smtp.type'

const props = defineProps<{
  id: string
}>()

// keep in sync with the backend limits in graph/smtp_resolvers.go
const MAX_FILES = 5
const MAX_FILE_MB = 5
const MAX_TOTAL_MB = 7

const STORAGE_URL = useRuntimeConfig().public.STORAGE_URL
const { can } = useConsoleAccess()
const { detail, loading, error } = useWebContactService(false, props.id)
const { getInquiryResponses, respondInquiry } = useInquiryResponseService()

const inquiry = computed(() => detail.value)

const STATUS_META: Record<string, { label: string; class: string }> = {
  pending: { label: 'Baru', class: 'bg-amber-100 text-amber-800' },
  responded: { label: 'Menunggu pelanggan', class: 'bg-sky-100 text-sky-800' },
  replied: { label: 'Dibalas pelanggan', class: 'bg-blue-100 text-blue-800' },
  closed: { label: 'Ditutup', class: 'bg-gray-200 text-gray-700' },
}
const statusMeta = computed(() => STATUS_META[inquiry.value?.status || ''] || { label: inquiry.value?.status || '-', class: 'bg-muted text-foreground' })
const canRespond = computed(() => can('inquiries.update'))

const showResponse = ref(false)
const subject = ref('')
const body = ref('')
const files = ref<File[]>([])
const fileInput = ref<HTMLInputElement>()
const sending = ref(false)

const responses = ref<InquiryResponse[]>([])
const historyLoading = ref(true)

// response bodies are admin-written html; sanitize in the browser before rendering
const purify = shallowRef<{ sanitize: (html: string) => string } | null>(null)
const sanitize = (html: string) => (purify.value ? purify.value.sanitize(html) : '')

const formatSize = (bytes: number) =>
  bytes >= 1 << 20 ? `${(bytes / (1 << 20)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`

async function loadHistory() {
  historyLoading.value = true
  try {
    responses.value = await getInquiryResponses(props.id)
  } catch (e: any) {
    toast.error(e?.message || 'Gagal memuat riwayat balasan')
  } finally {
    historyLoading.value = false
  }
}

onMounted(async () => {
  loadHistory()
  purify.value = (await import('dompurify')).default
})

function openResponse() {
  if (!subject.value && inquiry.value) subject.value = `Re: ${inquiry.value.subject}`
  showResponse.value = true
}

function onPickFiles(e: Event) {
  const input = e.target as HTMLInputElement
  for (const f of Array.from(input.files || [])) {
    if (files.value.length >= MAX_FILES) {
      toast.error(`Maksimal ${MAX_FILES} lampiran`)
      break
    }
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`${f.name} melebihi ${MAX_FILE_MB} MB`)
      continue
    }
    files.value.push(f)
  }
  input.value = ''
  const total = files.value.reduce((s, f) => s + f.size, 0)
  if (total > MAX_TOTAL_MB * 1024 * 1024) toast.warning(`Total lampiran melebihi ${MAX_TOTAL_MB} MB, kurangi sebelum mengirim`)
}

async function sendResponse() {
  if (!subject.value.trim()) return toast.error('Subject wajib diisi')
  if (!body.value.trim()) return toast.error('Pesan wajib diisi')
  if (files.value.reduce((s, f) => s + f.size, 0) > MAX_TOTAL_MB * 1024 * 1024) {
    return toast.error(`Total lampiran melebihi ${MAX_TOTAL_MB} MB`)
  }

  sending.value = true
  try {
    const { convertToBase64 } = useFileToBase64()
    const attachments = await Promise.all(files.value.map(async (f) => ({
      file_name: f.name,
      content_type: f.type || undefined,
      content: await convertToBase64(f),
    })))
    await respondInquiry(props.id, subject.value.trim(), body.value, attachments)
    toast.success(`Email terkirim ke ${inquiry.value?.email}`)
    if (detail.value) detail.value = { ...detail.value, status: 'responded', closed_at: null }
    subject.value = ''
    body.value = ''
    files.value = []
    showResponse.value = false
  } catch (e: any) {
    toast.error(e?.message || 'Email gagal dikirim')
  } finally {
    sending.value = false
    // failed attempts are recorded too, so always refresh the history
    loadHistory()
  }
}

const goBack = () => navigateTo('/console/secret/inquiry')
</script>

<style scoped>
.response-editor :deep(.ql-editor) {
  min-height: 180px;
}
.response-body :deep(p) {
  margin: 0 0 0.5rem;
}
.response-body :deep(ul),
.response-body :deep(ol) {
  margin: 0 0 0.5rem 1.25rem;
  list-style: revert;
}
.response-body :deep(a) {
  text-decoration: underline;
}
</style>
