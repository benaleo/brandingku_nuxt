<template>
  <div>
    <AppBreadcrumb/>
    <AppTableHeader :pageTitle="pageTitle"/>

    <!-- what needs attention first -->
    <div class="mt-2 grid grid-cols-2 gap-3 md:grid-cols-5">
      <button
        v-for="card in cards"
        :key="card.status"
        type="button"
        class="rounded-xl border bg-card p-4 text-left transition hover:border-green-600"
        :class="{ 'border-green-600 ring-1 ring-green-600': status === card.status }"
        @click="status = status === card.status ? '' : card.status"
      >
        <p class="text-xs text-muted-foreground">{{ ORDER_STATUS_LABELS[card.status] }}</p>
        <p class="mt-1 text-2xl font-semibold">{{ card.count }}</p>
      </button>
    </div>

    <AppFilterTable v-model="keyword" placeholder="Cari kode, customer, email…">
      <select v-model="status" aria-label="Filter status" class="h-9 rounded-md border bg-background px-3 text-sm">
        <option value="">Semua status</option>
        <option v-for="(label, value) in ORDER_STATUS_LABELS" :key="value" :value="value">{{ label }}</option>
      </select>
    </AppFilterTable>

    <div class="mt-6">
      <div v-if="error" class="py-4 text-center text-red-500">{{ error }}</div>
      <DatatablesDataTable
        v-else
        :columns="orderColumns"
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
import AppBreadcrumb from '~/components/elements/AppBreadcrumb.vue'
import AppTableHeader from '~/components/elements/AppTableHeader.vue'
import AppFilterTable from '~/components/elements/AppFilterTable.vue'
import {orderColumns} from '~/components/datatables/orderColumns'
import {useOrderService} from '~/services/order.service'
import {invoiceErrorMessage} from '~/services/invoice.service'
import type {Order, OrderStatus} from '~/types/order.type'

const pageTitle = 'Transaksi'
const route = useRoute()
const {getOrders, getOrderStatusCounts} = useOrderService()

const rows = ref<Order[]>([])
const counts = ref<{ status: string; count: number }[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
// DataTable pages are 0-based; the API is 1-based
const page = ref(0)
const limit = ref(10)
const total = ref(0)
const keyword = ref('')
const status = ref(String(route.query.status || ''))

const ATTENTION: OrderStatus[] = ['awaiting_shipping_fee', 'pending_payment', 'paid', 'processing', 'shipped']
const cards = computed(() => ATTENTION.map(s => ({status: s, count: counts.value.find(c => c.status === s)?.count ?? 0})))

let requestId = 0
async function load() {
  const current = ++requestId
  loading.value = true
  error.value = null
  try {
    const res = await getOrders(page.value + 1, limit.value, {status: status.value, keyword: keyword.value.trim()})
    if (current !== requestId) return
    rows.value = res.items
    total.value = res.page_info.total_items
  } catch (e: any) {
    if (current === requestId) error.value = invoiceErrorMessage(e, 'Gagal memuat transaksi')
  } finally {
    if (current === requestId) loading.value = false
  }
}

async function loadCounts() {
  try {
    counts.value = await getOrderStatusCounts()
  } catch (e) {
    console.error('Failed to load order counts', e)
  }
}

let keywordTimer: ReturnType<typeof setTimeout> | undefined
watch(keyword, () => {
  clearTimeout(keywordTimer)
  keywordTimer = setTimeout(() => { page.value = 0; load() }, 300)
})
watch(status, () => { page.value = 0; load() })

onMounted(() => {
  load()
  loadCounts()
})

useHead({title: pageTitle})

definePageMeta({
  layout: 'console-secret'
})
</script>
