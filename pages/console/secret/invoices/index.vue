<template>
  <div>
    <AppBreadcrumb/>
    <div class="mb-2 mt-4 flex flex-wrap items-center justify-between gap-2">
      <h1 class="text-2xl font-bold">{{ pageTitle }}</h1>
      <div v-if="canCreate" class="flex gap-2">
        <Button variant="outline" @click="router.push('/console/secret/invoices/add?type=quotation')">Quotation +</Button>
        <Button variant="primary" @click="router.push('/console/secret/invoices/add')">Invoice +</Button>
      </div>
    </div>

    <!-- outstanding amounts of billable documents -->
    <div class="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <button
        v-for="card in summaryCards"
        :key="card.status"
        type="button"
        class="rounded-xl border bg-card p-4 text-left transition hover:border-green-600"
        :class="{ 'border-green-600 ring-1 ring-green-600': status === card.status }"
        @click="status = status === card.status ? '' : card.status"
      >
        <p class="text-xs text-muted-foreground">{{ card.label }}</p>
        <p class="mt-1 text-lg font-semibold">{{ formatRupiah(card.amount) }}</p>
        <p class="text-xs text-muted-foreground">{{ card.count }} dokumen</p>
      </button>
    </div>

    <AppFilterTable v-model="keyword" placeholder="Cari nomor, customer, email…">
      <select v-model="type" aria-label="Filter tipe" class="h-9 rounded-md border bg-background px-3 text-sm">
        <option value="">Semua tipe</option>
        <option v-for="(label, value) in INVOICE_TYPE_LABELS" :key="value" :value="value">{{ label }}</option>
      </select>
      <select v-model="status" aria-label="Filter status" class="h-9 rounded-md border bg-background px-3 text-sm">
        <option value="">Semua status</option>
        <option v-for="(s, value) in INVOICE_STATUS" :key="value" :value="value">{{ s[0] }}</option>
      </select>
      <label class="flex items-center gap-2 text-sm text-muted-foreground">
        Dari
        <input v-model="dateFrom" type="date" class="h-9 rounded-md border bg-background px-2 text-sm text-foreground"/>
      </label>
      <label class="flex items-center gap-2 text-sm text-muted-foreground">
        s/d
        <input v-model="dateTo" type="date" class="h-9 rounded-md border bg-background px-2 text-sm text-foreground"/>
      </label>
    </AppFilterTable>

    <div class="mt-6">
      <div v-if="error" class="py-4 text-center text-red-500">{{ error }}</div>
      <DatatablesDataTable
        v-else
        :columns="invoiceColumns"
        :data="rows"
        :loading="loading"
        :pagination="{ page, limit, total }"
        @page-change="(p: number) => { page = p; load() }"
        @limit-change="(l: number) => { limit = l; page = 0; load() }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import {Button} from '@/components/ui/button'
import AppBreadcrumb from '~/components/elements/AppBreadcrumb.vue'
import AppFilterTable from '~/components/elements/AppFilterTable.vue'
import {invoiceColumns} from '~/components/datatables/invoiceColumns'
import {invoiceErrorMessage, useInvoiceService} from '~/services/invoice.service'
import type {Invoice, InvoiceStatusSummary} from '~/types/invoice.type'

const pageTitle = 'Invoice'
const router = useRouter()
const route = useRoute()
const {canAction} = useConsoleAccess()
const canCreate = computed(() => canAction(route.path, 'create'))
const {getInvoices, getInvoiceSummary} = useInvoiceService()

const rows = ref<Invoice[]>([])
const summary = ref<InvoiceStatusSummary[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
// DataTable pages are 0-based; the API is 1-based
const page = ref(0)
const limit = ref(10)
const total = ref(0)

const keyword = ref('')
const type = ref('')
const status = ref(String(route.query.status || ''))
const dateFrom = ref('')
const dateTo = ref('')

const summaryCards = computed(() => {
  const by = (s: string) => summary.value.find(x => x.status === s)
  return [
    {status: 'sent', label: 'Belum dibayar'},
    {status: 'overdue', label: 'Lewat jatuh tempo'},
    {status: 'paid', label: 'Lunas'},
    {status: 'draft', label: 'Draft'},
  ].map(c => ({...c, count: by(c.status)?.count ?? 0, amount: by(c.status)?.amount_due ?? 0}))
})

let requestId = 0
async function load() {
  const current = ++requestId
  loading.value = true
  error.value = null
  try {
    const kw = keyword.value.trim()
    const res = await getInvoices(page.value + 1, limit.value, {
      type: type.value || undefined,
      status: status.value || undefined,
      keyword: kw.length >= 2 ? kw : undefined,
      date_from: dateFrom.value || undefined,
      date_to: dateTo.value || undefined,
    })
    if (current !== requestId) return
    rows.value = res.items
    total.value = res.page_info.total_items
  } catch (e: any) {
    if (current === requestId) error.value = invoiceErrorMessage(e, 'Gagal memuat invoice')
  } finally {
    if (current === requestId) loading.value = false
  }
}

async function loadSummary() {
  try {
    summary.value = await getInvoiceSummary()
  } catch (e) {
    console.error('Failed to load invoice summary', e)
  }
}

let keywordTimer: ReturnType<typeof setTimeout> | undefined
watch(keyword, () => {
  clearTimeout(keywordTimer)
  keywordTimer = setTimeout(() => { page.value = 0; load() }, 300)
})
watch([type, status, dateFrom, dateTo], () => { page.value = 0; load() })

onMounted(() => {
  load()
  loadSummary()
})

useHead({title: pageTitle})

definePageMeta({
  layout: 'console-secret'
})
</script>
