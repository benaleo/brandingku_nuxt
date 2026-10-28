<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {useOrderService} from '~/services/order.service'
import type {Order, OrderStatus} from '~/types/order.type'

definePageMeta({layout: 'default'})

const {t, locale} = useI18n()
const router = useRouter()
const token = useCookie<string | null>('token', {sameSite: 'lax'})
const {getMyOrders} = useOrderService()

useHead(() => ({title: t('app.orderHistoryPage.metaTitle')}))

const STATUSES: OrderStatus[] = [
  'awaiting_shipping_fee', 'pending_payment', 'paid', 'requested', 'quoted', 'revision_requested', 'accepted',
  'processing', 'shipped', 'completed', 'rejected', 'cancelled', 'expired',
]
const orders = ref<Order[]>([])
const total = ref(0)
const loading = ref(true)
const status = ref('')
const page = ref(1)
const limit = 10
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit)))

const formatIDR = (v: number) => new Intl.NumberFormat('id-ID', {style: 'currency', currency: 'IDR', maximumFractionDigits: 0}).format(v || 0)
const formatDate = (iso: string) => new Date(iso).toLocaleDateString(locale.value === 'en' ? 'en-US' : 'id-ID', {day: 'numeric', month: 'short', year: 'numeric'})
// before the shipping fee is known the invoice total excludes it; quotations show the quoted total
const orderTotal = (o: Order) => o.invoice?.total ?? o.subtotal - o.discount_total
const itemSummary = (o: Order) => o.items.map(i => `${i.product_name} (${i.variant_name}) × ${i.quantity}`).join(', ')

let requestId = 0
async function load() {
  const current = ++requestId
  loading.value = true
  try {
    const res = await getMyOrders(page.value, limit, status.value)
    if (current !== requestId) return
    orders.value = res.items
    total.value = res.page_info.total_items
  } catch (e) {
    if (current !== requestId) return
    console.error('Failed to load orders', e)
    orders.value = []
  } finally {
    if (current === requestId) loading.value = false
  }
}

// a filter change on a later page resets the page; the page watcher then does the single load
watch(status, () => {
  if (page.value !== 1) page.value = 1
  else load()
})
watch(page, load)

onMounted(() => {
  if (!token.value) {
    router.replace({path: '/console/auth', query: {redirect: '/profile/order-histories'}})
    return
  }
  load()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-green-50 via-white to-white">
    <div class="app-container px-4 md:px-6 pt-28 pb-16">
      <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 md:text-3xl">{{ $t('app.orderHistoryPage.title') }}</h1>
          <p class="mt-1 text-sm text-slate-600">{{ $t('app.orderHistoryPage.subtitle') }}</p>
        </div>
        <select v-model="status" :aria-label="$t('app.orderHistoryPage.columns.status')" class="h-10 rounded-md border bg-white px-3 text-sm">
          <option value="">{{ $t('app.orderHistory.allStatuses') }}</option>
          <option v-for="s in STATUSES" :key="s" :value="s">{{ $t(`app.orderStatus.${s}`) }}</option>
        </select>
      </div>

      <p v-if="loading" class="py-10 text-center text-slate-500">{{ $t('app.orderHistory.loading') }}</p>
      <div v-else-if="!orders.length" class="mx-auto max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
        <p class="text-slate-700">{{ $t('app.orderHistory.empty') }}</p>
        <Button class="mt-6 bg-green-600 hover:bg-green-700" @click="router.push('/product')">{{ $t('app.orderHistory.shopNow') }}</Button>
      </div>

      <template v-else>
        <ul class="space-y-3">
          <li v-for="o in orders" :key="o.id">
            <NuxtLink :to="`/orders/${o.code}`" class="flex flex-col gap-2 rounded-xl border bg-white p-4 shadow-sm transition hover:border-green-600 sm:flex-row sm:items-center sm:justify-between">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-semibold text-slate-900">{{ o.code }}</span>
                  <Badge :class="ORDER_STATUS_STYLE[o.status]">{{ $t(`app.orderStatus.${o.status}`) }}</Badge>
                </div>
                <p class="mt-1 truncate text-sm text-slate-600">{{ itemSummary(o) }}</p>
                <p class="text-xs text-slate-500">{{ formatDate(o.created_at) }}</p>
              </div>
              <div class="shrink-0 text-left sm:text-right">
                <p class="font-semibold">{{ formatIDR(orderTotal(o)) }}</p>
                <span class="text-sm text-green-700">{{ $t('app.orderHistory.view') }} →</span>
              </div>
            </NuxtLink>
          </li>
        </ul>
        <div v-if="totalPages > 1" class="mt-6 flex items-center justify-center gap-3 text-sm">
          <Button variant="outline" size="sm" :disabled="page <= 1" @click="page--">‹</Button>
          <span>{{ page }} / {{ totalPages }}</span>
          <Button variant="outline" size="sm" :disabled="page >= totalPages" @click="page++">›</Button>
        </div>
      </template>
    </div>
  </div>
</template>
