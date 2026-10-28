<template>
  <div>
    <AppBreadcrumb/>
    <div v-if="loading" class="py-8 text-center">Loading...</div>
    <div v-else-if="error" class="py-8 text-center text-red-500">{{ error }}</div>
    <div v-else-if="inv" class="space-y-6 pb-10">
      <!-- header -->
      <div class="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-sm text-muted-foreground">{{ INVOICE_TYPE_LABELS[inv.type] }}</p>
          <h1 class="flex flex-wrap items-center gap-2 text-2xl font-bold">
            {{ inv.number }}
            <Badge :class="statusInfo[1]">{{ statusInfo[0] }}</Badge>
          </h1>
          <p v-if="inv.void_reason" class="mt-1 text-sm text-red-600">Alasan void: {{ inv.void_reason }}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <Button v-if="inv.status !== 'draft'" variant="outline" size="sm" as="a" :href="publicUrl" target="_blank" rel="noopener">
            <ExternalLink class="size-4"/> Halaman customer
          </Button>
          <Button v-if="inv.status !== 'draft'" variant="outline" size="sm" as="a" :href="pdfUrl" target="_blank" rel="noopener">
            <FileDown class="size-4"/> PDF
          </Button>
          <Button v-if="inv.status !== 'draft'" variant="outline" size="sm" @click="copyLink">
            <Link2 class="size-4"/> Salin link
          </Button>
          <Button v-if="actions.edit" variant="outline" size="sm" @click="router.push(`/console/secret/invoices/${inv.id}/edit`)">
            <Pencil class="size-4"/> Edit
          </Button>
          <Button v-if="actions.duplicate" variant="outline" size="sm" @click="open('duplicate')">
            <Copy class="size-4"/> Duplikat
          </Button>
          <Button v-if="actions.deal" size="sm" @click="open('deal')">Buat deal</Button>
          <Button v-if="actions.dp" size="sm" @click="open('dp')">Buat DP</Button>
          <Button v-if="actions.final" size="sm" @click="open('final')">Buat final</Button>
          <Button v-if="actions.payment" size="sm" class="bg-green-600 hover:bg-green-700" @click="open('payment')">
            <Banknote class="size-4"/> Catat pembayaran
          </Button>
          <Button v-if="actions.send" size="sm" class="bg-green-600 hover:bg-green-700" @click="open('send')">
            <Send class="size-4"/> Kirim
          </Button>
          <Button v-if="actions.void" variant="outline" size="sm" class="text-red-600" @click="open('void')">Void</Button>
          <Button v-if="actions.delete" variant="outline" size="sm" class="text-red-600" @click="open('delete')">
            <Trash2 class="size-4"/> Hapus
          </Button>
        </div>
      </div>

      <!-- chain -->
      <div v-if="inv.parent || inv.children.length" class="rounded-xl border bg-card p-4 text-sm">
        <p class="mb-2 font-medium">Rangkaian dokumen</p>
        <div class="flex flex-wrap gap-2">
          <NuxtLink v-if="inv.parent" :to="`/console/secret/invoices/${inv.parent.id}/detail`" class="rounded-md border px-3 py-1.5 hover:border-green-600">
            ↑ {{ INVOICE_TYPE_LABELS[inv.parent.type] }} {{ inv.parent.number }}
            <span class="text-muted-foreground">· {{ INVOICE_STATUS[inv.parent.status]?.[0] }}</span>
          </NuxtLink>
          <NuxtLink v-for="c in inv.children" :key="c.id" :to="`/console/secret/invoices/${c.id}/detail`" class="rounded-md border px-3 py-1.5 hover:border-green-600">
            {{ INVOICE_TYPE_LABELS[c.type] }} {{ c.number }}
            <span class="text-muted-foreground">· {{ formatRupiah(c.amount_due) }} · {{ INVOICE_STATUS[c.status]?.[0] }}</span>
          </NuxtLink>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <section class="rounded-xl border bg-card p-4 text-sm">
          <p class="mb-2 font-medium">Customer</p>
          <p class="font-semibold">{{ inv.customer_name }}</p>
          <p v-if="inv.customer_company">{{ inv.customer_company }}</p>
          <p v-if="inv.customer_address" class="whitespace-pre-line text-muted-foreground">{{ inv.customer_address }}</p>
          <p v-if="inv.customer_email || inv.customer_phone" class="text-muted-foreground">{{ [inv.customer_email, inv.customer_phone].filter(Boolean).join(' · ') }}</p>
          <p v-if="inv.customer_npwp" class="text-muted-foreground">NPWP {{ inv.customer_npwp }}</p>
        </section>
        <section class="rounded-xl border bg-card p-4 text-sm">
          <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt class="text-muted-foreground">Tanggal terbit</dt><dd>{{ formatInvoiceDate(inv.issue_date) }}</dd>
            <template v-if="inv.type !== 'deal'">
              <dt class="text-muted-foreground">{{ inv.type === 'quotation' ? 'Berlaku sampai' : 'Jatuh tempo' }}</dt><dd>{{ formatInvoiceDate(inv.due_date) }}</dd>
            </template>
            <dt class="text-muted-foreground">PPN</dt><dd>{{ TAX_MODE_LABELS[inv.tax_mode] }}<span v-if="inv.tax_mode !== 'none'"> · {{ formatBps(inv.tax_rate_bps) }}</span></dd>
            <dt class="text-muted-foreground">Dibuat oleh</dt><dd>{{ inv.created_by }}</dd>
            <template v-if="inv.sent_at"><dt class="text-muted-foreground">Dikirim</dt><dd>{{ formatDateTime(inv.sent_at) }}</dd></template>
            <template v-if="inv.paid_at"><dt class="text-muted-foreground">Lunas</dt><dd>{{ formatDateTime(inv.paid_at) }}</dd></template>
          </dl>
        </section>
      </div>

      <!-- items and totals -->
      <section class="overflow-x-auto rounded-xl border bg-card">
        <table class="w-full min-w-[640px] text-sm">
          <thead class="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th class="px-4 py-2">Deskripsi</th>
              <th class="px-4 py-2 text-right">Qty</th>
              <th class="px-4 py-2 text-right">Harga</th>
              <th class="px-4 py-2 text-right">Diskon</th>
              <th class="px-4 py-2 text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="it in inv.items" :key="it.id" class="border-b last:border-0">
              <td class="px-4 py-2">{{ it.description }}</td>
              <td class="px-4 py-2 text-right">{{ it.quantity.toLocaleString('id-ID') }}</td>
              <td class="px-4 py-2 text-right whitespace-nowrap">{{ formatRupiah(it.unit_price) }}</td>
              <td class="px-4 py-2 text-right">{{ it.discount_bps ? formatBps(it.discount_bps) : '-' }}</td>
              <td class="px-4 py-2 text-right whitespace-nowrap">{{ formatRupiah(it.line_total ?? 0) }}</td>
            </tr>
          </tbody>
        </table>
        <dl class="ml-auto max-w-sm space-y-1 border-t p-4 text-sm">
          <div class="flex justify-between"><dt>Subtotal</dt><dd>{{ formatRupiah(inv.subtotal) }}</dd></div>
          <div v-if="inv.discount_total" class="flex justify-between"><dt>Diskon</dt><dd>-{{ formatRupiah(inv.discount_total) }}</dd></div>
          <div v-if="inv.shipping_fee" class="flex justify-between"><dt>Ongkos kirim</dt><dd>{{ formatRupiah(inv.shipping_fee) }}</dd></div>
          <template v-if="inv.tax_mode !== 'none'">
            <div class="flex justify-between text-muted-foreground"><dt>DPP</dt><dd>{{ formatRupiah(inv.tax_base) }}</dd></div>
            <div class="flex justify-between text-muted-foreground"><dt>PPN {{ formatBps(inv.tax_rate_bps) }}</dt><dd>{{ formatRupiah(inv.tax_total) }}</dd></div>
          </template>
          <div class="flex justify-between border-t pt-2 font-semibold"><dt>Total</dt><dd>{{ formatRupiah(inv.total) }}</dd></div>
          <template v-if="inv.deduction">
            <div class="flex justify-between"><dt>Dikurangi uang muka</dt><dd>-{{ formatRupiah(inv.deduction) }}</dd></div>
            <div class="flex justify-between font-semibold"><dt>Sisa tagihan</dt><dd>{{ formatRupiah(inv.amount_due) }}</dd></div>
          </template>
          <template v-if="billable">
            <div class="flex justify-between text-green-700"><dt>Sudah dibayar</dt><dd>{{ formatRupiah(inv.paid_amount) }}</dd></div>
            <div class="flex justify-between font-semibold"><dt>Kurang bayar</dt><dd>{{ formatRupiah(remaining) }}</dd></div>
          </template>
        </dl>
      </section>

      <section v-if="inv.notes || inv.terms" class="grid gap-4 md:grid-cols-2 text-sm">
        <div v-if="inv.notes" class="rounded-xl border bg-card p-4"><p class="mb-1 font-medium">Catatan</p><p class="whitespace-pre-line text-muted-foreground">{{ inv.notes }}</p></div>
        <div v-if="inv.terms" class="rounded-xl border bg-card p-4"><p class="mb-1 font-medium">Syarat & ketentuan</p><p class="whitespace-pre-line text-muted-foreground">{{ inv.terms }}</p></div>
      </section>

      <section v-if="billable" class="rounded-xl border bg-card p-4 text-sm">
        <p class="mb-2 font-medium">Pembayaran</p>
        <p v-if="!inv.payments.length" class="text-muted-foreground">Belum ada pembayaran.</p>
        <ul v-else class="divide-y">
          <li v-for="p in inv.payments" :key="p.id" class="flex flex-wrap items-center justify-between gap-2 py-2">
            <div>
              <p class="font-medium">
                {{ formatRupiah(p.amount) }}
                <span class="font-normal text-muted-foreground">· {{ PAYMENT_METHODS[p.method] || p.method }} · {{ formatInvoiceDate(p.paid_on) }}</span>
                <Badge class="ml-1" :class="PAYMENT_STATUS[p.status]?.[1]">{{ PAYMENT_STATUS[p.status]?.[0] || p.status }}</Badge>
              </p>
              <p class="text-xs text-muted-foreground">
                {{ [p.payer_name, p.note].filter(Boolean).join(' · ') || '—' }}<template v-if="p.verified_by"> · {{ p.status === 'rejected' ? 'ditolak' : 'dicatat' }} {{ p.verified_by }}</template>
              </p>
              <p v-if="p.reject_reason" class="text-xs text-red-600">{{ p.reject_reason }}</p>
            </div>
            <div class="flex items-center gap-2">
              <a v-if="p.proof_path" :href="storageUrl(p.proof_path)" target="_blank" rel="noopener" class="text-green-700 hover:underline">Bukti transfer</a>
              <template v-if="p.status === 'pending' && canAction(route.path, 'update')">
                <Button size="sm" class="bg-green-600 hover:bg-green-700" :disabled="busy" @click="verifyProof(p.id)">Verifikasi</Button>
                <Button size="sm" variant="outline" class="text-red-600" :disabled="busy" @click="rejectProof(p.id)">Tolak</Button>
              </template>
            </div>
          </li>
        </ul>
      </section>

      <section class="rounded-xl border bg-card p-4 text-sm">
        <p class="mb-2 font-medium">Aktivitas</p>
        <ul class="space-y-1">
          <li v-for="e in [...inv.events].reverse()" :key="e.id" class="flex flex-wrap gap-x-2">
            <span class="text-muted-foreground">{{ formatDateTime(e.created_at) }}</span>
            <span class="font-medium">{{ EVENT_LABELS[e.action] || e.action }}</span>
            <span v-if="e.note" class="text-muted-foreground">{{ e.note }}</span>
            <span class="text-muted-foreground">· {{ e.actor }}</span>
          </li>
        </ul>
      </section>
    </div>

    <Dialog :open="!!dialog" @update:open="(v: boolean) => { if (!v && !busy) dialog = null }">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ dialogTitle }}</DialogTitle>
          <DialogDescription>{{ dialogDescription }}</DialogDescription>
        </DialogHeader>

        <div v-if="dialog === 'send'" class="space-y-2 text-sm">
          <label class="flex items-start gap-2" :class="{ 'opacity-50': !inv?.customer_email }">
            <input v-model="notify" type="checkbox" class="mt-0.5" :disabled="!inv?.customer_email"/>
            <span>Email ke {{ inv?.customer_email || '(email customer kosong)' }} dengan link dan PDF</span>
          </label>
        </div>

        <div v-else-if="dialog === 'void'" class="space-y-2">
          <Label for="void-reason">Alasan *</Label>
          <Textarea id="void-reason" v-model="voidReason" rows="3" maxlength="500"/>
        </div>

        <div v-else-if="dialog === 'dp'" class="space-y-3 text-sm">
          <div class="flex gap-4">
            <label class="flex items-center gap-2"><input v-model="dpMode" type="radio" value="percent"/> Persen</label>
            <label class="flex items-center gap-2"><input v-model="dpMode" type="radio" value="amount"/> Nominal</label>
          </div>
          <div class="space-y-1">
            <Label for="dp-value">{{ dpMode === 'percent' ? 'Persen dari total deal (%)' : 'Nominal (Rp)' }}</Label>
            <Input id="dp-value" v-model="dpValue" type="number" min="0" :step="dpMode === 'percent' ? '0.01' : '1'"/>
          </div>
          <p class="text-muted-foreground">Total deal {{ formatRupiah(inv?.total ?? 0) }} · DP aktif {{ formatRupiah(activeDP) }} · bisa ditagih {{ formatRupiah((inv?.total ?? 0) - activeDP) }}</p>
          <p v-if="dpPreview" class="font-medium">Invoice DP: {{ formatRupiah(dpPreview) }}</p>
        </div>

        <div v-else-if="dialog === 'payment'" class="space-y-3 text-sm">
          <div class="space-y-1">
            <Label for="pay-amount">Nominal (Rp) *</Label>
            <Input id="pay-amount" v-model="payment.amount" type="number" min="1" step="1"/>
            <p class="text-xs text-muted-foreground">Sisa tagihan {{ formatRupiah(remaining) }}</p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <Label for="pay-date">Tanggal bayar *</Label>
              <Input id="pay-date" v-model="payment.paid_on" type="date" :max="todayISO()"/>
            </div>
            <div class="space-y-1">
              <Label for="pay-method">Metode</Label>
              <select id="pay-method" v-model="payment.method" class="h-9 w-full rounded-md border bg-background px-3 text-sm">
                <option v-for="(label, value) in PAYMENT_METHODS" :key="value" :value="value">{{ label }}</option>
              </select>
            </div>
          </div>
          <div class="space-y-1">
            <Label for="pay-payer">Nama pengirim</Label>
            <Input id="pay-payer" v-model="payment.payer_name" maxlength="100"/>
          </div>
          <div class="space-y-1">
            <Label for="pay-note">Catatan</Label>
            <Input id="pay-note" v-model="payment.note" maxlength="500"/>
          </div>
          <div class="space-y-1">
            <Label for="pay-proof">Bukti transfer</Label>
            <input id="pay-proof" type="file" accept="image/*,application/pdf" class="block w-full text-sm" @change="pickProof"/>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" :disabled="busy" @click="dialog = null">Batal</Button>
          <Button :disabled="busy" :class="{ 'bg-red-600 hover:bg-red-700': dialog === 'void' || dialog === 'delete' }" @click="confirmDialog">
            <Loader2 v-if="busy" class="size-4 animate-spin"/>
            {{ dialogAction }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch} from 'vue'
import {toast} from 'vue-sonner'
import {Banknote, Copy, ExternalLink, FileDown, Link2, Loader2, Pencil, Send, Trash2} from 'lucide-vue-next'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import AppBreadcrumb from '~/components/elements/AppBreadcrumb.vue'
import {invoiceErrorMessage, useInvoiceService} from '~/services/invoice.service'
import {MAX_UPLOAD_BYTES, isImageOrPdf, readFileAsDataURL} from '~/utils/order.utils'
import type {Invoice} from '~/types/invoice.type'

const PAYMENT_METHODS: Record<string, string> = {bank_transfer: 'Transfer bank', cash: 'Tunai', other: 'Lainnya', midtrans: 'Midtrans'}
const PAYMENT_STATUS: Record<string, [string, string]> = {
  pending: ['Menunggu verifikasi', 'bg-orange-100 text-orange-800'],
  verified: ['Terverifikasi', 'bg-green-100 text-green-800'],
  rejected: ['Ditolak', 'bg-red-100 text-red-800'],
}
const EVENT_LABELS: Record<string, string> = {
  created: 'Dibuat', updated: 'Diubah', sent: 'Dikirim', voided: 'Di-void', paid: 'Lunas',
  payment_recorded: 'Pembayaran dicatat', deal_created: 'Deal dibuat', dp_created: 'DP dibuat', final_created: 'Final dibuat',
  payment_submitted: 'Bukti transfer dikirim', payment_rejected: 'Bukti transfer ditolak',
  online_payment_unapplied: 'Pembayaran online tidak dibukukan, perlu refund',
}

const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()
const {canAction} = useConsoleAccess()
const service = useInvoiceService()
const id = computed(() => Number(route.params.id))

const inv = ref<Invoice | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

async function load() {
  try {
    inv.value = await service.getInvoice(id.value)
    error.value = null
  } catch (e: any) {
    error.value = invoiceErrorMessage(e, 'Gagal memuat invoice')
  } finally {
    loading.value = false
  }
}
onMounted(load)
// creating a deal, DP or final navigates to the new document within this page
watch(id, () => {
  loading.value = true
  load()
})

const statusInfo = computed(() => INVOICE_STATUS[inv.value?.status || 'draft'] || [inv.value?.status, ''])
const billable = computed(() => !!inv.value && isBillableType(inv.value.type))
const remaining = computed(() => inv.value ? Math.max(0, inv.value.amount_due - inv.value.paid_amount) : 0)
const activeChildren = (type: string) => (inv.value?.children || []).filter(c => c.type === type && c.status !== 'void')
const activeDP = computed(() => activeChildren('dp').reduce((sum, c) => sum + c.total, 0))

const publicUrl = computed(() => inv.value ? `/invoice/${inv.value.public_token}` : '#')
const pdfUrl = computed(() => inv.value ? `${String(config.public.API_URL).replace(/\/$/, '')}/invoice/${inv.value.public_token}/pdf` : '#')
const storageUrl = (path: string) => path.startsWith('http') ? path : `${config.public.STORAGE_URL}${path}`

// buttons follow the document rules enforced by the API, gated by the role's permissions
const actions = computed(() => {
  const i = inv.value
  if (!i) return {} as Record<string, boolean>
  const can = (a: 'create' | 'update' | 'delete') => canAction(route.path, a)
  const status = i.status === 'overdue' ? 'sent' : i.status
  // purchase invoices of an order are priced and cancelled from the Transaksi page
  const orderPurchase = i.type === 'invoice' && !!i.order_id
  const hasMoney = i.paid_amount > 0 || i.payments.some(p => p.status === 'pending')
  return {
    edit: can('update') && status === 'draft' && !['dp', 'final'].includes(i.type) && !orderPurchase,
    send: can('update') && status === 'draft',
    payment: can('update') && status === 'sent' && isBillableType(i.type),
    void: can('delete') && ['draft', 'sent', 'approved'].includes(status) && !hasMoney && !i.children.some(c => c.status !== 'void'),
    delete: can('delete') && status === 'draft' && !i.children.length && !i.order_id,
    duplicate: can('create') && !['deal', 'dp', 'final'].includes(i.type),
    // an order's quotation becomes a deal when the customer accepts it
    deal: can('create') && i.type === 'quotation' && !i.order_id && (status === 'draft' || status === 'sent') && !activeChildren('deal').length,
    dp: can('create') && i.type === 'deal' && status === 'sent' && !activeChildren('final').length && activeDP.value < i.total,
    final: can('create') && i.type === 'deal' && status === 'sent' && !activeChildren('final').length,
  }
})

type DialogKind = 'send' | 'void' | 'delete' | 'duplicate' | 'deal' | 'dp' | 'final' | 'payment'
const dialog = ref<DialogKind | null>(null)
const busy = ref(false)
const notify = ref(true)
const voidReason = ref('')
const dpMode = ref<'percent' | 'amount'>('percent')
const dpValue = ref<number | string>(30)
const payment = reactive({amount: 0 as number | string, paid_on: todayISO(), method: 'bank_transfer', payer_name: '', note: ''})
const proofFile = ref<File | null>(null)

const dpPreview = computed(() => {
  const v = Number(dpValue.value) || 0
  if (!inv.value || v <= 0) return 0
  return dpMode.value === 'percent' ? Math.floor((inv.value.total * Math.round(v * 100) + 5000) / 10000) : Math.floor(v)
})

function open(kind: DialogKind) {
  notify.value = !!inv.value?.customer_email
  voidReason.value = ''
  payment.amount = remaining.value
  payment.paid_on = todayISO()
  payment.method = 'bank_transfer'
  payment.payer_name = ''
  payment.note = ''
  proofFile.value = null
  dialog.value = kind
}

const dialogTitle = computed(() => ({
  send: `Kirim ${inv.value?.number}`, void: `Void ${inv.value?.number}`, delete: `Hapus ${inv.value?.number}`,
  duplicate: 'Duplikat dokumen', deal: 'Buat deal', dp: 'Buat invoice DP', final: 'Buat invoice final', payment: 'Catat pembayaran',
} as Record<DialogKind, string>)[dialog.value!] || '')

const dialogDescription = computed(() => ({
  send: 'Status berubah menjadi terkirim dan dokumen tidak bisa diedit lagi.',
  void: 'Dokumen dibatalkan permanen. Nomor tidak dipakai ulang.',
  delete: 'Draft dihapus permanen.',
  duplicate: 'Salinan dibuat sebagai draft baru dengan nomor baru.',
  deal: 'Item, harga dan PPN quotation disalin ke deal baru (draft).',
  dp: 'Invoice uang muka dibuat sebagai draft. Jika deal memakai PPN, PPN dihitung dari nominal DP.',
  final: `Seluruh item deal ditagih, dikurangi DP aktif ${formatRupiah(activeDP.value)}.`,
  payment: 'Pembayaran yang dicatat admin langsung terverifikasi.',
} as Record<DialogKind, string>)[dialog.value!] || '')

const dialogAction = computed(() => ({
  send: 'Kirim', void: 'Void', delete: 'Hapus', duplicate: 'Duplikat', deal: 'Buat deal', dp: 'Buat DP', final: 'Buat final', payment: 'Simpan',
} as Record<DialogKind, string>)[dialog.value!] || 'OK')

function pickProof(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0] || null
  proofFile.value = null
  if (!file) return
  if (file.size > MAX_UPLOAD_BYTES || !isImageOrPdf(file)) {
    toast.error(file.size > MAX_UPLOAD_BYTES ? 'Bukti transfer maksimal 5 MB' : 'Bukti transfer harus gambar atau PDF')
    ;(e.target as HTMLInputElement).value = ''
    return
  }
  proofFile.value = file
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(`${window.location.origin}${publicUrl.value}`)
    toast.success('Link disalin')
  } catch {
    toast.error('Gagal menyalin link')
  }
}

// customer-submitted transfer proofs
async function verifyProof(paymentId: number) {
  busy.value = true
  try {
    inv.value = await service.verifyPayment(paymentId)
    toast.success(inv.value.status === 'paid' ? 'Terverifikasi, invoice lunas' : 'Pembayaran diverifikasi')
  } catch (e: any) {
    toast.error(invoiceErrorMessage(e, 'Verifikasi gagal'))
  } finally {
    busy.value = false
  }
}

async function rejectProof(paymentId: number) {
  const reason = window.prompt('Alasan penolakan (terlihat oleh customer)')?.trim()
  if (!reason) return
  busy.value = true
  try {
    inv.value = await service.rejectPayment(paymentId, reason)
    toast.success('Bukti transfer ditolak')
  } catch (e: any) {
    toast.error(invoiceErrorMessage(e, 'Gagal menolak'))
  } finally {
    busy.value = false
  }
}

const goTo = (target: Invoice) => router.push(`/console/secret/invoices/${target.id}/detail`)

async function confirmDialog() {
  if (!inv.value || !dialog.value) return
  const i = inv.value
  const kind = dialog.value
  if (kind === 'void' && !voidReason.value.trim()) {
    toast.error('Alasan void wajib diisi')
    return
  }
  busy.value = true
  try {
    switch (kind) {
      case 'send':
        inv.value = await service.sendInvoice(i.id, notify.value)
        toast.success(notify.value ? `Terkirim dan diemail ke ${i.customer_email}` : 'Ditandai terkirim')
        break
      case 'void':
        inv.value = await service.voidInvoice(i.id, voidReason.value.trim())
        toast.success('Dokumen di-void')
        break
      case 'delete':
        await service.deleteInvoice(i.id)
        toast.success('Draft dihapus')
        dialog.value = null
        await router.push('/console/secret/invoices')
        return
      case 'payment': {
        const file = proofFile.value
        const created = await service.recordPayment(i.id, {
          amount: Math.floor(Number(payment.amount) || 0), paid_on: payment.paid_on, method: payment.method,
          payer_name: payment.payer_name.trim(), note: payment.note.trim(),
          proof: file ? {file_name: file.name, content_type: file.type, content: await readFileAsDataURL(file)} : null,
        })
        inv.value = created
        toast.success(created.status === 'paid' ? 'Lunas' : 'Pembayaran dicatat')
        break
      }
      default: {
        const created = kind === 'duplicate' ? await service.duplicateInvoice(i.id)
          : kind === 'deal' ? await service.createDeal(i.id)
          : kind === 'final' ? await service.createFinal(i.id)
          : dpMode.value === 'percent'
            ? await service.createDownPayment(i.id, {percent_bps: Math.round((Number(dpValue.value) || 0) * 100)})
            : await service.createDownPayment(i.id, {amount: Math.floor(Number(dpValue.value) || 0)})
        toast.success(`${INVOICE_TYPE_LABELS[created.type]} ${created.number} dibuat`)
        dialog.value = null
        await goTo(created)
        return
      }
    }
    dialog.value = null
  } catch (e: any) {
    toast.error(invoiceErrorMessage(e, 'Aksi gagal'))
  } finally {
    busy.value = false
  }
}

useHead(() => ({title: inv.value?.number || 'Invoice'}))

definePageMeta({
  layout: 'console-secret'
})
</script>
