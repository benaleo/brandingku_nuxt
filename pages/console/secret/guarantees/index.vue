<template>
  <div>
    <AppBreadcrumb/>
    <AppTableHeader :pageTitle="pageTitle"/>

    <div class="mt-2 flex flex-wrap gap-2">
      <Button v-for="tab in TABS" :key="tab.value" size="sm" :variant="status === tab.value ? 'default' : 'outline'" @click="status = tab.value">
        {{ tab.label }}
      </Button>
    </div>

    <div class="mt-4">
      <div v-if="error" class="py-4 text-center text-red-500">{{ error }}</div>
      <div v-else-if="loading && !claims.length" class="py-8 text-center text-sm text-muted-foreground">Memuat klaim…</div>
      <div v-else-if="!claims.length" class="py-8 text-center text-sm text-muted-foreground">Tidak ada klaim.</div>
      <ul v-else class="space-y-3">
        <li v-for="c in claims" :key="c.id" class="rounded-lg border bg-background p-4 text-sm">
          <div class="flex flex-wrap items-start justify-between gap-2">
            <div>
              <NuxtLink :to="`/console/secret/orders/${c.order_id}/detail`" class="font-semibold text-primary hover:underline">{{ c.order_code }}</NuxtLink>
              <span class="ml-2 text-muted-foreground">{{ c.customer_name }}</span>
              <p class="text-xs text-muted-foreground">{{ formatDateTime(c.created_at) }} · minta {{ RESOLUTION[c.resolution] }}</p>
            </div>
            <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="STATUS_STYLE[c.status]">{{ STATUS[c.status] }}</span>
          </div>
          <p class="mt-2 whitespace-pre-wrap break-words">{{ c.reason }}</p>
          <div v-if="c.files.length" class="mt-2 flex flex-wrap gap-2">
            <a v-for="f in c.files" :key="f.path" :href="fileUrl(f.path)" target="_blank" rel="noopener" class="block size-20 overflow-hidden rounded-md border bg-muted">
              <img v-if="f.content_type.startsWith('image/')" :src="fileUrl(f.path)" :alt="f.file_name" loading="lazy" class="size-full object-cover">
              <span v-else class="flex size-full flex-col items-center justify-center gap-1 p-1 text-center text-[11px] text-muted-foreground"><FileText class="size-4"/><span class="w-full truncate">{{ f.file_name }}</span></span>
            </a>
          </div>
          <p v-if="c.decision_note" class="mt-2 rounded-md bg-muted p-2 text-xs">Catatan keputusan: {{ c.decision_note }}</p>
          <p v-if="c.resolution_note" class="mt-2 rounded-md bg-green-50 p-2 text-xs text-green-800">Penyelesaian: {{ c.resolution_note }}</p>
          <div v-if="canUpdate && (c.status === 'submitted' || c.status === 'approved')" class="mt-3 flex flex-wrap gap-2">
            <template v-if="c.status === 'submitted'">
              <Button size="sm" class="bg-green-600 hover:bg-green-700" @click="openDialog('approve', c)">Setujui</Button>
              <Button size="sm" variant="outline" class="text-red-600" @click="openDialog('reject', c)">Tolak</Button>
            </template>
            <Button v-else size="sm" class="bg-green-600 hover:bg-green-700" @click="openDialog('resolve', c)">Tandai selesai ({{ RESOLUTION[c.resolution] }})</Button>
          </div>
        </li>
      </ul>
    </div>

    <Dialog :open="!!action" @update:open="(v: boolean) => { if (!v && !busy) action = null }">
      <DialogContent class="sm:max-w-md">
        <DialogTitle>{{ action === 'approve' ? 'Setujui klaim' : action === 'reject' ? 'Tolak klaim' : 'Klaim selesai' }} {{ target?.order_code }}</DialogTitle>
        <DialogDescription>
          {{ action === 'approve' ? 'Pilih penyelesaian. Customer mendapat notifikasi.' : action === 'reject' ? 'Alasan penolakan dikirim ke customer.' : 'Tulis bukti penyelesaian, mis. transfer refund atau resi barang pengganti.' }}
        </DialogDescription>
        <form class="space-y-3" @submit.prevent="submit">
          <div v-if="action === 'approve'" class="grid grid-cols-2 gap-2">
            <label v-for="opt in (['replace', 'refund'] as const)" :key="opt" class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm" :class="resolution === opt ? 'border-primary bg-primary/5 font-medium' : ''">
              <input v-model="resolution" type="radio" name="claim-resolution" :value="opt"> {{ RESOLUTION[opt] }}
            </label>
          </div>
          <div class="space-y-1">
            <Label for="claim-note">{{ action === 'approve' ? 'Catatan (opsional)' : 'Catatan (wajib)' }}</Label>
            <Textarea id="claim-note" v-model="note" rows="3" maxlength="2000"/>
          </div>
          <Button type="submit" class="w-full" :disabled="busy || (action !== 'approve' && !note.trim())">
            <Loader2 v-if="busy" class="size-4 animate-spin"/> Simpan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import {toast} from 'vue-sonner'
import {FileText, Loader2} from 'lucide-vue-next'
import AppBreadcrumb from '~/components/elements/AppBreadcrumb.vue'
import AppTableHeader from '~/components/elements/AppTableHeader.vue'
import {Button} from '~/components/ui/button'
import {Dialog, DialogContent, DialogDescription, DialogTitle} from '~/components/ui/dialog'
import {Label} from '~/components/ui/label'
import {Textarea} from '~/components/ui/textarea'
import {useAftercareService} from '~/services/aftercare.service'
import type {ClaimResolution, GuaranteeClaim} from '~/types/aftercare.type'

const pageTitle = 'Klaim Garansi'
const TABS = [
  {label: 'Perlu diproses', value: 'open'},
  {label: 'Baru', value: 'submitted'},
  {label: 'Disetujui', value: 'approved'},
  {label: 'Selesai', value: 'resolved'},
  {label: 'Ditolak', value: 'rejected'},
  {label: 'Semua', value: 'all'},
]
const STATUS: Record<string, string> = {submitted: 'Baru', approved: 'Disetujui, belum selesai', rejected: 'Ditolak', resolved: 'Selesai'}
const STATUS_STYLE: Record<string, string> = {
  submitted: 'bg-amber-100 text-amber-800', approved: 'bg-sky-100 text-sky-800', rejected: 'bg-zinc-200 text-zinc-700', resolved: 'bg-green-100 text-green-800',
}
const RESOLUTION: Record<ClaimResolution, string> = {refund: 'pengembalian dana', replace: 'tukar barang'}

const route = useRoute()
const {canAction} = useConsoleAccess()
const canUpdate = computed(() => canAction(route.path, 'update'))
const service = useAftercareService()
const STORAGE_URL = useRuntimeConfig().public.STORAGE_URL
const fileUrl = (path: string) => (path.startsWith('http') ? path : `${STORAGE_URL}${path}`)

const status = ref('open')
const claims = ref<GuaranteeClaim[]>([])
const loading = ref(false)
const error = ref('')
const load = async () => {
  loading.value = true
  error.value = ''
  try {
    claims.value = await service.getGuaranteeClaims(status.value)
  } catch (e: any) {
    error.value = e?.message || 'Gagal memuat klaim'
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(status, load)

const action = ref<'approve' | 'reject' | 'resolve' | null>(null)
const target = ref<GuaranteeClaim | null>(null)
const resolution = ref<ClaimResolution>('replace')
const note = ref('')
const busy = ref(false)
const stale = useAftercareCountsStale()
const openDialog = (a: 'approve' | 'reject' | 'resolve', c: GuaranteeClaim) => {
  action.value = a
  target.value = c
  resolution.value = c.resolution
  note.value = ''
}
const submit = async () => {
  if (!target.value || !action.value) return
  busy.value = true
  try {
    if (action.value === 'resolve') await service.resolveGuaranteeClaim(target.value.id, note.value.trim())
    else await service.decideGuaranteeClaim(target.value.id, action.value === 'approve', action.value === 'approve' ? resolution.value : null, note.value.trim())
    toast.success('Klaim diperbarui')
    action.value = null
    stale.value++
    await load()
  } catch (e: any) {
    toast.error(e?.message || 'Gagal memperbarui klaim')
  } finally {
    busy.value = false
  }
}

useHead({title: pageTitle})

definePageMeta({
  layout: 'console-secret'
})
</script>
