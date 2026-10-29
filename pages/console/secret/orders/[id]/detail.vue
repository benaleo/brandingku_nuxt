<template>
  <div>
    <AppBreadcrumb/>
    <div v-if="loading" class="py-8 text-center">Loading...</div>
    <div v-else-if="error" class="py-8 text-center text-red-500">{{ error }}</div>
    <div v-else-if="order" class="space-y-6 pb-10">
      <div class="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-sm text-muted-foreground">{{ order.type === 'quotation' ? 'Permintaan penawaran' : 'Pembelian langsung' }}</p>
          <h1 class="flex flex-wrap items-center gap-2 text-2xl font-bold">
            {{ order.code }}
            <Badge :class="ORDER_STATUS_STYLE[order.status]">{{ ORDER_STATUS_LABELS[order.status] }}</Badge>
          </h1>
          <p class="mt-1 text-sm text-muted-foreground">
            Dibuat {{ formatDateTime(order.created_at) }}
            <span v-if="order.expires_at"> · batas bayar {{ formatDateTime(order.expires_at) }}</span>
          </p>
          <p v-if="order.cancel_reason" class="mt-1 text-sm text-red-600">{{ order.cancel_reason }}</p>
          <p v-if="order.status === 'revision_requested' && revisionNote" class="mt-2 rounded-md bg-orange-50 p-2 text-sm text-orange-800">Revisi diminta: {{ revisionNote }}</p>
          <a v-if="order.design_file_path" :href="storageUrl(order.design_file_path)" target="_blank" rel="noopener" class="mt-1 inline-block text-sm text-green-700 hover:underline">
            File desain: {{ order.design_file_name }}
          </a>
        </div>
        <div class="flex flex-wrap gap-2">
          <Button v-if="order.invoice && canInvoices && order.type === 'purchase'" variant="outline" size="sm" @click="router.push(`/console/secret/invoices/${order.invoice.id}/detail`)">
            <ReceiptText class="size-4"/> {{ order.invoice.number }}
          </Button>
          <Button v-if="canDraftQuotation" size="sm" class="bg-green-600 hover:bg-green-700" :disabled="busy" @click="draftQuotation">
            <ReceiptText class="size-4"/> Buat quotation
          </Button>
          <Button v-if="next.includes('processing')" size="sm" :disabled="busy" @click="setStatus('processing')">Proses</Button>
          <Button v-if="next.includes('shipped')" size="sm" :disabled="busy" @click="dialog = 'ship'">Tandai dikirim</Button>
          <Button v-if="next.includes('completed')" size="sm" class="bg-green-600 hover:bg-green-700" :disabled="busy" @click="setStatus('completed')">Selesai</Button>
          <Button v-if="canCancel" variant="outline" size="sm" class="text-red-600" :disabled="busy" @click="dialog = 'cancel'">Batalkan</Button>
        </div>
      </div>

      <!-- shipping fee: the step that unblocks payment for delivery orders -->
      <section v-if="order.status === 'awaiting_shipping_fee' && canUpdate" class="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
        <p class="font-medium">Isi ongkos kirim</p>
        <p class="text-muted-foreground">Setelah disimpan, invoice dikirim ke customer dan batas waktu pembayaran dimulai.</p>
        <form class="mt-3 grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)_auto] sm:items-end" @submit.prevent="saveShipping">
          <div class="space-y-1">
            <Label for="ship-fee">Ongkir (Rp) *</Label>
            <ElementsRupiahInput id="ship-fee" v-model="shipping.fee" class="bg-white"/>
          </div>
          <div class="space-y-1">
            <Label for="ship-note">Kurir / estimasi</Label>
            <Input id="ship-note" v-model="shipping.note" maxlength="500" class="bg-white" placeholder="JNE REG, 2-3 hari"/>
          </div>
          <Button type="submit" :disabled="busy" class="bg-green-600 hover:bg-green-700">
            <Loader2 v-if="busy" class="size-4 animate-spin"/> Simpan & kirim invoice
          </Button>
          <label class="flex items-center gap-2 sm:col-span-3">
            <input v-model="shipping.notify" type="checkbox"/> Email invoice ke {{ order.customer_email }}
          </label>
        </form>
      </section>

      <!-- transfer proofs waiting for a decision -->
      <section v-if="pendingProofs.length" class="rounded-xl border border-orange-300 bg-orange-50 p-4 text-sm">
        <p class="mb-2 font-medium">Bukti transfer menunggu verifikasi</p>
        <ul class="divide-y divide-orange-200">
          <li v-for="p in pendingProofs" :key="p.id" class="flex flex-wrap items-center justify-between gap-2 py-2">
            <div>
              <p class="font-medium">{{ formatRupiah(p.amount) }} · {{ formatInvoiceDate(p.paid_on) }}</p>
              <p class="text-xs text-muted-foreground">{{ [p.payer_name, p.note].filter(Boolean).join(' · ') || '—' }}</p>
              <a v-if="p.proof_path" :href="storageUrl(p.proof_path)" target="_blank" rel="noopener" class="text-xs text-green-700 hover:underline">Lihat bukti</a>
            </div>
            <div v-if="canVerify" class="flex gap-2">
              <Button size="sm" class="bg-green-600 hover:bg-green-700" :disabled="busy" @click="verify(p.id)">Verifikasi</Button>
              <Button size="sm" variant="outline" class="text-red-600" :disabled="busy" @click="rejecting = p.id; dialog = 'reject'">Tolak</Button>
            </div>
          </li>
        </ul>
      </section>

      <!-- quotation orders: the customer's first payment, then production step by step -->
      <section v-if="order.type === 'quotation' && (order.payment_plan || order.payment_options)" class="rounded-xl border bg-card p-4 text-sm">
        <p class="font-medium">Pembayaran pertama</p>
        <p v-if="order.payment_plan" class="mt-1">{{ order.payment_plan === 'dp' ? 'DP, sisanya ditagih otomatis saat siap kirim' : 'Langsung pelunasan' }} · dipilih customer</p>
        <p v-else class="mt-1 text-muted-foreground">Menunggu customer memilih DP (min. {{ formatRupiah(order.payment_options?.min_dp_amount || 0) }}) atau pelunasan untuk {{ order.payment_options?.deal_number }}.</p>
      </section>
      <ElementsOrderProgressTimeline v-if="order.type === 'quotation' && order.production_stage" :order="order" viewer="staff">
        <template #[progressSlot]>
          <p v-if="approvalWaiting" class="mt-2 text-xs text-muted-foreground">{{ stepName }} baru bisa dikirim setelah customer menjawab yang sebelumnya.</p>
          <form v-else-if="canUpdate && order.status === 'processing' && progressStep" class="mt-3 space-y-3 rounded-lg border border-dashed p-3" @submit.prevent="submitProgress">
            <p v-if="progressStep === 'ready_to_ship' && order.payment_plan === 'dp'" class="text-xs text-teal-700">Tagihan pelunasan dibuat dan dikirim ke customer otomatis setelah tahap ini.</p>
            <div class="space-y-1">
              <Label for="progress-files">{{ progressStep === 'mockup' ? 'Gambar mockup' : 'Foto / file' }} {{ needsFiles ? '(wajib)' : '(opsional)' }}</Label>
              <ElementsFilePickField
                id="progress-files"
                multiple
                :files="progressFiles"
                label="Pilih foto atau PDF"
                hint="Maks. 5 file, 5 MB per file, 7 MB total. Foto disimpan sebagai WebP."
                :disabled="busy || progressFiles.length >= 5"
                @pick="pickProgressFiles"
                @remove="(i: number) => progressFiles.splice(i, 1)"
              />
            </div>
            <div class="space-y-1">
              <Label for="progress-note">Catatan untuk customer</Label>
              <Textarea id="progress-note" v-model="progressNote" rows="2" maxlength="1000"/>
            </div>
            <Button type="submit" size="sm" class="bg-green-600 hover:bg-green-700" :disabled="busy || (needsFiles && !progressFiles.length)">
              <Loader2 v-if="busy" class="size-4 animate-spin"/>{{ STEP_SUBMIT[progressStep] }}
            </Button>
          </form>
        </template>
        <template #current-shipped>
          <Button v-if="next.includes('shipped')" size="sm" class="mt-2" :disabled="busy" @click="dialog = 'ship'">Tandai dikirim</Button>
        </template>
      </ElementsOrderProgressTimeline>

      <section v-if="order.type === 'quotation' && order.documents.length" class="rounded-xl border bg-card p-4 text-sm">
        <p class="mb-2 font-medium">Dokumen</p>
        <ul class="divide-y">
          <li v-for="d in order.documents" :key="d.id" class="flex flex-wrap items-center justify-between gap-2 py-2">
            <NuxtLink :to="`/console/secret/invoices/${d.id}/detail`" class="font-medium text-green-700 hover:underline">
              {{ INVOICE_TYPE_LABELS[d.type] }} {{ d.number }}
            </NuxtLink>
            <span class="text-muted-foreground">
              {{ formatRupiah(d.amount_due) }}<template v-if="d.paid_amount"> · dibayar {{ formatRupiah(d.paid_amount) }}</template>
              · {{ INVOICE_STATUS[d.status as InvoiceStatus]?.[0] || d.status }}
            </span>
          </li>
        </ul>
      </section>

      <div class="grid gap-4 md:grid-cols-2">
        <section class="rounded-xl border bg-card p-4 text-sm">
          <p class="mb-2 font-medium">Customer</p>
          <p class="font-semibold">{{ order.customer_name }}</p>
          <p v-if="order.customer_company">{{ order.customer_company }}</p>
          <p class="text-muted-foreground">{{ order.customer_email }} · {{ order.customer_phone }}</p>
          <p v-if="order.notes" class="mt-2 whitespace-pre-line"><span class="text-muted-foreground">Catatan:</span> {{ order.notes }}</p>
        </section>
        <section class="rounded-xl border bg-card p-4 text-sm">
          <p class="mb-2 font-medium">Pengiriman</p>
          <p v-if="order.delivery_method === 'pickup'">Ambil di tempat</p>
          <template v-else>
            <p class="font-semibold">{{ order.shipping_name }} · {{ order.shipping_phone }}</p>
            <p class="whitespace-pre-line">{{ order.shipping_address }}</p>
            <p>{{ [order.shipping_city, order.shipping_postal_code].filter(Boolean).join(' ') }}</p>
            <p v-if="order.shipping_note" class="mt-1 text-muted-foreground">{{ order.shipping_note }}</p>
          </template>
          <p v-if="order.tracking_number" class="mt-1">Resi: <span class="font-mono">{{ order.tracking_number }}</span></p>
        </section>
      </div>

      <section class="overflow-x-auto rounded-xl border bg-card">
        <table class="w-full min-w-[600px] text-sm">
          <thead class="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th class="px-4 py-2">Produk</th>
              <th class="px-4 py-2 text-right">Qty</th>
              <th class="px-4 py-2 text-right">Harga</th>
              <th class="px-4 py-2 text-right">Jumlah</th>
            </tr>
          </thead>
          <!-- one row per product, its branding services indented below; deal prices once there is a deal -->
          <tbody v-for="row in itemRows" :key="row.key" class="border-b last:border-0">
            <tr v-for="(line, i) in linesOf(row)" :key="line.key">
              <td class="px-4 py-2" :class="{ 'pt-0 pl-8': i > 0 && row.product }">
                <template v-if="i === 0 && row.product">
                  <p class="font-medium">{{ row.name }} <span v-if="line.label" class="text-muted-foreground">· {{ line.label }}</span></p>
                  <p v-if="row.note" class="text-xs text-muted-foreground">{{ row.note }}</p>
                </template>
                <p v-else :class="row.product ? 'text-xs text-muted-foreground' : 'font-medium'">{{ line.label || row.name }}</p>
              </td>
              <td class="px-4 py-2 text-right" :class="{ 'pt-0 text-xs text-muted-foreground': i > 0 && row.product }">{{ line.quantity.toLocaleString('id-ID') }}</td>
              <td class="px-4 py-2 text-right whitespace-nowrap" :class="{ 'pt-0 text-xs text-muted-foreground': i > 0 && row.product }">
                {{ formatRupiah(line.unitPrice) }}<span v-if="line.discountBps" class="text-green-700"> −{{ line.discountBps / 100 }}%</span>
              </td>
              <td class="px-4 py-2 text-right whitespace-nowrap" :class="{ 'pt-0 text-xs text-muted-foreground': i > 0 && row.product }">{{ formatRupiah(line.total) }}</td>
            </tr>
          </tbody>
          <tfoot v-if="dealItems?.length && deal" class="border-t bg-muted/20 text-sm">
            <tr>
              <td colspan="3" class="px-4 py-2 text-xs text-teal-700">
                Harga mengikuti {{ deal.number }}{{ deal.status === 'draft' ? ' (draft, belum dikirim ke customer)' : '' }}
              </td>
              <td class="px-4 py-2 text-right font-semibold whitespace-nowrap">{{ formatRupiah(rowsTotal(itemRows)) }}</td>
            </tr>
          </tfoot>
        </table>
        <dl v-if="order.invoice && order.type === 'purchase'" class="ml-auto max-w-sm space-y-1 border-t p-4 text-sm">
          <div class="flex justify-between"><dt>Subtotal</dt><dd>{{ formatRupiah(order.invoice.subtotal) }}</dd></div>
          <div v-if="order.invoice.discount_total" class="flex justify-between"><dt>Voucher {{ order.voucher_code }}</dt><dd>-{{ formatRupiah(order.invoice.discount_total) }}</dd></div>
          <div class="flex justify-between"><dt>Ongkir</dt><dd>{{ order.status === 'awaiting_shipping_fee' ? 'belum diisi' : formatRupiah(order.invoice.shipping_fee) }}</dd></div>
          <div v-if="order.invoice.tax_mode !== 'none'" class="flex justify-between text-muted-foreground"><dt>PPN {{ formatBps(order.invoice.tax_rate_bps) }}</dt><dd>{{ formatRupiah(order.invoice.tax_total) }}</dd></div>
          <div class="flex justify-between border-t pt-2 font-semibold"><dt>Total</dt><dd>{{ formatRupiah(order.invoice.total) }}</dd></div>
          <div class="flex justify-between text-green-700"><dt>Dibayar</dt><dd>{{ formatRupiah(order.invoice.paid_amount) }}</dd></div>
        </dl>
      </section>

      <section class="rounded-xl border bg-card p-4 text-sm">
        <p class="mb-2 font-medium">Aktivitas</p>
        <ul class="space-y-1">
          <li v-for="e in [...order.events].reverse()" :key="e.id" class="flex flex-wrap gap-x-2">
            <span class="text-muted-foreground">{{ formatDateTime(e.created_at) }}</span>
            <span class="font-medium">{{ EVENT_LABELS[e.action] || ORDER_STATUS_LABELS[e.action as OrderStatus] || e.action.replaceAll('_', ' ') }}</span>
            <span v-if="e.note" class="text-muted-foreground">{{ e.note }}</span>
            <span v-if="e.actor" class="text-muted-foreground">· {{ e.actor }}</span>
          </li>
        </ul>
      </section>

      <ElementsDiscussionThread v-if="order.type === 'quotation'" subject-type="order" :subject-id="order.id" viewer="staff" />
    </div>

    <Dialog :open="!!dialog" @update:open="(v: boolean) => { if (!v && !busy) dialog = null }">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ dialog === 'ship' ? 'Tandai dikirim' : dialog === 'cancel' ? 'Batalkan pesanan' : 'Tolak bukti transfer' }}</DialogTitle>
          <DialogDescription>
            {{ dialog === 'ship' ? 'Nomor resi akan terlihat oleh customer.' : dialog === 'cancel' ? 'Invoice di-void dan voucher dikembalikan. Alasan terlihat oleh customer.' : 'Customer akan melihat alasan penolakan dan bisa mengirim ulang.' }}
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-2">
          <Label for="dlg-text">{{ dialog === 'ship' ? 'Nomor resi' : 'Alasan *' }}</Label>
          <Input v-if="dialog === 'ship'" id="dlg-text" v-model="dialogText" maxlength="100"/>
          <Textarea v-else id="dlg-text" v-model="dialogText" rows="3" maxlength="500"/>
        </div>
        <DialogFooter>
          <Button variant="outline" :disabled="busy" @click="dialog = null">Batal</Button>
          <Button :disabled="busy" :class="{ 'bg-red-600 hover:bg-red-700': dialog !== 'ship' }" @click="confirmDialog">
            <Loader2 v-if="busy" class="size-4 animate-spin"/> {{ dialog === 'ship' ? 'Simpan' : dialog === 'cancel' ? 'Batalkan pesanan' : 'Tolak' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch} from 'vue'
import {toast} from 'vue-sonner'
import {Loader2, ReceiptText} from 'lucide-vue-next'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import AppBreadcrumb from '~/components/elements/AppBreadcrumb.vue'
import {useOrderService} from '~/services/order.service'
import {invoiceErrorMessage, useInvoiceService} from '~/services/invoice.service'
import type {Order, OrderStatus, ProductionStep} from '~/types/order.type'
import type {InvoiceItem, InvoiceStatus} from '~/types/invoice.type'

const NEXT: Partial<Record<OrderStatus, OrderStatus[]>> = {accepted: ['processing'], paid: ['processing', 'shipped'], processing: ['shipped'], shipped: ['completed']}

const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()
const {canAction} = useConsoleAccess()
const service = useOrderService()
const id = computed(() => Number(route.params.id))

const order = ref<Order | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const busy = ref(false)
const dialog = ref<'ship' | 'cancel' | 'reject' | null>(null)
const dialogText = ref('')
const rejecting = ref<number | null>(null)
const shipping = reactive({fee: 0 as number | string, note: '', notify: true})

const canUpdate = computed(() => canAction(route.path, 'update'))
const canInvoices = computed(() => canAction('/console/secret/invoices', 'index'))
const canVerify = computed(() => canAction('/console/secret/invoices', 'update'))
// quotation production starts with the first payment, and shipping waits for production and the balance
const next = computed(() => {
  const o = order.value
  if (!o || !canUpdate.value) return []
  return (NEXT[o.status] || []).filter(s => !(o.type === 'quotation' && s === 'processing') && !(s === 'shipped' && !o.can_ship))
})

const EVENT_LABELS: Record<string, string> = {
  payment_plan_chosen: 'Pembayaran pertama dipilih', progress_sample: 'Sample dikirim', sample_approved: 'Sample disetujui',
  sample_revision: 'Revisi sample diminta', progress_mockup: 'Mockup dikirim', mockup_approved: 'Mockup disetujui', mockup_revision: 'Revisi mockup diminta', progress_mass_production: 'Produksi massal selesai', progress_qc: 'Quality check selesai',
  progress_ready_to_ship: 'Siap kirim', thank_you_sent: 'Email terima kasih terkirim', thank_you_failed: 'Email terima kasih gagal',
}
const STEP_NAME: Record<ProductionStep, string> = {
  mockup: 'Mockup', sample: 'Sample', mass_production: 'Produksi massal', qc: 'Quality check', ready_to_ship: 'Siap kirim',
}
const STEP_SUBMIT: Record<ProductionStep, string> = {
  mockup: 'Kirim mockup ke customer',
  sample: 'Kirim sample ke customer', mass_production: 'Tandai produksi massal selesai', qc: 'Tandai quality check selesai', ready_to_ship: 'Tandai siap kirim',
}
const progressStep = computed(() => {
  const s = order.value?.production_stage
  return s && s !== 'done' ? s : null
})
const progressSlot = computed(() => `current-${order.value?.production_stage || ''}`)
// mockup and sample need files and the customer's answer before the next one can be sent
const stepName = computed(() => (progressStep.value ? STEP_NAME[progressStep.value] : ''))
const needsFiles = computed(() => progressStep.value === 'mockup' || progressStep.value === 'sample')
const approvalWaiting = computed(() => needsFiles.value && !!order.value?.progress.some(p => p.stage === progressStep.value && !p.decision))
const progressFiles = ref<File[]>([])
const progressNote = ref('')
function pickProgressFiles(picked: File[]) {
  const tooBig = picked.find(f => f.size > MAX_UPLOAD_BYTES)
  if (tooBig) toast.error(`${tooBig.name} lebih dari 5 MB`)
  progressFiles.value = [...progressFiles.value, ...picked.filter(f => f.size <= MAX_UPLOAD_BYTES)].slice(0, 5)
}
async function submitProgress() {
  const step = progressStep.value
  if (!step) return
  if (progressFiles.value.reduce((sum, f) => sum + f.size, 0) > 7 * 1024 * 1024) {
    toast.error('Total file maksimal 7 MB')
    return
  }
  await act(async () => {
    const files = await Promise.all(progressFiles.value.map(async f => ({file_name: f.name, content_type: f.type || undefined, content: await readFileAsDataURL(f)})))
    await service.addOrderProgress(id.value, step, progressNote.value.trim(), files)
    progressFiles.value = []
    progressNote.value = ''
  }, step === 'ready_to_ship' && order.value?.payment_plan === 'dp' ? 'Siap kirim · tagihan pelunasan dikirim' : 'Progres tersimpan')
}
const allPayments = computed(() => (order.value?.documents || []).flatMap(d => d.payments))
const pendingProofs = computed(() => allPayments.value.filter(p => p.status === 'pending'))
const canCancel = computed(() => !!order.value && canAction(route.path, 'delete') &&
  ['awaiting_shipping_fee', 'pending_payment', 'requested', 'quoted', 'revision_requested', 'accepted'].includes(order.value.status) &&
  !allPayments.value.some(p => p.status !== 'rejected'))
const canDraftQuotation = computed(() => !!order.value && order.value.type === 'quotation' &&
  ['requested', 'revision_requested'].includes(order.value.status) && canAction('/console/secret/invoices', 'create'))
const revisionNote = computed(() => [...(order.value?.events || [])].reverse().find(e => e.action === 'revision_requested')?.note || '')
const storageUrl = (path: string) => path.startsWith('http') ? path : `${config.public.STORAGE_URL}${path}`

// like the customer's page, the deal's items and prices replace the requested ones (drafts included here)
const {getInvoice} = useInvoiceService()
const deal = computed(() => currentDeal(order.value, true))
const dealItems = ref<InvoiceItem[] | null>(null)
watch(() => deal.value?.id, async (dealId) => {
  dealItems.value = null
  if (!dealId || !canInvoices.value) return
  try {
    dealItems.value = (await getInvoice(dealId)).items
  } catch {
    // the requested items stay on screen
  }
}, {immediate: true})
const itemRows = computed(() => !order.value ? []
  : dealItems.value?.length ? rowsFromDeal(order.value, dealItems.value)
  : rowsFromOrder(order.value, name => `Branding ${name}`))

async function load() {
  try {
    order.value = await service.getOrder(id.value)
    error.value = null
  } catch (e: any) {
    error.value = invoiceErrorMessage(e, 'Gagal memuat transaksi')
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(dialog, (d) => { if (d) dialogText.value = '' })

async function act(fn: () => Promise<unknown>, success: string) {
  busy.value = true
  try {
    await fn()
    toast.success(success)
    dialog.value = null
    await load()
  } catch (e: any) {
    toast.error(invoiceErrorMessage(e, 'Aksi gagal'))
  } finally {
    busy.value = false
  }
}

const saveShipping = () => {
  const fee = Math.floor(Number(shipping.fee))
  if (!Number.isFinite(fee) || fee < 0) {
    toast.error('Ongkir tidak valid')
    return
  }
  act(() => service.setOrderShippingFee(id.value, fee, shipping.note.trim(), shipping.notify), 'Ongkir disimpan, invoice terkirim')
}
const setStatus = (status: OrderStatus, tracking?: string) =>
  act(() => service.updateOrderStatus(id.value, status, tracking),
    status === 'completed' ? 'Pesanan selesai · hasil email terima kasih tercatat di Aktivitas' : `Status: ${ORDER_STATUS_LABELS[status]}`)
// drafts (or reopens the existing draft of) the quotation, then hands over to the invoice editor
async function draftQuotation() {
  busy.value = true
  try {
    const q = await service.createQuotationFromOrder(id.value)
    toast.success(`Quotation ${q.number} siap diedit`)
    await router.push(`/console/secret/invoices/${q.id}/edit`)
  } catch (e: any) {
    toast.error(invoiceErrorMessage(e, 'Gagal membuat quotation'))
  } finally {
    busy.value = false
  }
}
const verify = (paymentId: number) => act(() => service.verifyPayment(paymentId), 'Pembayaran diverifikasi')

function confirmDialog() {
  const text = dialogText.value.trim()
  if (dialog.value === 'ship') return setStatus('shipped', text)
  if (!text) {
    toast.error('Alasan wajib diisi')
    return
  }
  if (dialog.value === 'cancel') return act(() => service.cancelOrder(id.value, text), 'Pesanan dibatalkan')
  if (dialog.value === 'reject' && rejecting.value) return act(() => service.rejectPayment(rejecting.value!, text), 'Bukti transfer ditolak')
}

useHead(() => ({title: order.value?.code || 'Transaksi'}))

definePageMeta({
  layout: 'console-secret'
})
</script>
