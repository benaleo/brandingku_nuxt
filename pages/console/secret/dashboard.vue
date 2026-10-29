<template>
  <div class="space-y-6 pb-4">
    <AppBreadcrumb/>

    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p class="text-sm text-muted-foreground">Penjualan dan operasional {{ rangeLabel.toLowerCase() }} terakhir, dibanding periode sebelumnya.</p>
      </div>
      <div class="flex items-center gap-2">
        <div role="radiogroup" aria-label="Periode" class="inline-flex rounded-lg border bg-background p-1">
          <button
              v-for="r in RANGES"
              :key="r.days"
              type="button"
              role="radio"
              :aria-checked="days === r.days"
              class="rounded-md px-3 py-1.5 text-sm"
              :class="days === r.days ? 'bg-green-600 font-medium text-white' : 'text-muted-foreground hover:bg-muted'"
              @click="days = r.days"
          >{{ r.short }}</button>
        </div>
        <Button variant="outline" size="icon" class="size-9" aria-label="Muat ulang" :disabled="loading" @click="load">
          <RefreshCw class="size-4" :class="loading && 'animate-spin'"/>
        </Button>
      </div>
    </div>

    <div v-if="error && !data" class="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
      {{ error }}
      <Button variant="outline" size="sm" class="ml-2" @click="load">Coba lagi</Button>
    </div>

    <template v-else>
      <!-- what needs someone now -->
      <section aria-labelledby="attention-title" class="rounded-xl border bg-card p-4">
        <div class="mb-3 flex items-center justify-between">
          <h2 id="attention-title" class="font-semibold">Perlu tindakan</h2>
          <span class="text-xs text-muted-foreground">saat ini</span>
        </div>
        <div v-if="!data" class="grid grid-cols-2 gap-2 md:grid-cols-4">
          <Skeleton v-for="n in 4" :key="n" class="h-16 rounded-lg"/>
        </div>
        <p v-else-if="!attention.length" class="flex items-center gap-2 text-sm text-green-700">
          <CheckCircle2 class="size-4"/> Semua beres, tidak ada yang menunggu.
        </p>
        <div v-else class="grid grid-cols-2 gap-2 md:grid-cols-4">
          <NuxtLink
              v-for="a in attention"
              :key="a.key"
              :to="a.to"
              class="group flex items-center gap-3 rounded-lg border bg-background p-3 transition hover:border-green-600 hover:bg-green-50/50"
          >
            <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <component :is="a.icon" class="size-4"/>
            </span>
            <span class="min-w-0">
              <span class="block text-lg font-bold leading-tight tabular-nums">{{ a.count }}</span>
              <span class="line-clamp-2 block text-xs leading-snug text-muted-foreground group-hover:text-foreground">{{ a.label }}</span>
            </span>
          </NuxtLink>
        </div>
      </section>

      <!-- headline figures -->
      <section aria-label="Ringkasan" class="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <div v-for="k in kpis" :key="k.key" class="min-w-0 rounded-xl border bg-card p-3 sm:p-4">
          <div class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <component :is="k.icon" class="size-4"/> {{ k.label }}
          </div>
          <Skeleton v-if="!data" class="mt-3 h-7 w-24"/>
          <template v-else>
            <p class="mt-2 text-lg font-bold leading-tight tabular-nums sm:text-2xl">{{ k.value }}</p>
            <p v-if="k.delta" class="mt-1 flex items-center gap-1 text-xs" :class="k.delta.tone">
              <component :is="k.delta.icon" class="size-3.5"/>
              <span>{{ k.delta.text }}</span>
            </p>
            <p v-else-if="k.note" class="mt-1 text-xs text-muted-foreground">{{ k.note }}</p>
          </template>
        </div>
      </section>

      <!-- trend -->
      <section aria-labelledby="trend-title" class="rounded-xl border bg-card p-4">
        <div class="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="trend-title" class="font-semibold">{{ measure === 'revenue' ? 'Pendapatan' : 'Pesanan masuk' }} per {{ BUCKET_NAME[data?.bucket || 'day'] }}</h2>
            <p class="text-sm text-muted-foreground">
              {{ measure === 'revenue' ? 'Pembayaran terverifikasi' : 'Pembelian dan permintaan penawaran' }} · {{ rangeLabel.toLowerCase() }} terakhir
            </p>
          </div>
          <div role="radiogroup" aria-label="Ukuran" class="inline-flex rounded-lg border p-1 text-sm">
            <button
                v-for="m in MEASURES"
                :key="m.value"
                type="button"
                role="radio"
                :aria-checked="measure === m.value"
                class="rounded-md px-3 py-1"
                :class="measure === m.value ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'"
                @click="measure = m.value"
            >{{ m.label }}</button>
          </div>
        </div>
        <Skeleton v-if="!data" class="h-60 w-full"/>
        <ElementsDashboardTrendChart
            v-else
            :points="data.series"
            :measure="measure"
            :bucket="data.bucket"
            :label="`${measure === 'revenue' ? 'Pendapatan' : 'Pesanan masuk'} per ${BUCKET_NAME[data.bucket]}`"
        />
      </section>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- order status -->
        <section aria-labelledby="status-title" class="rounded-xl border bg-card p-4">
          <div class="mb-3 flex items-baseline justify-between gap-2">
            <h2 id="status-title" class="font-semibold">Status pesanan</h2>
            <span v-if="data" class="text-xs text-muted-foreground">{{ data.open_orders }} pesanan masih berjalan</span>
          </div>
          <div v-if="!data" class="space-y-3"><Skeleton v-for="n in 5" :key="n" class="h-6"/></div>
          <p v-else-if="!data.orders_by_status.length" class="py-6 text-center text-sm text-muted-foreground">Belum ada pesanan pada periode ini.</p>
          <ul v-else class="space-y-2.5">
            <li v-for="s in data.orders_by_status" :key="s.key">
              <NuxtLink :to="`/console/secret/orders?status=${s.key}`" class="group block">
                <div class="flex items-center justify-between gap-2 text-sm">
                  <span class="truncate group-hover:underline">{{ statusLabel(s.key) }}</span>
                  <span class="font-medium tabular-nums">{{ s.count }}</span>
                </div>
                <div class="mt-1 h-2 rounded-full bg-slate-100">
                  <div class="h-2 rounded-full bg-green-600" :style="{ width: `${(s.count / statusMax) * 100}%` }"/>
                </div>
              </NuxtLink>
            </li>
          </ul>
        </section>

        <!-- best sellers -->
        <section aria-labelledby="top-title" class="rounded-xl border bg-card p-4">
          <div class="mb-3 flex items-baseline justify-between gap-2">
            <h2 id="top-title" class="font-semibold">Produk terlaris</h2>
            <span class="text-xs text-muted-foreground">berdasarkan nilai pesanan</span>
          </div>
          <div v-if="!data" class="space-y-3"><Skeleton v-for="n in 5" :key="n" class="h-10"/></div>
          <p v-else-if="!data.top_products.length" class="py-6 text-center text-sm text-muted-foreground">Belum ada produk terjual pada periode ini.</p>
          <ol v-else class="space-y-3">
            <li v-for="(p, i) in data.top_products" :key="p.product_id" class="flex items-center gap-3">
              <span class="w-4 text-sm font-semibold text-muted-foreground tabular-nums">{{ i + 1 }}</span>
              <img v-if="p.image" :src="imageUrl(p.image)" :alt="p.name" class="size-10 shrink-0 rounded-md border object-contain">
              <span v-else class="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted"><Package class="size-4 text-muted-foreground"/></span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2 text-sm">
                  <span class="truncate font-medium">{{ p.name }}</span>
                  <span class="shrink-0 tabular-nums">{{ formatRupiah(p.revenue) }}</span>
                </div>
                <div class="mt-1 flex items-center gap-2">
                  <div class="h-1.5 flex-1 rounded-full bg-slate-100">
                    <div class="h-1.5 rounded-full bg-green-600" :style="{ width: `${(p.revenue / topMax) * 100}%` }"/>
                  </div>
                  <span class="shrink-0 text-xs text-muted-foreground tabular-nums">{{ p.quantity.toLocaleString('id-ID') }} pcs</span>
                </div>
              </div>
            </li>
          </ol>
        </section>
      </div>

      <!-- latest orders -->
      <section aria-labelledby="recent-title" class="rounded-xl border bg-card">
        <div class="flex items-center justify-between gap-2 p-4 pb-2">
          <h2 id="recent-title" class="font-semibold">Pesanan terbaru</h2>
          <NuxtLink to="/console/secret/orders" class="flex items-center gap-1 text-sm font-medium text-green-700 hover:underline">
            Semua pesanan <ArrowRight class="size-4"/>
          </NuxtLink>
        </div>
        <div v-if="!data" class="space-y-2 p-4 pt-2"><Skeleton v-for="n in 4" :key="n" class="h-10"/></div>
        <p v-else-if="!data.recent_orders.length" class="p-6 text-center text-sm text-muted-foreground">Belum ada pesanan.</p>
        <ul v-else class="divide-y">
          <li v-for="o in data.recent_orders" :key="o.id">
            <NuxtLink :to="`/console/secret/orders/${o.id}/detail`" class="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-muted/50">
              <div class="min-w-0 flex-1">
                <p class="font-medium">{{ o.code }} <span class="font-normal text-muted-foreground">· {{ o.customer_name }}</span></p>
                <p class="text-xs text-muted-foreground">{{ o.type === 'quotation' ? 'Permintaan penawaran' : 'Pembelian langsung' }} · {{ formatDateTime(o.created_at) }}</p>
              </div>
              <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="statusStyle(o.status)">{{ statusLabel(o.status) }}</span>
              <span class="w-28 text-right text-sm font-medium tabular-nums">{{ o.total ? formatRupiah(o.total) : '—' }}</span>
            </NuxtLink>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, CheckCircle2, ClipboardList, FileQuestion, Inbox, MessageCircle, Minus,
  Package, Percent, ReceiptText, RefreshCw, ShieldAlert, ShoppingBag, Star, Truck, UserPlus, Wallet,
} from 'lucide-vue-next'
import AppBreadcrumb from '~/components/elements/AppBreadcrumb.vue'
import {Button} from '~/components/ui/button'
import {Skeleton} from '~/components/ui/skeleton'
import {useDashboardService} from '~/services/dashboard.service'
import type {Dashboard, DashboardMetric} from '~/types/dashboard.type'
import type {OrderStatus} from '~/types/order.type'

useHead({title: 'Dashboard'})
definePageMeta({layout: 'console-secret'})

const RANGES = [
  {days: 7, short: '7H', label: '7 hari'},
  {days: 30, short: '30H', label: '30 hari'},
  {days: 90, short: '90H', label: '90 hari'},
  {days: 365, short: '1T', label: '1 tahun'},
]
const MEASURES = [{value: 'revenue', label: 'Pendapatan'}, {value: 'orders', label: 'Pesanan'}] as const
const BUCKET_NAME = {day: 'hari', week: 'minggu', month: 'bulan'} as const

const {getDashboard} = useDashboardService()
const config = useRuntimeConfig()
const days = ref(30)
const measure = ref<'revenue' | 'orders'>('revenue')
const data = ref<Dashboard | null>(null)
const loading = ref(false)
const error = ref('')
const rangeLabel = computed(() => RANGES.find(r => r.days === days.value)?.label || '')

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    data.value = await getDashboard(days.value)
  } catch (e: any) {
    error.value = e?.message || 'Dashboard gagal dimuat'
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(days, () => {
  data.value = null
  load()
})

const imageUrl = (path: string) => (path.startsWith('http') ? path : `${config.public.STORAGE_URL}${path}`)
const statusLabel = (s: string) => ORDER_STATUS_LABELS[s as OrderStatus] || s
const statusStyle = (s: string) => ORDER_STATUS_STYLE[s as OrderStatus] || 'bg-muted text-muted-foreground'

// change against the previous period; for every figure here, up is good
const delta = (m: DashboardMetric) => {
  if (!m.previous && !m.current) return {icon: Minus, tone: 'text-muted-foreground', text: 'Sama seperti periode sebelumnya'}
  if (!m.previous) return {icon: ArrowUpRight, tone: 'text-green-700', text: 'Baru di periode ini'}
  const pct = ((m.current - m.previous) / m.previous) * 100
  const text = `${pct > 0 ? '+' : ''}${pct.toLocaleString('id-ID', {maximumFractionDigits: 1})}% vs sebelumnya`
  if (Math.abs(pct) < 0.05) return {icon: Minus, tone: 'text-muted-foreground', text: 'Sama seperti periode sebelumnya'}
  return pct > 0 ? {icon: ArrowUpRight, tone: 'text-green-700', text} : {icon: ArrowDownRight, tone: 'text-red-600', text}
}

const kpis = computed(() => {
  const d = data.value
  const avg = (m?: DashboardMetric, n?: DashboardMetric) => ({
    current: n?.current ? Math.round((m?.current || 0) / n.current) : 0,
    previous: n?.previous ? Math.round((m?.previous || 0) / n.previous) : 0,
  })
  const avgMetric = avg(d?.revenue, d?.paid_orders)
  const won = d?.quotations.current ? Math.round((d.quotations_won / d.quotations.current) * 100) : null
  return [
    {key: 'revenue', label: 'Pendapatan', icon: Wallet, value: formatRupiah(d?.revenue.current || 0), delta: d && delta(d.revenue)},
    {key: 'orders', label: 'Pesanan masuk', icon: ShoppingBag, value: String(d?.orders.current ?? 0), delta: d && delta(d.orders)},
    {key: 'paid', label: 'Pesanan dibayar', icon: ReceiptText, value: String(d?.paid_orders.current ?? 0), delta: d && delta(d.paid_orders)},
    {key: 'avg', label: 'Rata-rata per pesanan', icon: ClipboardList, value: formatRupiah(avgMetric.current), delta: d && delta(avgMetric)},
    {key: 'customers', label: 'Customer baru', icon: UserPlus, value: String(d?.new_customers.current ?? 0), delta: d && delta(d.new_customers)},
    {
      key: 'quotes', label: 'Penawaran diterima', icon: Percent, value: won === null ? '—' : `${won}%`, delta: null,
      note: d ? `${d.quotations_won} dari ${d.quotations.current} permintaan` : '',
    },
  ]
})

const ATTENTION = [
  {key: 'payment_proofs', label: 'Bukti bayar perlu dicek', icon: ReceiptText, to: '/console/secret/invoices'},
  {key: 'awaiting_shipping_fee', label: 'Menunggu ongkir', icon: Truck, to: '/console/secret/orders?status=awaiting_shipping_fee'},
  {key: 'quotation_requests', label: 'Permintaan penawaran baru', icon: FileQuestion, to: '/console/secret/orders?status=requested'},
  {key: 'quotation_revisions', label: 'Minta revisi penawaran', icon: FileQuestion, to: '/console/secret/orders?status=revision_requested'},
  {key: 'guarantee_claims', label: 'Klaim garansi baru', icon: ShieldAlert, to: '/console/secret/guarantees'},
  {key: 'pending_testimonials', label: 'Ulasan perlu moderasi', icon: Star, to: '/console/secret/landing-page/testimonial'},
  {key: 'open_inquiries', label: 'Inquiry belum dibalas', icon: Inbox, to: '/console/secret/inquiry'},
  {key: 'unread_chats', label: 'Live chat belum dibaca', icon: MessageCircle, to: '/console/secret/chat'},
] as const
const attention = computed(() => ATTENTION
  .map(a => ({...a, count: data.value?.attention[a.key] ?? 0}))
  .filter(a => a.count > 0))

const statusMax = computed(() => Math.max(1, ...(data.value?.orders_by_status.map(s => s.count) || [])))
const topMax = computed(() => Math.max(1, ...(data.value?.top_products.map(p => p.revenue) || [])))
</script>
