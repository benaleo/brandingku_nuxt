<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch} from 'vue'
import {toast} from 'vue-sonner'
import {Loader2, X} from 'lucide-vue-next'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'
import {useVoucherService} from '~/services/voucher.service'
import {invoiceErrorMessage} from '~/services/invoice.service'
import {useOptionProductCategories} from '~/composables/useOptionProductCategories'
import type {Voucher, VoucherInput, VoucherScope, VoucherTargetRef, VoucherType} from '~/types/voucher.type'

const props = defineProps<{ voucher?: Voucher | null }>()
const emit = defineEmits<{ saved: [voucher: Voucher]; cancel: [] }>()

const CODE_PATTERN = /^[A-Z0-9][A-Z0-9_-]{2,31}$/
const {createVoucher, updateVoucher} = useVoucherService()
const {gqlFetch} = useGql()
const {options: categoryOptions, loading: categoriesLoading, fetch: fetchCategories} = useOptionProductCategories()
const isEdit = computed(() => !!props.voucher)

const v = props.voucher
const form = reactive({
  code: v?.code || '',
  name: v?.name || '',
  description: v?.description || '',
  type: (v?.type || 'percentage') as VoucherType,
  // percentage vouchers are edited in percent, stored in basis points
  value: v ? (v.type === 'percentage' ? v.value / 100 : v.value) : 10 as number | string,
  max_discount: v?.max_discount || 0 as number | string,
  min_subtotal: v?.min_subtotal || 0 as number | string,
  starts_at: toDateTimeLocal(v?.starts_at),
  ends_at: toDateTimeLocal(v?.ends_at),
  usage_limit: v?.usage_limit || 0 as number | string,
  per_user_limit: v?.per_user_limit ?? 1 as number | string,
  scope: (v?.scope || 'all') as VoucherScope,
  is_active: v?.is_active ?? true,
})
const categoryIds = ref<number[]>(v?.categories.map(c => c.id) || [])
const products = ref<VoucherTargetRef[]>(v?.products ? [...v.products] : [])

onMounted(fetchCategories)

// product picker: search by name, click to add
const productQuery = ref('')
const productResults = ref<VoucherTargetRef[]>([])
const searching = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(productQuery, (q) => {
  clearTimeout(searchTimer)
  if (q.trim().length < 2) {
    productResults.value = []
    return
  }
  searchTimer = setTimeout(async () => {
    searching.value = true
    try {
      const res = await gqlFetch<{ getProducts: { items: VoucherTargetRef[] } }>(
        'query voucherProductSearch($kw: String) { getProducts(keyword: $kw, pagination: { page: 1, limit: 20 }) { items { id name } } }',
        {kw: q.trim()},
        {auth: true},
      )
      productResults.value = res.getProducts.items.filter(p => !products.value.some(s => s.id === p.id))
    } catch {
      productResults.value = []
    } finally {
      searching.value = false
    }
  }, 300)
})
const addProduct = (p: VoucherTargetRef) => {
  if (!products.value.some(s => s.id === p.id)) products.value.push(p)
  productResults.value = productResults.value.filter(r => r.id !== p.id)
}

const toggleCategory = (id: number) => {
  categoryIds.value = categoryIds.value.includes(id) ? categoryIds.value.filter(c => c !== id) : [...categoryIds.value, id]
}

const num = (x: number | string) => (x === '' || x === null || x === undefined ? 0 : Number(x))
const saving = ref(false)

function validate(): string | null {
  const code = form.code.trim().toUpperCase()
  if (!CODE_PATTERN.test(code)) return 'Kode 3-32 karakter: huruf besar, angka, - atau _'
  if (!form.name.trim()) return 'Nama voucher wajib diisi'
  if (form.type === 'percentage' && (num(form.value) <= 0 || num(form.value) > 100)) return 'Persentase harus 0,01 sampai 100'
  if (form.type === 'fixed' && num(form.value) < 1) return 'Nominal potongan minimal Rp 1'
  if (num(form.max_discount) < 0 || num(form.min_subtotal) < 0) return 'Nilai tidak boleh negatif'
  if (num(form.usage_limit) < 0 || num(form.per_user_limit) < 0) return 'Kuota tidak boleh negatif'
  if (form.starts_at && form.ends_at && form.ends_at <= form.starts_at) return 'Waktu berakhir harus setelah waktu mulai'
  if (form.scope === 'categories' && !categoryIds.value.length) return 'Pilih minimal 1 kategori'
  if (form.scope === 'products' && !products.value.length) return 'Pilih minimal 1 produk'
  return null
}

async function submit() {
  const problem = validate()
  if (problem) {
    toast.error(problem)
    return
  }
  const input: VoucherInput = {
    code: form.code.trim().toUpperCase(),
    name: form.name.trim(),
    description: form.description.trim(),
    type: form.type,
    value: form.type === 'percentage' ? Math.round(num(form.value) * 100) : Math.floor(num(form.value)),
    max_discount: form.type === 'percentage' ? Math.floor(num(form.max_discount)) : 0,
    min_subtotal: Math.floor(num(form.min_subtotal)),
    starts_at: fromDateTimeLocal(form.starts_at),
    ends_at: fromDateTimeLocal(form.ends_at),
    usage_limit: Math.floor(num(form.usage_limit)),
    per_user_limit: Math.floor(num(form.per_user_limit)),
    scope: form.scope,
    category_ids: form.scope === 'categories' ? categoryIds.value : [],
    product_ids: form.scope === 'products' ? products.value.map(p => p.id) : [],
    is_active: form.is_active,
  }
  saving.value = true
  try {
    const saved = isEdit.value ? await updateVoucher(props.voucher!.id, input) : await createVoucher(input)
    toast.success(isEdit.value ? `Voucher ${saved.code} disimpan` : `Voucher ${saved.code} dibuat`)
    emit('saved', saved)
  } catch (e: any) {
    toast.error(invoiceErrorMessage(e, 'Gagal menyimpan voucher'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="editor-form" @submit.prevent="submit">
    <FormsFormSection title="Voucher" description="Kode yang dimasukkan customer saat checkout. Voucher hanya berlaku untuk pembelian langsung, tidak untuk quotation.">
      <div class="form-grid">
        <div class="space-y-2">
          <Label for="v-code">Kode *</Label>
          <Input id="v-code" v-model="form.code" class="font-mono uppercase" maxlength="32" placeholder="HEMAT10" autocomplete="off"/>
          <p class="text-xs text-muted-foreground">Huruf besar, angka, - atau _. Tidak bisa dipakai ulang oleh voucher lain.</p>
        </div>
        <div class="space-y-2">
          <Label for="v-name">Nama *</Label>
          <Input id="v-name" v-model="form.name" maxlength="120" placeholder="Diskon akhir tahun"/>
        </div>
        <div class="space-y-2 md:col-span-2">
          <Label for="v-desc">Deskripsi</Label>
          <Textarea id="v-desc" v-model="form.description" rows="2" maxlength="500"/>
        </div>
      </div>
    </FormsFormSection>

    <FormsFormSection title="Potongan">
      <div class="form-grid">
        <div class="space-y-2">
          <Label>Tipe</Label>
          <div class="flex h-9 items-center gap-4 text-sm">
            <label class="flex items-center gap-2"><input v-model="form.type" type="radio" value="percentage"/> Persen</label>
            <label class="flex items-center gap-2"><input v-model="form.type" type="radio" value="fixed"/> Nominal</label>
          </div>
        </div>
        <div class="space-y-2">
          <Label for="v-value">{{ form.type === 'percentage' ? 'Persen (%) *' : 'Nominal (Rp) *' }}</Label>
          <Input id="v-value" v-model="form.value" type="number" min="0" :max="form.type === 'percentage' ? 100 : undefined" :step="form.type === 'percentage' ? '0.01' : '1'"/>
        </div>
        <div v-if="form.type === 'percentage'" class="space-y-2">
          <Label for="v-max">Maksimal potongan (Rp)</Label>
          <Input id="v-max" v-model="form.max_discount" type="number" min="0" step="1"/>
          <p class="text-xs text-muted-foreground">0 = tanpa batas.</p>
        </div>
        <div class="space-y-2">
          <Label for="v-min">Minimal belanja (Rp)</Label>
          <Input id="v-min" v-model="form.min_subtotal" type="number" min="0" step="1"/>
          <p class="text-xs text-muted-foreground">Dihitung dari subtotal produk yang termasuk voucher.</p>
        </div>
      </div>
    </FormsFormSection>

    <FormsFormSection title="Periode & kuota">
      <div class="form-grid">
        <div class="space-y-2">
          <Label for="v-start">Mulai</Label>
          <Input id="v-start" v-model="form.starts_at" type="datetime-local"/>
          <p class="text-xs text-muted-foreground">Kosong = langsung berlaku.</p>
        </div>
        <div class="space-y-2">
          <Label for="v-end">Berakhir</Label>
          <Input id="v-end" v-model="form.ends_at" type="datetime-local"/>
          <p class="text-xs text-muted-foreground">Kosong = tanpa batas waktu.</p>
        </div>
        <div class="space-y-2">
          <Label for="v-usage">Kuota total</Label>
          <Input id="v-usage" v-model="form.usage_limit" type="number" min="0" step="1"/>
          <p class="text-xs text-muted-foreground">0 = tanpa batas<span v-if="voucher">. Sudah terpakai {{ voucher.used_count }}.</span></p>
        </div>
        <div class="space-y-2">
          <Label for="v-per-user">Kuota per customer</Label>
          <Input id="v-per-user" v-model="form.per_user_limit" type="number" min="0" step="1"/>
          <p class="text-xs text-muted-foreground">0 = tanpa batas.</p>
        </div>
      </div>
    </FormsFormSection>

    <FormsFormSection title="Berlaku untuk">
      <div class="space-y-4">
        <div class="flex flex-wrap gap-4 text-sm">
          <label class="flex items-center gap-2"><input v-model="form.scope" type="radio" value="all"/> Semua produk</label>
          <label class="flex items-center gap-2"><input v-model="form.scope" type="radio" value="categories"/> Kategori tertentu</label>
          <label class="flex items-center gap-2"><input v-model="form.scope" type="radio" value="products"/> Produk tertentu</label>
        </div>

        <div v-if="form.scope === 'categories'" class="space-y-2">
          <p class="text-xs text-muted-foreground">Memilih kategori induk juga mencakup sub-kategorinya.</p>
          <div v-if="categoriesLoading" class="text-sm text-muted-foreground">Memuat kategori…</div>
          <div v-else class="grid max-h-64 gap-1 overflow-y-auto rounded-md border p-2 sm:grid-cols-2">
            <label v-for="c in categoryOptions" :key="c.id" class="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted">
              <input type="checkbox" :checked="categoryIds.includes(Number(c.id))" @change="toggleCategory(Number(c.id))"/>
              <span>{{ c.parentName ? `${c.parentName} / ${c.label}` : c.label }}</span>
            </label>
          </div>
        </div>

        <div v-if="form.scope === 'products'" class="space-y-2">
          <div class="flex flex-wrap gap-2">
            <span v-for="p in products" :key="p.id" class="inline-flex items-center gap-1 rounded-full border bg-muted px-3 py-1 text-sm">
              {{ p.name }}
              <button type="button" class="text-muted-foreground hover:text-red-600" :aria-label="`Hapus ${p.name}`" @click="products = products.filter(x => x.id !== p.id)">
                <X class="size-3.5"/>
              </button>
            </span>
          </div>
          <Input v-model="productQuery" placeholder="Cari produk (min. 2 huruf)…" aria-label="Cari produk"/>
          <p v-if="searching" class="text-xs text-muted-foreground">Mencari…</p>
          <ul v-if="productResults.length" class="max-h-56 overflow-y-auto rounded-md border">
            <li v-for="p in productResults" :key="p.id">
              <button type="button" class="w-full px-3 py-2 text-left text-sm hover:bg-muted" @click="addProduct(p)">{{ p.name }}</button>
            </li>
          </ul>
        </div>

        <label class="flex items-center gap-2 text-sm">
          <input v-model="form.is_active" type="checkbox"/>
          Aktif
        </label>
      </div>
    </FormsFormSection>

    <div class="form-actions">
      <Button type="button" variant="outline" class="w-full sm:w-auto sm:min-w-28" :disabled="saving" @click="emit('cancel')">Batal</Button>
      <Button type="submit" class="w-full sm:w-auto sm:min-w-32" :disabled="saving">
        <Loader2 v-if="saving" class="size-4 animate-spin"/>
        {{ saving ? 'Menyimpan…' : 'Simpan' }}
      </Button>
    </div>
  </form>
</template>
