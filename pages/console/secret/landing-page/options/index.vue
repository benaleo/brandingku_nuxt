<template>
  <div>
    <AppBreadcrumb/>
    <AppTableHeader :pageTitle="pageTitle"/>

    <div v-if="loading" class="py-4 text-center">Loading...</div>
    <div v-else-if="error" class="py-4 text-center text-red-500">{{ error }}</div>
    <form v-else class="editor-form" @submit.prevent="save">
      <FormsFormSection
        v-for="section in SECTIONS"
        :key="section.title"
        :title="section.title"
        :description="section.description"
      >
        <div class="form-grid">
          <div v-for="field in section.fields" :key="field.key" class="space-y-2" :class="field.wide ? 'md:col-span-2' : ''">
            <Label :for="field.key">{{ field.label }}</Label>
            <Textarea
              v-if="field.kind === 'textarea'"
              :id="field.key"
              v-model="values[field.key]"
              :rows="field.rows || 2"
              :placeholder="field.placeholder"
              :disabled="!canEdit || saving"
            />
            <Select v-else-if="field.kind === 'select'" v-model="values[field.key]" :disabled="!canEdit || saving">
              <SelectTrigger :id="field.key" class="w-full">
                <SelectValue :placeholder="field.placeholder"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
              </SelectContent>
            </Select>
            <Input
              v-else-if="field.kind === 'percent'"
              :id="field.key"
              v-model="taxRatePercent"
              type="number"
              min="0"
              max="100"
              step="0.01"
              :placeholder="field.placeholder"
              :disabled="!canEdit || saving"
            />
            <Input
              v-else
              :id="field.key"
              v-model="values[field.key]"
              :type="field.kind === 'number' ? 'number' : field.type || 'text'"
              :placeholder="field.placeholder"
              :disabled="!canEdit || saving"
            />
            <p class="text-xs text-muted-foreground">{{ field.hint || descriptions[field.key] }}</p>
          </div>

          <!-- bank accounts are stored as one JSON setting -->
          <div v-if="section.banks" class="space-y-3 md:col-span-2">
            <div class="flex items-center justify-between gap-2">
              <Label>Rekening bank</Label>
              <Button
                v-if="canEdit"
                type="button"
                variant="outline"
                size="sm"
                :disabled="saving || banks.length >= MAX_BANKS"
                @click="addBank"
              >
                <Plus class="size-4"/> Tambah rekening
              </Button>
            </div>
            <p v-if="!banks.length" class="text-sm text-muted-foreground">Belum ada rekening. Customer tidak akan melihat tujuan transfer di invoice.</p>
            <div v-for="(bank, i) in banks" :key="i" class="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_1fr_1.4fr_auto]">
              <Input v-model="bank.bank" placeholder="Bank (mis. BCA)" :aria-label="`Bank ${i + 1}`" :disabled="!canEdit || saving"/>
              <Input v-model="bank.number" placeholder="Nomor rekening" inputmode="numeric" :aria-label="`Nomor rekening ${i + 1}`" :disabled="!canEdit || saving"/>
              <Input v-model="bank.name" placeholder="Atas nama" :aria-label="`Atas nama ${i + 1}`" :disabled="!canEdit || saving"/>
              <Button
                v-if="canEdit"
                type="button"
                variant="ghost"
                size="icon"
                :aria-label="`Hapus rekening ${i + 1}`"
                :disabled="saving"
                @click="banks.splice(i, 1)"
              >
                <Trash2 class="size-4"/>
              </Button>
            </div>
            <p class="text-xs text-muted-foreground">Tampil di halaman invoice sebagai tujuan transfer. Maksimal {{ MAX_BANKS }} rekening.</p>
          </div>
        </div>
      </FormsFormSection>
      <p v-if="lastUpdated" class="text-xs text-muted-foreground">Terakhir diubah {{ lastUpdated }}</p>

      <div v-if="canEdit" class="form-actions">
        <Button type="button" variant="outline" class="w-full sm:w-auto sm:min-w-28" :disabled="saving || !dirty" @click="reset">
          Batal
        </Button>
        <Button type="submit" class="w-full sm:w-auto sm:min-w-32" :disabled="saving || !dirty">
          <Loader2 v-if="saving" class="size-4 animate-spin"/>
          {{ saving ? 'Menyimpan…' : 'Simpan' }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch} from 'vue'
import {toast} from 'vue-sonner'
import {Loader2, Plus, Trash2} from 'lucide-vue-next'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import AppBreadcrumb from '~/components/elements/AppBreadcrumb.vue'
import AppTableHeader from '~/components/elements/AppTableHeader.vue'
import {useAppSettingsService, type AppSetting} from '~/services/app-settings.service'

const pageTitle = 'Options'

type Field = {
  key: string
  label: string
  placeholder?: string
  hint?: string
  kind?: 'text' | 'textarea' | 'number' | 'select' | 'percent'
  type?: string
  rows?: number
  wide?: boolean
  options?: { value: string; label: string }[]
}
type Section = { title: string; description: string; fields: Field[]; banks?: boolean }

const BANKS_KEY = 'INVOICE_BANK_ACCOUNTS'
const TAX_RATE_KEY = 'INVOICE_TAX_RATE_BPS'
const MAX_BANKS = 5

const SECTIONS: Section[] = [
  {
    title: 'Kontak & alamat',
    description: 'Ditampilkan di footer, halaman Kontak, dan tombol WhatsApp produk. Perubahan langsung berlaku di website.',
    fields: [
      {key: 'CONTACT_PHONE', label: 'Telepon', placeholder: '+62 851 1724 7345', hint: 'Nomor telepon yang ditampilkan.'},
      {key: 'CONTACT_WHATSAPP', label: 'WhatsApp', placeholder: '6285117247345', hint: 'Angka saja dengan kode negara.'},
      {key: 'CONTACT_EMAIL', label: 'Email', placeholder: 'admin@brandingku.com', hint: 'Email kontak.', type: 'email'},
      {key: 'CONTACT_HOURS', label: 'Jam operasional', placeholder: 'Senin - Jumat, 08.00 - 17.00 WIB', hint: 'Jam operasional.'},
      {key: 'CONTACT_ADDRESS', label: 'Alamat', placeholder: 'Jl. …', hint: 'Alamat kantor.', kind: 'textarea', wide: true},
      {key: 'CONTACT_MAPS_URL', label: 'Link Google Maps', placeholder: 'https://maps.app.goo.gl/…', hint: 'Opsional.', type: 'url', wide: true},
    ],
  },
  {
    title: 'Invoice & pembayaran',
    description: 'Dipakai saat membuat invoice, quotation, deal, DP, dan final. Perubahan hanya berlaku untuk dokumen baru.',
    banks: true,
    fields: [
      {key: 'INVOICE_COMPANY_NAME', label: 'Nama perusahaan', placeholder: 'Brandingku', hint: 'Kop invoice.'},
      {key: 'INVOICE_NPWP', label: 'NPWP', placeholder: '01.234.567.8-901.000', hint: 'Opsional, 15 atau 16 digit.'},
      {
        key: 'INVOICE_TAX_MODE',
        label: 'Mode PPN default',
        kind: 'select',
        hint: 'Untuk order purchase. Quotation dan deal bisa memilih sendiri.',
        options: [
          {value: 'none', label: 'Tanpa PPN'},
          {value: 'exclusive', label: 'Exclude (PPN ditambahkan ke total)'},
          {value: 'inclusive', label: 'Include (harga sudah termasuk PPN)'},
        ],
      },
      {key: TAX_RATE_KEY, label: 'Tarif PPN (%)', placeholder: '11', hint: 'Mis. 11 untuk 11%.', kind: 'percent'},
      {key: 'INVOICE_PREFIX', label: 'Prefix invoice & final', placeholder: 'INV', hint: 'Nomor: INV-2026-00001.'},
      {key: 'INVOICE_DP_PREFIX', label: 'Prefix DP', placeholder: 'DP', hint: 'Berbagi urutan nomor dengan invoice.'},
      {key: 'INVOICE_QUOTATION_PREFIX', label: 'Prefix quotation', placeholder: 'QUO'},
      {key: 'INVOICE_DEAL_PREFIX', label: 'Prefix deal', placeholder: 'DEAL'},
      {key: 'INVOICE_DUE_DAYS', label: 'Jatuh tempo DP & final (hari)', placeholder: '7', kind: 'number'},
      {key: 'INVOICE_QUOTATION_VALID_DAYS', label: 'Masa berlaku quotation (hari)', placeholder: '14', kind: 'number'},
      {key: 'INVOICE_PAYMENT_WINDOW_HOURS', label: 'Batas bayar purchase (jam)', placeholder: '24', kind: 'number', hint: 'Order purchase yang belum dibayar setelah ini otomatis kedaluwarsa.'},
      {key: 'INVOICE_TERMS', label: 'Syarat & ketentuan', placeholder: 'Pembayaran dianggap sah setelah dana diterima…', kind: 'textarea', rows: 4, wide: true},
    ],
  },
  {
    title: 'Garansi',
    description: 'Berlaku untuk semua pesanan. Setelah pesanan selesai, customer bisa mengajukan klaim (refund atau tukar barang) selama masa garansi.',
    fields: [
      {key: 'ORDER_GUARANTEE_DAYS', label: 'Masa garansi (hari)', placeholder: '7', kind: 'number', hint: 'Dihitung sejak pesanan ditandai selesai. 0 = tanpa garansi.'},
    ],
  },
]

const KEYS = [...SECTIONS.flatMap(s => s.fields.map(f => f.key)), BANKS_KEY]

const route = useRoute()
const {canAction} = useConsoleAccess()
const canEdit = computed(() => canAction(route.path, 'update'))
const {getAppSettings, updateAppSettings} = useAppSettingsService()

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const values = reactive<Record<string, string>>({})
const original = ref<Record<string, string>>({})
const descriptions = ref<Record<string, string>>({})
const lastUpdated = ref('')

type Bank = { bank: string; number: string; name: string }
const banks = ref<Bank[]>([])

const parseBanks = (raw: string): Bank[] => {
  try {
    const list = JSON.parse(raw || '[]')
    return Array.isArray(list) ? list.map((b: any) => ({bank: b?.bank ?? '', number: b?.number ?? '', name: b?.name ?? ''})) : []
  } catch {
    return []
  }
}
// key order matches the backend's JSON so an untouched list is not dirty
watch(banks, list => {
  values[BANKS_KEY] = JSON.stringify(list.map(b => ({bank: b.bank, number: b.number, name: b.name})))
}, {deep: true})
const addBank = () => banks.value.push({bank: '', number: '', name: ''})

// stored as basis points, edited as a percentage
// the getter returns a number so a half-typed "11." is not rewritten to "11"
const taxRatePercent = computed<number | string>({
  get: () => {
    const raw = String(values[TAX_RATE_KEY] ?? '')
    const bps = Number(raw)
    return raw === '' || Number.isNaN(bps) ? '' : bps / 100
  },
  set: (v: string | number) => {
    const pct = Number(v)
    values[TAX_RATE_KEY] = v === '' || Number.isNaN(pct) ? '' : String(Math.round(pct * 100))
  },
})

// number inputs hand back numbers, stored values are strings
const same = (k: string) => String(values[k] ?? '') === String(original.value[k] ?? '')
const dirty = computed(() => KEYS.some(k => !same(k)))

function apply(settings: AppSetting[]) {
  const map: Record<string, string> = Object.fromEntries(settings.map(s => [s.key, s.value]))
  // Go escapes characters like & in JSON; re-serialize so the comparison matches the editor
  map[BANKS_KEY] = JSON.stringify(parseBanks(map[BANKS_KEY] ?? '[]'))
  original.value = map
  descriptions.value = Object.fromEntries(settings.map(s => [s.key, s.description]))
  reset()
  const latest = settings.filter(s => KEYS.includes(s.key)).reduce((m, s) => (s.updated_at > m ? s.updated_at : m), '')
  lastUpdated.value = latest ? new Date(latest).toLocaleString() : ''
}

function reset() {
  for (const k of KEYS) values[k] = original.value[k] ?? ''
  banks.value = parseBanks(original.value[BANKS_KEY] ?? '[]')
}

onMounted(async () => {
  try {
    apply(await getAppSettings())
  } catch (e: any) {
    error.value = e?.message || 'Gagal memuat options'
  } finally {
    loading.value = false
  }
})

async function save() {
  const changed = KEYS.filter(k => !same(k))
    .map(k => ({key: k, value: String(values[k] ?? '')}))
  if (!changed.length) return
  saving.value = true
  try {
    apply(await updateAppSettings(changed))
    // refresh the cached public settings used by the footer in this session
    await refreshNuxtData('site-settings')
    toast.success('Options berhasil disimpan')
  } catch (e: any) {
    toast.error(String(e?.message || 'Gagal menyimpan options').replace(/^\[GQL\] Request failed:\s*/, ''))
  } finally {
    saving.value = false
  }
}

useHead({title: pageTitle})

definePageMeta({
  layout: 'console-secret'
})
</script>
