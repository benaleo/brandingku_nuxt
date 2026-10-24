<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { CheckCircle2, Loader2, Lock, Paperclip, Send } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useInquiryResponseService } from '~/services/inquiry-response.service'
import type { InquiryThread } from '~/types/admin-smtp.type'

// public reply page reached from the link in our inquiry emails (token valid 7 days)
const route = useRoute()
const token = computed(() => String(route.params.token || ''))
const STORAGE_URL = useRuntimeConfig().public.STORAGE_URL
const { getInquiryThread, replyInquiry } = useInquiryResponseService()

useHead({
  title: 'Balas Inquiry - Brandingku',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const thread = ref<InquiryThread | null>(null)
const loading = ref(true)
const loadError = ref<string | null>(null)
const message = ref('')
const submitting = ref<'continue' | 'close' | null>(null)
const confirmClose = ref(false)
const notice = ref<string | null>(null)
const submitError = ref<string | null>(null)

const purify = shallowRef<{ sanitize: (html: string) => string } | null>(null)
const sanitize = (html: string) => (purify.value ? purify.value.sanitize(html) : '')

const cleanError = (e: any) => String(e?.message || 'Terjadi kesalahan').replace(/^\[GQL\] Request failed:\s*/, '')
const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : ''

const isClosed = computed(() => thread.value?.status === 'closed')

onMounted(async () => {
  purify.value = (await import('dompurify')).default
  try {
    thread.value = (await getInquiryThread(token.value)) || null
  } catch (e) {
    loadError.value = cleanError(e)
  } finally {
    loading.value = false
  }
})

async function submit(close: boolean) {
  submitError.value = null
  notice.value = null
  if (!close && !message.value.trim()) {
    submitError.value = 'Tulis pesan terlebih dahulu.'
    return
  }
  submitting.value = close ? 'close' : 'continue'
  try {
    thread.value = (await replyInquiry(token.value, message.value.trim(), close)) || thread.value
    message.value = ''
    confirmClose.value = false
    notice.value = close
      ? 'Inquiry telah ditutup. Terima kasih sudah menghubungi Brandingku.'
      : 'Balasan terkirim. Tim kami akan segera menanggapi melalui email.'
  } catch (e) {
    submitError.value = cleanError(e)
  } finally {
    submitting.value = null
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-4 pt-28 pb-16">
    <div v-if="loading" class="flex items-center justify-center gap-2 py-24 text-muted-foreground">
      <Loader2 class="size-5 animate-spin" /> Memuat percakapan…
    </div>

    <div v-else-if="loadError" class="rounded-2xl border bg-white p-8 text-center shadow-sm">
      <h1 class="text-xl font-semibold">Tautan tidak dapat dibuka</h1>
      <p class="mt-2 text-sm text-gray-600">{{ loadError }}</p>
      <NuxtLink to="/kontak" class="mt-6 inline-block rounded-lg bg-black px-4 py-2 text-sm text-white">Hubungi kami</NuxtLink>
    </div>

    <div v-else-if="thread" class="space-y-6">
      <header class="rounded-2xl border bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm text-gray-500">Halo {{ thread.name }},</p>
            <h1 class="mt-1 text-xl font-semibold break-words">{{ thread.subject }}</h1>
          </div>
          <span
            class="shrink-0 rounded-full px-3 py-1 text-xs font-medium"
            :class="isClosed ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-700'"
          >
            {{ isClosed ? 'Ditutup' : 'Terbuka' }}
          </span>
        </div>
        <div class="mt-4 rounded-xl bg-gray-50 p-4">
          <p class="text-xs font-medium text-gray-500">Pesan Anda</p>
          <p class="mt-1 whitespace-pre-wrap break-words text-sm text-gray-800">{{ thread.message }}</p>
        </div>
      </header>

      <!-- conversation -->
      <section class="space-y-4">
        <article
          v-for="m in thread.messages"
          :key="m.id"
          class="rounded-2xl border p-5 shadow-sm"
          :class="m.direction === 'inbound' ? 'ml-6 bg-green-50 sm:ml-16' : 'mr-6 bg-white sm:mr-16'"
        >
          <p class="text-xs text-gray-500">
            <span class="font-semibold text-gray-700">{{ m.direction === 'inbound' ? 'Anda' : 'Brandingku' }}</span>
            · {{ formatDate(m.created_at) }}
          </p>
          <div class="thread-body mt-2 text-sm text-gray-800" v-html="sanitize(m.body)" />
          <ul v-if="m.attachments.length" class="mt-3 flex flex-wrap gap-2">
            <li v-for="a in m.attachments.filter(a => a.path)" :key="a.id">
              <a
                :href="`${STORAGE_URL}${a.path}`"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 rounded-md border bg-white px-2 py-1 text-xs hover:bg-gray-50"
              >
                <Paperclip class="size-3.5" /> {{ a.file_name }}
              </a>
            </li>
          </ul>
        </article>
      </section>

      <p v-if="notice" class="flex items-start gap-2 rounded-xl bg-green-100 p-4 text-sm text-green-800">
        <CheckCircle2 class="mt-0.5 size-4 shrink-0" /> {{ notice }}
      </p>

      <!-- reply form -->
      <section v-if="thread.can_reply" class="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 class="font-semibold">Balas pesan</h2>
        <p class="mt-1 text-xs text-gray-500">
          Tautan ini berlaku sampai {{ formatDate(thread.expires_at) }}. Tanpa balasan dalam 7 hari, inquiry ditutup otomatis.
        </p>
        <textarea
          v-model="message"
          rows="5"
          maxlength="5000"
          placeholder="Tulis balasan Anda…"
          class="mt-4 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:outline-none"
          :disabled="!!submitting"
        />
        <p v-if="submitError" class="mt-2 text-sm text-red-600">{{ submitError }}</p>

        <div v-if="!confirmClose" class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" :disabled="!!submitting" @click="confirmClose = true">
            <Lock class="size-4" /> Tutup inquiry
          </Button>
          <Button type="button" :disabled="!!submitting" @click="submit(false)">
            <Loader2 v-if="submitting === 'continue'" class="size-4 animate-spin" />
            <Send v-else class="size-4" />
            Kirim &amp; lanjutkan
          </Button>
        </div>
        <div v-else class="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p class="text-sm text-amber-900">
            Tutup inquiry ini? Setelah ditutup Anda tidak bisa membalas lagi melalui tautan ini.
            Pesan di atas (jika ada) akan ikut terkirim.
          </p>
          <div class="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" :disabled="!!submitting" @click="confirmClose = false">Batal</Button>
            <Button type="button" variant="destructive" :disabled="!!submitting" @click="submit(true)">
              <Loader2 v-if="submitting === 'close'" class="size-4 animate-spin" />
              Ya, tutup inquiry
            </Button>
          </div>
        </div>
      </section>

      <section v-else-if="!notice" class="rounded-2xl border bg-white p-6 text-center text-sm text-gray-600 shadow-sm">
        <template v-if="isClosed">Inquiry ini sudah ditutup dan tidak bisa dibalas lagi.</template>
        <template v-else>Tautan balasan ini sudah kedaluwarsa.</template>
        <NuxtLink to="/kontak" class="ml-1 underline">Kirim inquiry baru</NuxtLink>
      </section>
    </div>
  </div>
</template>

<style scoped>
.thread-body :deep(p) {
  margin: 0 0 0.5rem;
}
.thread-body :deep(ul),
.thread-body :deep(ol) {
  margin: 0 0 0.5rem 1.25rem;
  list-style: revert;
}
.thread-body :deep(a) {
  text-decoration: underline;
}
</style>
