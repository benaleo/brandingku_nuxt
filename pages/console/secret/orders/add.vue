<template>
  <div class="pb-6">
    <AppBreadcrumb/>
    <AppTableHeader :pageTitle="pageTitle"/>

    <div class="mt-4 grid gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <!-- customer -->
        <section class="space-y-3 rounded-xl border bg-card p-4">
          <h2 class="font-semibold">Customer</h2>
          <div v-if="customer" class="flex items-start justify-between gap-3 rounded-lg border bg-muted/40 p-3 text-sm">
            <div class="min-w-0">
              <p class="font-medium">{{ customer.name }}</p>
              <p class="text-muted-foreground">{{ customer.email }} · {{ customer.phone || '-' }}</p>
            </div>
            <Button variant="outline" size="sm" @click="clearCustomer">Ganti</Button>
          </div>
          <div v-else class="relative">
            <Input v-model="customerKeyword" placeholder="Cari nama, email, atau nomor telepon…" @input="searchCustomers"/>
            <div v-if="customerLoading" class="mt-2 text-xs text-muted-foreground">Mencari…</div>
            <ul v-else-if="customerResults.length" class="mt-2 max-h-64 divide-y overflow-auto rounded-lg border bg-background">
              <li v-for="c in customerResults" :key="c.id">
                <button type="button" class="w-full px-3 py-2 text-left text-sm hover:bg-muted" @click="pickCustomer(c)">
                  <span class="font-medium">{{ c.name }}</span>
                  <span class="block text-xs text-muted-foreground">{{ c.email }} · {{ c.phone || '-' }}</span>
                </button>
              </li>
            </ul>
            <p v-else-if="customerKeyword.trim()" class="mt-2 text-xs text-muted-foreground">Customer tidak ditemukan.</p>
          </div>
        </section>

        <!-- items -->
        <section class="space-y-3 rounded-xl border bg-card p-4">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">Item</h2>
            <Button variant="outline" size="sm" @click="addRow">Tambah item +</Button>
          </div>
          <div v-for="(row, i) in rows" :key="row.key" class="space-y-3 rounded-lg border p-3">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <Label class="text-xs">Produk</Label>
                <div v-if="row.product" class="mt-1 flex items-center justify-between gap-2 text-sm">
                  <span class="font-medium">[{{ row.product.slug }}] - {{ row.product.name }}</span>
                  <Button variant="ghost" size="sm" @click="clearProduct(row)">Ganti</Button>
                </div>
                <div v-else>
                  <Input v-model="row.keyword" class="mt-1" placeholder="Cari produk…" @input="searchProducts(row)"/>
                  <ul v-if="row.results.length" class="mt-2 max-h-56 divide-y overflow-auto rounded-lg border bg-background">
                    <li v-for="p in row.results" :key="p.id">
                      <button type="button" class="w-full px-3 py-2 text-left text-sm hover:bg-muted" @click="pickProduct(row, p)">[{{ p.slug }}] - {{ p.name }}</button>
                    </li>
                  </ul>
                </div>
              </div>
              <Button variant="ghost" size="sm" class="text-red-600" :disabled="rows.length === 1" @click="rows.splice(i, 1)">Hapus</Button>
            </div>

            <template v-if="row.product">
              <div class="grid gap-3 sm:grid-cols-3">
                <div class="sm:col-span-2">
                  <Label class="text-xs">Varian</Label>
                  <select v-model.number="row.variantId" class="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm">
                    <option :value="0" disabled>Pilih varian</option>
                    <option v-for="v in row.variants" :key="v.id" :value="v.id">{{ v.name }} · {{ formatRupiah(v.price) }} · MOQ {{ v.moq }}</option>
                  </select>
                </div>
                <div>
                  <Label class="text-xs">Jumlah</Label>
                  <Input v-model.number="row.quantity" type="number" min="1" max="100000" class="mt-1"/>
                </div>
              </div>

              <div v-if="row.brandings.length">
                <Label class="text-xs">Branding</Label>
                <div class="mt-1 flex flex-wrap gap-2">
                  <label v-for="b in row.brandings" :key="b.branding_method_id" class="flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1 text-sm"
                         :class="row.brandingIds.includes(b.branding_method_id) && 'border-green-600 bg-green-50'">
                    <input v-model="row.brandingIds" type="checkbox" :value="b.branding_method_id">
                    {{ b.name }}
                    <span v-if="!b.priced" class="text-xs text-amber-700">belum ada harga</span>
                    <span v-else class="text-xs text-muted-foreground">
                      {{ formatRupiah(catalogBrandingPrice(b, row.quantity)) }}/pcs · {{ b.category_name ? `harga kategori ${b.category_name}` : 'harga produk' }}
                    </span>
                  </label>
                </div>
                <div v-if="row.brandingIds.length" class="mt-2 grid gap-3 sm:grid-cols-2">
                  <div v-for="id in row.brandingIds" :key="id">
                    <Label class="text-xs">Harga branding per pcs · {{ row.brandings.find(b => b.branding_method_id === id)?.name }}</Label>
                    <Input v-model="row.brandingPrices[id]" type="number" min="1" class="mt-1" placeholder="Opsional, kosongkan untuk harga katalog"/>
                    <p v-if="brandingPriceInvalid(row, id)" class="mt-1 text-xs text-red-600">Harga harus lebih dari 0, atau kosongkan.</p>
                  </div>
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label class="text-xs">Catatan</Label>
                  <Input v-model="row.note" maxlength="500" class="mt-1"/>
                </div>
                <div>
                  <Label class="text-xs">Harga per pcs (override)</Label>
                  <Input v-model="row.unitPrice" type="number" min="1" class="mt-1" :placeholder="catalogPrice(row) != null ? `Katalog ${formatRupiah(catalogPrice(row)!)}` : 'Kosongkan untuk harga katalog'"/>
                  <p v-if="priceInvalid(row)" class="mt-1 text-xs text-red-600">Harga harus lebih dari 0, atau kosongkan.</p>
                </div>
              </div>
            </template>
          </div>
        </section>

        <!-- payment flow and due date -->
        <section class="space-y-3 rounded-xl border bg-card p-4">
          <h2 class="font-semibold">Pembayaran dan jadwal</h2>
          <div class="inline-flex rounded-lg border p-1 text-sm">
            <button v-for="f in FLOWS" :key="f.value" type="button" class="rounded-md px-3 py-1.5"
                    :class="form.payment_flow === f.value ? 'bg-green-600 font-medium text-white' : 'text-muted-foreground hover:bg-muted'"
                    @click="form.payment_flow = f.value">{{ f.label }}</button>
          </div>
          <p class="text-xs text-muted-foreground">
            {{ staged
              ? 'Harga sudah disepakati: order langsung masuk deal, lalu pembayaran pertama, tahap produksi, dan pelunasan. Voucher tidak berlaku.'
              : 'Satu invoice, customer membayar penuh.' }}
          </p>
          <div v-if="staged" class="space-y-3 rounded-lg border bg-muted/30 p-3">
            <Label class="text-xs">Pembayaran pertama</Label>
            <select v-model="form.first_payment" class="h-9 w-full rounded-md border bg-background px-3 text-sm">
              <option value="customer">Customer yang pilih (DP atau lunas)</option>
              <option value="dp">DP</option>
              <option value="full">Langsung pelunasan</option>
            </select>
            <template v-if="form.first_payment === 'dp'">
              <div class="inline-flex rounded-lg border p-1 text-sm">
                <button v-for="m in DP_MODES" :key="m.value" type="button" class="rounded-md px-3 py-1.5"
                        :class="form.dp_mode === m.value ? 'bg-green-600 font-medium text-white' : 'text-muted-foreground hover:bg-muted'"
                        @click="form.dp_mode = m.value">{{ m.label }}</button>
              </div>
              <Input v-if="form.dp_mode === 'percent'" v-model="form.dp_percent" type="number" min="1" max="99" step="any" placeholder="Persentase DP, mis. 30"/>
              <Input v-else v-model="form.dp_amount" type="number" min="1" placeholder="Nominal DP"/>
              <p v-if="dpInvalid" class="text-xs text-red-600">{{ dpInvalid }}</p>
            </template>
          </div>
          <div>
            <Label class="text-xs">Tanggal dibutuhkan (opsional)</Label>
            <ElementsDateTimeInput v-model="form.due_date" :min="todayISO()" class="mt-1"/>
            <p class="mt-1 text-xs text-muted-foreground">Tanggal customer butuh barangnya, bukan batas pembayaran.</p>
          </div>
        </section>

        <!-- delivery and contact -->
        <section class="space-y-3 rounded-xl border bg-card p-4">
          <h2 class="font-semibold">Pengiriman dan kontak</h2>
          <div class="inline-flex rounded-lg border p-1 text-sm">
            <button v-for="m in METHODS" :key="m.value" type="button" class="rounded-md px-3 py-1.5"
                    :class="form.delivery_method === m.value ? 'bg-green-600 font-medium text-white' : 'text-muted-foreground hover:bg-muted'"
                    @click="form.delivery_method = m.value">{{ m.label }}</button>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div><Label class="text-xs">Nama *</Label><Input v-model="form.customer_name" maxlength="150" class="mt-1"/></div>
            <div><Label class="text-xs">Telepon *</Label><Input v-model="form.customer_phone" maxlength="40" class="mt-1"/></div>
            <div class="sm:col-span-2"><Label class="text-xs">Perusahaan</Label><Input v-model="form.customer_company" maxlength="150" class="mt-1"/></div>
          </div>
          <div v-if="form.delivery_method === 'delivery' && customer" class="space-y-2 rounded-lg border bg-muted/30 p-3">
            <Label class="text-xs">Buku alamat customer</Label>
            <select v-model.number="selectedAddressId" class="h-9 w-full rounded-md border bg-background px-3 text-sm" @change="pickAddress">
              <option :value="0">{{ addresses.length ? 'Pilih alamat tersimpan' : 'Belum ada alamat tersimpan' }}</option>
              <option v-for="a in addresses" :key="a.id" :value="a.id">{{ a.label || 'Tanpa label' }} · {{ a.recipient_name }} · {{ a.city }}</option>
            </select>
            <div class="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" :disabled="addressBusy" @click="openSaveAddress">Simpan sebagai alamat baru</Button>
              <Button v-if="selectedAddress" type="button" variant="outline" size="sm" :disabled="addressBusy || !addressChanged" @click="updateAddress">Perbarui alamat</Button>
              <Button v-if="selectedAddress" type="button" variant="ghost" size="sm" class="text-red-600" :disabled="addressBusy" @click="deleteOpen = true">Hapus alamat</Button>
            </div>
          </div>
          <div v-if="form.delivery_method === 'delivery'" class="grid gap-3 sm:grid-cols-2">
            <div><Label class="text-xs">Nama penerima *</Label><Input v-model="form.shipping_name" maxlength="150" class="mt-1"/></div>
            <div><Label class="text-xs">Telepon penerima *</Label><Input v-model="form.shipping_phone" maxlength="40" class="mt-1"/></div>
            <div class="sm:col-span-2"><Label class="text-xs">Alamat *</Label><Textarea v-model="form.shipping_address" rows="2" maxlength="500" class="mt-1"/></div>
            <div><Label class="text-xs">Kota *</Label><Input v-model="form.shipping_city" maxlength="100" class="mt-1"/></div>
            <div><Label class="text-xs">Kode pos</Label><Input v-model="form.shipping_postal_code" maxlength="10" class="mt-1"/></div>
            <div class="sm:col-span-2">
              <Label class="text-xs">Ongkir</Label>
              <Input v-model="form.shipping_fee" type="number" min="0" class="mt-1" placeholder="Kosongkan bila ongkir belum diketahui"/>
              <p v-if="shippingFeeInvalid" class="mt-1 text-xs text-red-600">Ongkir tidak boleh negatif.</p>
              <p v-else-if="staged" class="mt-1 text-xs text-muted-foreground">Wajib diisi pada order bertahap, isi 0 bila gratis ongkir.</p>
              <p v-else class="mt-1 text-xs text-muted-foreground">Bila dikosongkan, order berstatus "menunggu ongkir" sampai ongkir diisi.</p>
            </div>
          </div>
          <div><Label class="text-xs">Catatan order</Label><Textarea v-model="form.notes" rows="2" maxlength="1000" class="mt-1"/></div>
          <div v-if="!staged"><Label class="text-xs">Kode voucher</Label><Input v-model="form.voucher_code" maxlength="50" class="mt-1"/></div>
        </section>
      </div>

      <!-- summary -->
      <aside class="lg:col-span-1">
        <section class="space-y-3 rounded-xl border bg-card p-4 lg:sticky lg:top-4">
          <h2 class="font-semibold">Ringkasan</h2>
          <p v-if="previewError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{{ previewError }}</p>
          <p v-if="!preview && !previewLoading" class="text-sm text-muted-foreground">Pilih customer dan item untuk melihat harga.</p>
          <div v-if="previewLoading" class="text-xs text-muted-foreground">Menghitung…</div>
          <template v-if="preview">
            <div v-for="(l, i) in preview.lines" :key="i" class="space-y-1 border-b pb-2 text-sm">
              <p class="font-medium">{{ l.product_name }} <span class="text-muted-foreground">· {{ l.variant_name }}</span></p>
              <p class="text-xs text-muted-foreground">
                {{ l.quantity }} × {{ formatRupiah(l.unit_price) }}
                <template v-if="l.original_unit_price !== l.unit_price"> (katalog {{ formatRupiah(l.original_unit_price) }})</template>
              </p>
              <p v-if="l.brandings?.length" class="text-xs text-muted-foreground">
                Branding: {{ l.brandings.map(b => `${b.name} +${formatRupiah(b.unit_price)}`).join(', ') }}
              </p>
              <p class="text-right font-medium tabular-nums">{{ formatRupiah(l.line_total) }}</p>
              <p v-if="l.blocked" class="rounded-md border border-red-300 bg-red-50 px-2 py-1 text-xs text-red-700">{{ l.problem }} (tidak dihitung di total)</p>
              <p v-else-if="l.problem" class="rounded-md border border-yellow-300 bg-yellow-50 px-2 py-1 text-xs text-yellow-800">{{ l.problem }}</p>
            </div>
            <dl class="space-y-1 text-sm">
              <div class="flex justify-between"><dt class="text-muted-foreground">Subtotal</dt><dd class="tabular-nums">{{ formatRupiah(preview.subtotal) }}</dd></div>
              <div v-if="preview.discount" class="flex justify-between"><dt class="text-muted-foreground">Diskon</dt><dd class="tabular-nums">-{{ formatRupiah(preview.discount) }}</dd></div>
              <div v-if="preview.tax_total" class="flex justify-between"><dt class="text-muted-foreground">Pajak ({{ formatBps(preview.tax_rate_bps) }})</dt><dd class="tabular-nums">{{ formatRupiah(preview.tax_total) }}</dd></div>
              <div v-if="form.delivery_method === 'delivery'" class="flex justify-between">
                <dt class="text-muted-foreground">Ongkir</dt>
                <dd class="tabular-nums">{{ preview.shipping_fee > 0 ? formatRupiah(preview.shipping_fee) : staged && hasShippingFee ? 'Gratis' : 'Menunggu ongkir' }}</dd>
              </div>
              <div class="flex justify-between text-base font-bold"><dt>Total</dt><dd class="tabular-nums">{{ formatRupiah(preview.total) }}</dd></div>
              <div v-if="staged && preview.first_payment_amount != null" class="flex justify-between">
                <dt class="text-muted-foreground">Tagihan pertama</dt><dd class="tabular-nums">{{ formatRupiah(preview.first_payment_amount) }}</dd>
              </div>
              <div v-if="staged && preview.first_payment_amount != null" class="flex justify-between">
                <dt class="text-muted-foreground">Sisa pelunasan</dt><dd class="tabular-nums">{{ formatRupiah(preview.total - preview.first_payment_amount) }}</dd>
              </div>
            </dl>
            <p v-if="preview.lines.length && preview.lines.every(l => l.blocked)" class="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
              Total Rp 0 karena semua item tidak dihitung. Isi harga produk atau harga branding pada item yang bermasalah.
            </p>
            <p v-if="preview.voucher_message" class="text-xs text-muted-foreground">{{ preview.voucher_message }}</p>
          </template>
          <p v-if="submitHint" class="text-xs text-amber-700">{{ submitHint }}</p>
          <div class="flex gap-2 pt-2">
            <Button variant="outline" class="flex-1" :disabled="saving" @click="router.push('/console/secret/orders')">Batal</Button>
            <Button variant="primary" class="flex-1" :disabled="saving || submitBlocked" @click="submit">
              <Loader2 v-if="saving" class="mr-1 size-4 animate-spin"/> Buat Order
            </Button>
          </div>
        </section>
      </aside>
    </div>

    <ElementsConfirmDialog
      v-model:open="labelOpen"
      title="Simpan alamat baru"
      description="Beri label agar mudah dikenali, mis. Kantor atau Rumah. Boleh dikosongkan."
      confirm-label="Simpan"
      :busy="addressBusy"
      @confirm="saveNewAddress"
    >
      <Input v-model="addressLabel" maxlength="50" class="mt-3" placeholder="Label alamat (opsional)" @keyup.enter="saveNewAddress"/>
    </ElementsConfirmDialog>
    <ElementsConfirmDialog
      v-model:open="deleteOpen"
      title="Hapus alamat?"
      :description="selectedAddress ? `${selectedAddress.label || selectedAddress.recipient_name} akan dihapus dari buku alamat customer.` : ''"
      confirm-label="Hapus"
      tone="danger"
      :icon="Trash2"
      :busy="addressBusy"
      @confirm="removeAddress"
    />
  </div>
</template>

<script setup lang="ts">
import {computed, reactive, ref, watch} from 'vue'
import {toast} from 'vue-sonner'
import {Loader2, Trash2} from 'lucide-vue-next'
import ElementsConfirmDialog from '~/components/elements/ConfirmDialog.vue'
import AppBreadcrumb from '~/components/elements/AppBreadcrumb.vue'
import AppTableHeader from '~/components/elements/AppTableHeader.vue'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'
import {useGql} from '~/composables/useGql'
import {useOrderService} from '~/services/order.service'
import {useBrandingService} from '~/services/branding.service'
import {useCustomerAddressService} from '~/services/customer.service'
import {invoiceErrorMessage} from '~/services/invoice.service'
import type {Customer, CustomerAddress, CustomerAddressInput} from '~/types/customer.type'
import type {BrandingTier} from '~/types/branding.type'
import type {AdminOrderInput, CheckoutPreview, PaymentPlanInput} from '~/types/order.type'

type Variant = { id: number; name: string; price: number; moq: number }
type Row = {
  key: number
  keyword: string
  results: { id: number; name: string; slug: string }[]
  product: { id: number; name: string; slug: string } | null
  variants: Variant[]
  brandings: { branding_method_id: number; name: string; priced: boolean; tiers: BrandingTier[]; category_name: string }[]
  variantId: number
  quantity: number
  brandingIds: number[]
  note: string
  unitPrice: string | number
  // per-piece branding price override, by branding_method_id
  brandingPrices: Record<number, string | number>
}

const pageTitle = 'Buat Order'
useHead({title: pageTitle})
definePageMeta({layout: 'console-secret'})

const router = useRouter()
const {gqlFetch} = useGql()
const {previewAdminOrder, adminCreateOrder} = useOrderService()
const {getProductBrandings} = useBrandingService()

const FLOWS = [{value: 'direct', label: 'Langsung'}, {value: 'staged', label: 'Bertahap (DP, produksi, pelunasan)'}] as const
const DP_MODES = [{value: 'percent', label: 'Persen'}, {value: 'amount', label: 'Nominal'}] as const
const METHODS = [{value: 'delivery', label: 'Pengiriman'}, {value: 'pickup', label: 'Ambil di tempat'}] as const
// one key per form: a double submit or a retry returns the same order
const idempotencyKey = newIdempotencyKey()

const form = reactive({
  delivery_method: 'delivery' as 'delivery' | 'pickup',
  customer_name: '',
  customer_phone: '',
  customer_company: '',
  shipping_name: '',
  shipping_phone: '',
  shipping_address: '',
  shipping_city: '',
  shipping_postal_code: '',
  notes: '',
  voucher_code: '',
  shipping_fee: '' as string | number,
  due_date: '',
  payment_flow: 'direct' as 'direct' | 'staged',
  // staged: 'customer' lets the customer choose DP or full on their order page
  first_payment: 'customer' as 'customer' | 'dp' | 'full',
  dp_mode: 'percent' as 'percent' | 'amount',
  dp_percent: 30 as string | number,
  dp_amount: '' as string | number,
})
const staged = computed(() => form.payment_flow === 'staged')

// address book
const {getCustomerAddresses, createCustomerAddress, updateCustomerAddress, deleteCustomerAddress} = useCustomerAddressService()
const addresses = ref<CustomerAddress[]>([])
const selectedAddressId = ref(0)
const addressBusy = ref(false)
const labelOpen = ref(false)
const addressLabel = ref('')
const deleteOpen = ref(false)
const selectedAddress = computed(() => addresses.value.find(a => a.id === selectedAddressId.value) || null)
const addressInput = (label?: string): CustomerAddressInput => ({
  label: label?.trim() || undefined,
  recipient_name: form.shipping_name.trim(),
  phone: form.shipping_phone.trim(),
  address: form.shipping_address.trim(),
  city: form.shipping_city.trim(),
  postal_code: form.shipping_postal_code.trim() || undefined,
})
const addressChanged = computed(() => {
  const a = selectedAddress.value
  if (!a) return false
  const i = addressInput()
  return a.recipient_name !== i.recipient_name || a.phone !== i.phone || a.address !== i.address || a.city !== i.city || (a.postal_code || '') !== (i.postal_code || '')
})
const addressComplete = () => {
  const i = addressInput()
  if (i.recipient_name && i.phone && i.address && i.city) return true
  toast.error('Lengkapi nama penerima, telepon, alamat, dan kota dulu')
  return false
}
const loadAddresses = async () => {
  const id = customer.value?.id
  if (!id) return
  try {
    const list = await getCustomerAddresses(id)
    if (customer.value?.id === id) addresses.value = list
  } catch (e: any) {
    toast.error(invoiceErrorMessage(e, 'Alamat customer gagal dimuat'))
  }
}
const pickAddress = () => {
  const a = selectedAddress.value
  if (!a) return
  form.shipping_name = a.recipient_name
  form.shipping_phone = a.phone
  form.shipping_address = a.address
  form.shipping_city = a.city
  form.shipping_postal_code = a.postal_code || ''
}
const openSaveAddress = () => {
  if (!addressComplete()) return
  addressLabel.value = ''
  labelOpen.value = true
}
const saveNewAddress = async () => {
  if (!customer.value || addressBusy.value || !addressComplete()) return
  addressBusy.value = true
  try {
    const created = await createCustomerAddress(customer.value.id, addressInput(addressLabel.value))
    labelOpen.value = false
    await loadAddresses()
    selectedAddressId.value = created.id
    toast.success('Alamat disimpan')
  } catch (e: any) {
    toast.error(invoiceErrorMessage(e, 'Alamat gagal disimpan'))
  } finally {
    addressBusy.value = false
  }
}
const updateAddress = async () => {
  const a = selectedAddress.value
  if (!a || !addressComplete()) return
  addressBusy.value = true
  try {
    await updateCustomerAddress(a.id, addressInput(a.label))
    await loadAddresses()
    toast.success('Alamat diperbarui')
  } catch (e: any) {
    toast.error(invoiceErrorMessage(e, 'Alamat gagal diperbarui'))
  } finally {
    addressBusy.value = false
  }
}
const removeAddress = async () => {
  const a = selectedAddress.value
  if (!a) return
  addressBusy.value = true
  try {
    await deleteCustomerAddress(a.id)
    deleteOpen.value = false
    selectedAddressId.value = 0
    await loadAddresses()
    toast.success('Alamat dihapus')
  } catch (e: any) {
    toast.error(invoiceErrorMessage(e, 'Alamat gagal dihapus'))
  } finally {
    addressBusy.value = false
  }
}

// customer
const customer = ref<Customer | null>(null)
const customerKeyword = ref('')
const customerResults = ref<Customer[]>([])
const customerLoading = ref(false)
let customerSeq = 0
let customerTimer: ReturnType<typeof setTimeout> | undefined

const searchCustomers = () => {
  clearTimeout(customerTimer)
  const keyword = customerKeyword.value.trim()
  if (!keyword) { customerResults.value = []; return }
  customerTimer = setTimeout(async () => {
    const seq = ++customerSeq
    customerLoading.value = true
    try {
      const res = await gqlFetch<{ getCustomers: { items: Customer[] } }>(
        `query getCustomers($keyword: String) {
          getCustomers(pagination: { page: 1, limit: 10 }, keyword: $keyword) { items { id name email phone address is_active } }
        }`,
        {keyword},
        {auth: true},
      )
      if (seq !== customerSeq) return
      // active customers first
      customerResults.value = [...res.getCustomers.items].sort((a, b) => Number(b.is_active) - Number(a.is_active))
    } catch (e: any) {
      if (seq === customerSeq) toast.error(invoiceErrorMessage(e, 'Customer gagal dimuat'))
    } finally {
      if (seq === customerSeq) customerLoading.value = false
    }
  }, 300)
}

const pickCustomer = (c: Customer) => {
  customer.value = c
  customerResults.value = []
  form.customer_name = c.name || ''
  form.customer_phone = c.phone || ''
  form.shipping_name = c.name || ''
  form.shipping_phone = c.phone || ''
  form.shipping_address = c.address || ''
  form.shipping_city = ''
  form.shipping_postal_code = ''
  form.customer_company = ''
  selectedAddressId.value = 0
  loadAddresses()
}
const clearCustomer = () => {
  form.shipping_city = ''
  form.shipping_postal_code = ''
  form.customer_company = ''
  customer.value = null; customerKeyword.value = ''; addresses.value = []; selectedAddressId.value = 0 }

// items
let rowKey = 0
const newRow = (): Row => ({
  key: ++rowKey, keyword: '', results: [], product: null, variants: [], brandings: [],
  variantId: 0, quantity: 1, brandingIds: [], note: '', unitPrice: '', brandingPrices: {},
})
const rows = ref<Row[]>([newRow()])
const addRow = () => rows.value.push(newRow())

const productTimers = new Map<number, ReturnType<typeof setTimeout>>()
const searchProducts = (row: Row) => {
  clearTimeout(productTimers.get(row.key))
  const keyword = row.keyword.trim()
  if (!keyword) { row.results = []; return }
  productTimers.set(row.key, setTimeout(async () => {
    try {
      const res = await gqlFetch<{ getProducts: { items: { id: number | string; name: string; slug: string }[] } }>(
        `query getProducts($keyword: String) {
          getProducts(pagination: { page: 1, limit: 10 }, keyword: $keyword, is_active: true) { items { id name slug } }
        }`,
        {keyword},
        {auth: true},
      )
      row.results = res.getProducts.items.map(p => ({id: Number(p.id), name: p.name, slug: p.slug}))
    } catch (e: any) {
      toast.error(invoiceErrorMessage(e, 'Produk gagal dimuat'))
    }
  }, 300))
}

const pickProduct = async (row: Row, p: { id: number; name: string; slug: string }) => {
  row.product = p
  row.results = []
  row.keyword = ''
  try {
    const [detail, brandings] = await Promise.all([
      gqlFetch<{ getProductDetail: { additionals: { id: number | string; name: string; price: number; moq: number; is_active: boolean }[] } }>(
        `query getProductDetail($id: Int!) { getProductDetail(id: $id) { additionals { id name price moq is_active } } }`,
        {id: p.id},
        {auth: true},
      ),
      getProductBrandings(p.id),
    ])
    // only active variants can be ordered
    row.variants = detail.getProductDetail.additionals.filter(a => a.is_active !== false)
      .map(a => ({id: Number(a.id), name: a.name, price: a.price, moq: a.moq}))
    row.brandings = brandings.filter(b => b.is_active && b.is_offered).map(b => ({
      branding_method_id: b.branding_method_id, name: b.name, priced: b.tiers.length > 0, tiers: b.tiers,
      category_name: b.price_source === 'category' ? b.category_name : '',
    }))
    if (row.variants.length === 1) row.variantId = row.variants[0].id
  } catch (e: any) {
    toast.error(invoiceErrorMessage(e, 'Detail produk gagal dimuat'))
    clearProduct(row)
  }
}

const clearProduct = (row: Row) => {
  row.product = null
  row.variants = []
  row.brandings = []
  row.variantId = 0
  row.brandingIds = []
  row.brandingPrices = {}
  row.unitPrice = ''
}

// a variant's moq becomes the starting quantity; an override belongs to one variant
watch(() => rows.value.map(r => `${r.key}:${r.variantId}`), (now, old) => {
  const before = new Map((old || []).map(k => k.split(':') as [string, string]))
  rows.value.forEach(r => {
    const prev = before.get(String(r.key))
    if (prev === undefined || Number(prev) === r.variantId) return
    r.unitPrice = ''
    const moq = r.variants.find(v => v.id === r.variantId)?.moq || 1
    if (r.quantity < moq) r.quantity = moq
  })
})

// unchecking a branding drops its price override
watch(() => rows.value.map(r => r.brandingIds.join(',')), () => {
  rows.value.forEach(r => {
    Object.keys(r.brandingPrices).forEach(k => {
      if (!r.brandingIds.includes(Number(k))) delete r.brandingPrices[Number(k)]
    })
  })
})

// form -> input
// catalog price per piece at the quantity; below the smallest tier admin orders charge the lowest tier
const catalogBrandingPrice = (b: { tiers: BrandingTier[] }, qty: number) =>
  brandingPriceAt(b.tiers, qty) ?? b.tiers.find(t => t.min_qty === brandingMinQty(b.tiers))?.price ?? 0
const firstPaymentInput = (): PaymentPlanInput | null => {
  if (!staged.value || form.first_payment === 'customer') return null
  if (form.first_payment === 'full') return {plan: 'full'}
  return form.dp_mode === 'percent'
    ? {plan: 'dp', dp_percent_bps: Math.round(Number(form.dp_percent) * 100)}
    : {plan: 'dp', dp_amount: Math.round(Number(form.dp_amount))}
}
const dpInvalid = computed(() => {
  if (!staged.value || form.first_payment !== 'dp') return ''
  if (form.dp_mode === 'percent') {
    const p = Number(form.dp_percent)
    return !Number.isFinite(p) || p <= 0 || p >= 100 ? 'Persentase DP harus di atas 0 dan di bawah 100.' : ''
  }
  const a = Number(form.dp_amount)
  if (!Number.isFinite(a) || a < 1) return 'Nominal DP harus lebih dari 0.'
  const total = preview.value?.total
  return total && a >= total ? 'Nominal DP harus di bawah total.' : ''
})
const hasShippingFee = computed(() => form.shipping_fee !== '' && form.shipping_fee != null)
const shippingFeeInvalid = computed(() => hasShippingFee.value && !(Number(form.shipping_fee) >= 0))
const hasPrice = (r: Row) => r.unitPrice !== '' && r.unitPrice != null
const priceInvalid = (r: Row) => hasPrice(r) && !(Number(r.unitPrice) > 0)
const hasBrandingPrice = (r: Row, id: number) => r.brandingPrices[id] !== '' && r.brandingPrices[id] != null
const brandingPriceInvalid = (r: Row, id: number) => hasBrandingPrice(r, id) && !(Number(r.brandingPrices[id]) > 0)
const anyBrandingPriceInvalid = (r: Row) => r.brandingIds.some(id => brandingPriceInvalid(r, id))
const brandingPricesInput = (r: Row) => r.brandingIds
  .filter(id => hasBrandingPrice(r, id) && !brandingPriceInvalid(r, id))
  .map(id => ({branding_method_id: id, unit_price: Math.round(Number(r.brandingPrices[id]))}))
const itemsInput = () => rows.value
  .filter(r => r.variantId > 0 && r.quantity > 0)
  .map(r => ({
    product_additional_id: r.variantId,
    quantity: Math.floor(r.quantity),
    ...(r.brandingIds.length ? {branding_ids: r.brandingIds} : {}),
    ...(brandingPricesInput(r).length ? {branding_prices: brandingPricesInput(r)} : {}),
    ...(r.note.trim() ? {note: r.note.trim()} : {}),
    ...(hasPrice(r) && !priceInvalid(r) ? {unit_price: Math.round(Number(r.unitPrice))} : {}),
  }))

const orderInput = (): AdminOrderInput | null => {
  const items = itemsInput()
  if (!customer.value || !items.length) return null
  const delivery = form.delivery_method === 'delivery'
  return {
    user_id: customer.value.id,
    items,
    delivery_method: form.delivery_method,
    customer_name: form.customer_name.trim(),
    customer_phone: form.customer_phone.trim(),
    customer_company: form.customer_company.trim() || undefined,
    shipping_name: delivery ? form.shipping_name.trim() : undefined,
    shipping_phone: delivery ? form.shipping_phone.trim() : undefined,
    shipping_address: delivery ? form.shipping_address.trim() : undefined,
    shipping_city: delivery ? form.shipping_city.trim() : undefined,
    shipping_postal_code: delivery ? form.shipping_postal_code.trim() || undefined : undefined,
    notes: form.notes.trim() || undefined,
    voucher_code: staged.value ? undefined : form.voucher_code.trim() || undefined,
    due_date: form.due_date || undefined,
    payment_flow: form.payment_flow,
    first_payment: firstPaymentInput(),
    shipping_fee: delivery && hasShippingFee.value && !shippingFeeInvalid.value ? Math.round(Number(form.shipping_fee)) : undefined,
  }
}

// same required rules as the customer checkout
const missingField = (): string | null => {
  if (!customer.value) return 'Customer'
  if (!itemsInput().length) return 'Item'
  if (rows.value.some(priceInvalid)) return 'Harga per pcs (harus lebih dari 0)'
  if (rows.value.some(anyBrandingPriceInvalid)) return 'Harga branding per pcs (harus lebih dari 0)'
  if (staged.value && form.delivery_method === 'delivery' && !hasShippingFee.value) return 'Ongkir (isi 0 bila gratis)'
  if (form.delivery_method === 'delivery' && shippingFeeInvalid.value) return 'Ongkir (tidak boleh negatif)'
  const required: [string, string][] = [[form.customer_name, 'Nama'], [form.customer_phone, 'Telepon']]
  if (form.delivery_method === 'delivery') {
    required.push([form.shipping_name, 'Nama penerima'], [form.shipping_phone, 'Telepon penerima'], [form.shipping_address, 'Alamat'], [form.shipping_city, 'Kota'])
  }
  return required.find(([value]) => !value.trim())?.[1] ?? null
}

// preview
const preview = ref<CheckoutPreview | null>(null)
const previewLoading = ref(false)
const previewError = ref('')
const submitHint = computed(() => {
  if (previewLoading.value) return 'Menunggu ringkasan selesai dihitung…'
  const p = preview.value
  if (!p) return ''
  if (p.lines.some(l => l.blocked)) return 'Ada item yang tidak dihitung. Perbaiki item bermasalah dulu.'
  if (dpInvalid.value) return dpInvalid.value
  if (!p.can_pay) return 'Order belum bisa dibuat. Periksa item dan harga.'
  return ''
})
const submitBlocked = computed(() => !!submitHint.value)
let previewSeq = 0
let previewTimer: ReturnType<typeof setTimeout> | undefined

const loadPreview = async () => {
  const input = orderInput()
  const seq = ++previewSeq
  if (!input) { preview.value = null; previewError.value = ''; previewLoading.value = false; return }
  previewLoading.value = true
  try {
    const res = await previewAdminOrder({...input, customer_name: input.customer_name || customer.value!.name, customer_phone: input.customer_phone || customer.value!.phone || '-'})
    if (seq !== previewSeq) return
    preview.value = res
    previewError.value = ''
  } catch (e: any) {
    if (seq !== previewSeq) return
    preview.value = null
    previewError.value = invoiceErrorMessage(e, 'Ringkasan gagal dihitung')
  } finally {
    if (seq === previewSeq) previewLoading.value = false
  }
}

watch(
  () => [customer.value?.id, form.delivery_method, form.voucher_code, form.shipping_fee, form.due_date, form.payment_flow, JSON.stringify(firstPaymentInput()), JSON.stringify(itemsInput())],
  () => {
    clearTimeout(previewTimer)
    previewTimer = setTimeout(loadPreview, 500)
  },
)

// preview lines come back in the order of the items sent, which skip incomplete rows
const completeRows = () => rows.value.filter(r => r.variantId > 0 && r.quantity > 0)
const catalogPrice = (row: Row): number | null => {
  const idx = completeRows().indexOf(row)
  const line = idx >= 0 ? preview.value?.lines[idx] : undefined
  return line && line.product_additional_id === row.variantId ? line.original_unit_price : null
}

// submit
const saving = ref(false)
const submit = async () => {
  const missing = missingField()
  if (missing) { toast.error(`${missing} wajib diisi`); return }
  const input = orderInput()
  if (!input) return
  saving.value = true
  try {
    const order = await adminCreateOrder(input, idempotencyKey)
    toast.success('Order berhasil dibuat')
    await router.push(`/console/secret/orders/${order.id}/detail`)
  } catch (e: any) {
    toast.error(invoiceErrorMessage(e, 'Order gagal dibuat'))
  } finally {
    saving.value = false
  }
}
</script>
