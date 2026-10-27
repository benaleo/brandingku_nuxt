<script setup lang="ts">
import {computed, onMounted, reactive, ref} from 'vue'
import {toast} from 'vue-sonner'
import {Loader2, Plus, Trash2} from 'lucide-vue-next'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'
import {invoiceErrorMessage, useInvoiceService} from '~/services/invoice.service'
import {useAppSettingsService} from '~/services/app-settings.service'
import type {Invoice, InvoiceInput, InvoiceType, TaxMode} from '~/types/invoice.type'

const props = defineProps<{
  invoice?: Invoice | null
  defaultType?: InvoiceType
}>()
const emit = defineEmits<{ saved: [invoice: Invoice]; cancel: [] }>()

const {createInvoice, updateInvoice} = useInvoiceService()
const {getAppSettings} = useAppSettingsService()
const isEdit = computed(() => !!props.invoice)

type Row = { key: number; description: string; quantity: number | string; unit_price: number | string; discount_pct: number | string; product_id?: number | null; product_additional_id?: number | null }
let rowKey = 0
const newRow = (r: Partial<Row> = {}): Row => ({key: ++rowKey, description: '', quantity: 1, unit_price: 0, discount_pct: 0, ...r})

const inv = props.invoice
const form = reactive({
  type: (inv?.type || props.defaultType || 'invoice') as InvoiceType,
  customer_name: inv?.customer_name || '',
  customer_company: inv?.customer_company || '',
  customer_email: inv?.customer_email || '',
  customer_phone: inv?.customer_phone || '',
  customer_address: inv?.customer_address || '',
  customer_npwp: inv?.customer_npwp || '',
  issue_date: inv?.issue_date || '',
  due_date: inv?.due_date || '',
  discount_total: inv?.discount_total || 0,
  shipping_fee: inv?.shipping_fee || 0,
  tax_mode: (inv?.tax_mode || 'none') as TaxMode,
  tax_rate_pct: inv ? inv.tax_rate_bps / 100 : 11,
  notes: inv?.notes || '',
  terms: inv?.terms || '',
})
const rows = ref<Row[]>(inv?.items?.length
  ? inv.items.map(it => newRow({
      description: it.description, quantity: it.quantity, unit_price: it.unit_price, discount_pct: it.discount_bps / 100,
      product_id: it.product_id, product_additional_id: it.product_additional_id,
    }))
  : [newRow()])

// new documents start from the invoice settings; an admin without access to them keeps the fallbacks
onMounted(async () => {
  if (isEdit.value) return
  try {
    const settings = Object.fromEntries((await getAppSettings('INVOICE_')).map(s => [s.key, s.value]))
    if (settings.INVOICE_TAX_MODE) form.tax_mode = settings.INVOICE_TAX_MODE as TaxMode
    if (settings.INVOICE_TAX_RATE_BPS) form.tax_rate_pct = Number(settings.INVOICE_TAX_RATE_BPS) / 100
    if (!form.terms && settings.INVOICE_TERMS) form.terms = settings.INVOICE_TERMS
  } catch {
    // keep defaults
  }
})

const num = (v: number | string) => (v === '' || v === null || v === undefined ? 0 : Number(v))
const bps = (pct: number | string) => Math.round(num(pct) * 100)

const preview = computed(() => previewInvoiceTotals({
  items: rows.value.map(r => ({quantity: num(r.quantity), unit_price: num(r.unit_price), discount_bps: bps(r.discount_pct)})),
  discount_total: num(form.discount_total),
  shipping_fee: num(form.shipping_fee),
  tax_mode: form.tax_mode,
  tax_rate_bps: bps(form.tax_rate_pct),
}))

const saving = ref(false)
const dueLabel = computed(() => form.type === 'quotation' ? 'Berlaku sampai' : 'Jatuh tempo')

function validate(): string | null {
  if (!form.customer_name.trim()) return 'Nama customer wajib diisi'
  if (!rows.value.length) return 'Minimal 1 item'
  for (const [i, r] of rows.value.entries()) {
    if (!r.description.trim()) return `Deskripsi item ${i + 1} wajib diisi`
    if (num(r.quantity) < 1) return `Jumlah item ${i + 1} minimal 1`
    if (num(r.unit_price) < 0) return `Harga item ${i + 1} tidak boleh negatif`
    if (num(r.discount_pct) < 0 || num(r.discount_pct) > 100) return `Diskon item ${i + 1} harus 0-100%`
  }
  if (num(form.discount_total) > preview.value.subtotal) return 'Diskon melebihi subtotal'
  if (form.issue_date && form.due_date && form.due_date < form.issue_date) return `${dueLabel.value} tidak boleh sebelum tanggal terbit`
  return null
}

async function submit() {
  const problem = validate()
  if (problem) {
    toast.error(problem)
    return
  }
  const input: InvoiceInput = {
    type: isEdit.value ? undefined : form.type,
    customer_name: form.customer_name.trim(),
    customer_company: form.customer_company.trim(),
    customer_email: form.customer_email.trim(),
    customer_phone: form.customer_phone.trim(),
    customer_address: form.customer_address.trim(),
    customer_npwp: form.customer_npwp.trim(),
    issue_date: form.issue_date || undefined,
    due_date: form.due_date || undefined,
    items: rows.value.map(r => ({
      description: r.description.trim(),
      quantity: Math.floor(num(r.quantity)),
      unit_price: Math.floor(num(r.unit_price)),
      discount_bps: bps(r.discount_pct),
      product_id: r.product_id ?? null,
      product_additional_id: r.product_additional_id ?? null,
    })),
    discount_total: Math.floor(num(form.discount_total)),
    shipping_fee: Math.floor(num(form.shipping_fee)),
    tax_mode: form.tax_mode,
    tax_rate_bps: bps(form.tax_rate_pct),
    notes: form.notes,
    terms: form.terms,
  }
  saving.value = true
  try {
    const saved = isEdit.value ? await updateInvoice(props.invoice!.id, input) : await createInvoice(input)
    toast.success(isEdit.value ? 'Draft disimpan' : `${INVOICE_TYPE_LABELS[saved.type]} ${saved.number} dibuat`)
    emit('saved', saved)
  } catch (e: any) {
    toast.error(invoiceErrorMessage(e, 'Gagal menyimpan'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="editor-form" @submit.prevent="submit">
    <FormsFormSection title="Customer" description="Data ini dicetak di invoice dan dipakai untuk email.">
      <div class="form-grid">
        <div v-if="!isEdit" class="space-y-2">
          <Label for="inv-type">Jenis dokumen</Label>
          <select id="inv-type" v-model="form.type" class="h-9 w-full rounded-md border bg-background px-3 text-sm">
            <option value="invoice">Invoice</option>
            <option value="quotation">Quotation</option>
          </select>
          <p class="text-xs text-muted-foreground">Deal, DP dan final dibuat dari halaman detail dokumen induknya.</p>
        </div>
        <div class="space-y-2">
          <Label for="inv-name">Nama customer *</Label>
          <Input id="inv-name" v-model="form.customer_name" maxlength="150" required/>
        </div>
        <div class="space-y-2">
          <Label for="inv-company">Perusahaan</Label>
          <Input id="inv-company" v-model="form.customer_company" maxlength="150"/>
        </div>
        <div class="space-y-2">
          <Label for="inv-email">Email</Label>
          <Input id="inv-email" v-model="form.customer_email" type="email" maxlength="150"/>
        </div>
        <div class="space-y-2">
          <Label for="inv-phone">Telepon</Label>
          <Input id="inv-phone" v-model="form.customer_phone" maxlength="40"/>
        </div>
        <div class="space-y-2">
          <Label for="inv-npwp">NPWP</Label>
          <Input id="inv-npwp" v-model="form.customer_npwp" maxlength="30" placeholder="Opsional"/>
        </div>
        <div class="space-y-2 md:col-span-2">
          <Label for="inv-address">Alamat</Label>
          <Textarea id="inv-address" v-model="form.customer_address" rows="2" maxlength="500"/>
        </div>
      </div>
    </FormsFormSection>

    <FormsFormSection title="Tanggal">
      <div class="form-grid">
        <div class="space-y-2">
          <Label for="inv-issue">Tanggal terbit</Label>
          <Input id="inv-issue" v-model="form.issue_date" type="date"/>
          <p class="text-xs text-muted-foreground">Kosong = hari ini.</p>
        </div>
        <div class="space-y-2">
          <Label for="inv-due">{{ dueLabel }}</Label>
          <Input id="inv-due" v-model="form.due_date" type="date"/>
          <p class="text-xs text-muted-foreground">Kosong = sesuai pengaturan invoice.</p>
        </div>
      </div>
    </FormsFormSection>

    <FormsFormSection title="Item">
      <div class="space-y-3">
        <div class="hidden gap-2 px-1 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[minmax(0,1fr)_90px_140px_90px_130px_36px]">
          <span>Deskripsi</span><span>Qty</span><span>Harga satuan</span><span>Diskon %</span><span class="text-right">Jumlah</span><span></span>
        </div>
        <div
          v-for="(row, i) in rows"
          :key="row.key"
          class="grid grid-cols-2 gap-2 rounded-md border p-2 md:grid-cols-[minmax(0,1fr)_90px_140px_90px_130px_36px] md:items-center md:border-0 md:p-0"
        >
          <Input v-model="row.description" class="col-span-2 md:col-span-1" placeholder="Deskripsi item" maxlength="300" :aria-label="`Deskripsi item ${i + 1}`"/>
          <Input v-model="row.quantity" type="number" min="1" step="1" :aria-label="`Qty item ${i + 1}`"/>
          <Input v-model="row.unit_price" type="number" min="0" step="1" :aria-label="`Harga item ${i + 1}`"/>
          <Input v-model="row.discount_pct" type="number" min="0" max="100" step="0.01" :aria-label="`Diskon item ${i + 1}`"/>
          <span class="self-center text-right text-sm font-medium">{{ formatRupiah(preview.lines[i] ?? 0) }}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            class="justify-self-end"
            :aria-label="`Hapus item ${i + 1}`"
            :disabled="rows.length === 1"
            @click="rows.splice(i, 1)"
          >
            <Trash2 class="size-4"/>
          </Button>
        </div>
        <Button type="button" variant="outline" size="sm" :disabled="rows.length >= 100" @click="rows.push(newRow())">
          <Plus class="size-4"/> Tambah item
        </Button>
      </div>
    </FormsFormSection>

    <FormsFormSection title="Biaya & PPN">
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div class="form-grid">
          <div class="space-y-2">
            <Label for="inv-discount">Diskon (Rp)</Label>
            <Input id="inv-discount" v-model="form.discount_total" type="number" min="0" step="1"/>
          </div>
          <div class="space-y-2">
            <Label for="inv-shipping">Ongkos kirim (Rp)</Label>
            <Input id="inv-shipping" v-model="form.shipping_fee" type="number" min="0" step="1"/>
          </div>
          <div class="space-y-2">
            <Label for="inv-tax-mode">Mode PPN</Label>
            <select id="inv-tax-mode" v-model="form.tax_mode" class="h-9 w-full rounded-md border bg-background px-3 text-sm">
              <option v-for="(label, value) in TAX_MODE_LABELS" :key="value" :value="value">{{ label }}</option>
            </select>
          </div>
          <div v-if="form.tax_mode !== 'none'" class="space-y-2">
            <Label for="inv-tax-rate">Tarif PPN (%)</Label>
            <Input id="inv-tax-rate" v-model="form.tax_rate_pct" type="number" min="0" max="100" step="0.01"/>
          </div>
        </div>
        <dl class="space-y-1.5 rounded-lg border bg-muted/30 p-4 text-sm">
          <div class="flex justify-between"><dt>Subtotal</dt><dd>{{ formatRupiah(preview.subtotal) }}</dd></div>
          <div v-if="num(form.discount_total) > 0" class="flex justify-between"><dt>Diskon</dt><dd>-{{ formatRupiah(num(form.discount_total)) }}</dd></div>
          <div v-if="num(form.shipping_fee) > 0" class="flex justify-between"><dt>Ongkos kirim</dt><dd>{{ formatRupiah(num(form.shipping_fee)) }}</dd></div>
          <template v-if="form.tax_mode !== 'none'">
            <div class="flex justify-between text-muted-foreground"><dt>DPP</dt><dd>{{ formatRupiah(preview.base) }}</dd></div>
            <div class="flex justify-between text-muted-foreground"><dt>PPN {{ formatBps(bps(form.tax_rate_pct)) }}</dt><dd>{{ formatRupiah(preview.tax) }}</dd></div>
          </template>
          <div class="flex justify-between border-t pt-2 text-base font-semibold"><dt>Total</dt><dd>{{ formatRupiah(preview.total) }}</dd></div>
          <p class="pt-1 text-xs text-muted-foreground">Perkiraan; angka final dihitung server saat disimpan.</p>
        </dl>
      </div>
    </FormsFormSection>

    <FormsFormSection title="Catatan">
      <div class="form-grid">
        <div class="space-y-2 md:col-span-2">
          <Label for="inv-notes">Catatan untuk customer</Label>
          <Textarea id="inv-notes" v-model="form.notes" rows="2" maxlength="2000"/>
        </div>
        <div class="space-y-2 md:col-span-2">
          <Label for="inv-terms">Syarat & ketentuan</Label>
          <Textarea id="inv-terms" v-model="form.terms" rows="3" maxlength="4000"/>
        </div>
      </div>
    </FormsFormSection>

    <div class="form-actions">
      <Button type="button" variant="outline" class="w-full sm:w-auto sm:min-w-28" :disabled="saving" @click="emit('cancel')">Batal</Button>
      <Button type="submit" class="w-full sm:w-auto sm:min-w-32" :disabled="saving">
        <Loader2 v-if="saving" class="size-4 animate-spin"/>
        {{ saving ? 'Menyimpan…' : 'Simpan draft' }}
      </Button>
    </div>
  </form>
</template>
