<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Bell, CheckCircle2, ChevronRight, Clock, Heart, LogOut, Mail, MapPin, Package, Phone, Receipt, ShoppingCart, Wallet } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useOrderService } from '~/services/order.service'
import type { MyOrderSummary, Order } from '~/types/order.type'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const token = useCookie<string | null>('token', { sameSite: 'lax' })
const uuid = Array.isArray(route.params.uuid) ? route.params.uuid[0] : route.params.uuid
const { profile, loading, error, getUserProfile } = useUserProfile()
const { getMyOrderSummary } = useOrderService()

const summary = ref<MyOrderSummary | null>(null)
const summaryFailed = ref(false)

async function load() {
  if (!uuid) return
  summaryFailed.value = false
  const [, res] = await Promise.allSettled([getUserProfile(uuid), getMyOrderSummary()])
  if (res.status === 'fulfilled') summary.value = res.value
  else summaryFailed.value = true
}

onMounted(() => {
  if (!token.value) {
    router.replace({ path: '/console/auth', query: { redirect: route.fullPath } })
    return
  }
  load()
})

const dateLocale = computed(() => (locale.value === 'en' ? 'en-US' : 'id-ID'))
const formatIDR = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v || 0)
const formatDate = (iso: string) => new Date(iso).toLocaleDateString(dateLocale.value, { day: 'numeric', month: 'short', year: 'numeric' })
const memberSince = computed(() =>
  profile.value?.created_at ? new Date(profile.value.created_at).toLocaleDateString(dateLocale.value, { month: 'long', year: 'numeric' }) : '',
)
// only the account's own profile can change its photo
const isMe = computed(() => !!token.value && getSecureIdFromToken(token.value) === uuid)

// the session ends on the server too; a failed call still signs out here
const { logout: endSession } = useAuth()
const loggingOut = ref(false)
async function logout() {
  if (!window.confirm(t('app.profileMenu.logoutConfirm'))) return
  loggingOut.value = true
  try {
    await endSession()
  } catch {
    // useAuth already cleared the token
  }
  await router.push('/')
}

const stats = computed(() => [
  { key: 'total', icon: Package, tone: 'text-slate-500', value: String(summary.value?.total ?? 0) },
  { key: 'active', icon: Clock, tone: 'text-amber-600', value: String(summary.value?.active ?? 0) },
  { key: 'completed', icon: CheckCircle2, tone: 'text-green-600', value: String(summary.value?.completed ?? 0) },
  { key: 'totalPaid', icon: Wallet, tone: 'text-sky-600', value: formatIDR(summary.value?.total_paid ?? 0) },
])
const itemsLine = (o: Order) => {
  if (!o.items.length) return ''
  const more = o.items.length > 1 ? ` ${t('app.profilePage.moreItems', { count: o.items.length - 1 })}` : ''
  return o.items[0].product_name + more
}
const hiddenRunning = computed(() => (summary.value ? summary.value.active - summary.value.active_orders.length : 0))

const accountFields = computed(() => [
  { key: 'email', icon: Mail, value: profile.value?.email },
  { key: 'phone', icon: Phone, value: profile.value?.phone },
  { key: 'address', icon: MapPin, value: profile.value?.address },
])
const shortcuts = [
  { key: 'orders', icon: Receipt, to: '/profile/order-histories' },
  { key: 'notifications', icon: Bell, to: '/notifications' },
  { key: 'wishlist', icon: Heart, to: '/wishlist' },
  { key: 'cart', icon: ShoppingCart, to: '/cart' },
]

useHead(() => ({
  title: t('app.profilePage.metaTitle', { name: profile.value?.name || '' }),
}))
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-green-50 via-white to-white">
    <div class="app-container px-4 pb-16 pt-28 md:px-6">
      <div v-if="loading && !profile" class="flex min-h-[50vh] items-center justify-center text-center text-slate-500">
        <div>
          <div class="mx-auto mb-4 size-10 animate-spin rounded-full border-2 border-green-600 border-b-transparent" />
          <p>{{ $t('app.profilePage.loading') }}</p>
        </div>
      </div>

      <div v-else-if="error && !profile" class="mx-auto max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
        <p class="text-slate-700">{{ error }}</p>
        <Button variant="outline" class="mt-4" @click="load">{{ $t('app.profilePage.tryAgain') }}</Button>
      </div>

      <template v-else-if="profile">
        <section class="flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div class="flex min-w-0 items-center gap-4">
            <ElementsProfileAvatar :avatar="profile.avatar" :name="profile.name" :editable="isMe" @updated="(path) => { if (profile) profile.avatar = path }" />
            <div class="min-w-0">
              <h1 class="truncate text-xl font-bold text-slate-900 md:text-2xl">{{ $t('app.profilePage.greeting', { name: profile.name }) }}</h1>
              <p class="truncate text-sm text-slate-600">{{ profile.email }}</p>
              <p v-if="memberSince" class="mt-0.5 text-xs text-slate-500">{{ $t('app.profilePage.memberSince', { date: memberSince }) }}</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 sm:shrink-0 sm:justify-end">
            <Button as-child class="flex-1 bg-green-600 hover:bg-green-700 sm:flex-none">
              <NuxtLink to="/product">{{ $t('app.profilePage.shopNow') }}</NuxtLink>
            </Button>
            <Button as-child variant="outline" class="flex-1 sm:flex-none">
              <NuxtLink to="/wishlist"><Heart class="size-4" /> {{ $t('app.profileMenu.wishlist') }}</NuxtLink>
            </Button>
            <Button v-if="isMe" variant="outline" class="flex-1 text-red-600 hover:text-red-700 sm:flex-none" :disabled="loggingOut" @click="logout">
              <LogOut class="size-4" /> {{ $t('app.profileMenu.logout') }}
            </Button>
          </div>
        </section>

        <section class="mt-4 grid grid-cols-2 gap-3 md:mt-6 md:gap-4 lg:grid-cols-4" :aria-label="$t('app.profilePage.statsLabel')">
          <div v-for="s in stats" :key="s.key" class="min-w-0 rounded-xl border bg-white p-4 shadow-sm md:p-5">
            <p class="flex items-center gap-2 text-xs font-medium text-slate-500 md:text-sm">
              <component :is="s.icon" class="size-4 shrink-0" :class="s.tone" />
              <span class="truncate">{{ $t(`app.profilePage.stats.${s.key}`) }}</span>
            </p>
            <p v-if="summary" class="mt-2 break-words text-lg font-bold text-slate-900 md:text-2xl">{{ s.value }}</p>
            <p v-else-if="summaryFailed" class="mt-2 text-lg font-bold text-slate-300 md:text-2xl">—</p>
            <p v-else class="mt-2 h-7 w-16 animate-pulse rounded bg-slate-100" />
          </div>
        </section>

        <div class="mt-6 grid gap-6 lg:grid-cols-3">
          <section class="rounded-xl border bg-white p-5 shadow-sm md:p-6 lg:col-span-2">
            <div class="mb-2 flex items-center justify-between gap-3">
              <h2 class="font-semibold text-slate-900">{{ $t('app.profilePage.runningTitle') }}</h2>
              <NuxtLink to="/profile/order-histories" class="shrink-0 text-sm font-medium text-green-700 hover:underline">{{ $t('app.profilePage.viewAllOrders') }}</NuxtLink>
            </div>

            <p v-if="summaryFailed" class="py-6 text-center text-sm text-slate-500">
              {{ $t('app.profilePage.ordersFailed') }}
              <button type="button" class="font-medium text-green-700 hover:underline" @click="load">{{ $t('app.profilePage.tryAgain') }}</button>
            </p>
            <ul v-else-if="!summary" class="space-y-3 py-2">
              <li v-for="i in 3" :key="i" class="h-16 animate-pulse rounded-lg bg-slate-100" />
            </ul>
            <div v-else-if="!summary.active_orders.length" class="mt-2 rounded-lg border border-dashed p-6 text-center text-sm text-slate-600">
              {{ $t('app.profilePage.noRunning') }}
            </div>
            <template v-else>
              <ul class="divide-y">
                <li v-for="o in summary.active_orders" :key="o.id">
                  <NuxtLink :to="`/orders/${o.access_token}`" class="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-green-50">
                    <div class="min-w-0 flex-1">
                      <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span class="font-semibold text-slate-900">{{ o.code }}</span>
                        <span class="rounded-full px-2 py-0.5 text-[11px] font-medium" :class="ORDER_STATUS_STYLE[o.status]">{{ $t(`app.orderStatus.${o.status}`) }}</span>
                      </div>
                      <p v-if="o.items.length" class="mt-0.5 truncate text-sm text-slate-600">{{ itemsLine(o) }}</p>
                      <p class="text-xs text-slate-400">{{ $t('app.profilePage.updated', { date: formatDate(o.updated_at) }) }}</p>
                    </div>
                    <p class="shrink-0 text-sm font-semibold text-slate-900">{{ formatIDR(orderListTotal(o)) }}</p>
                    <ChevronRight class="size-4 shrink-0 text-slate-400" />
                  </NuxtLink>
                </li>
              </ul>
              <p v-if="hiddenRunning > 0" class="mt-2 text-xs text-slate-500">{{ $t('app.profilePage.moreRunning', { count: hiddenRunning }) }}</p>
            </template>
          </section>

          <aside class="space-y-6">
            <section class="rounded-xl border bg-white p-5 text-sm shadow-sm md:p-6">
              <h2 class="mb-3 font-semibold text-slate-900">{{ $t('app.profilePage.account') }}</h2>
              <dl class="space-y-3">
                <div v-for="f in accountFields" :key="f.key" class="flex gap-3">
                  <component :is="f.icon" class="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <div class="min-w-0">
                    <dt class="text-xs text-slate-500">{{ $t(`app.profilePage.fields.${f.key}`) }}</dt>
                    <dd class="break-words" :class="f.value ? 'text-slate-900' : 'text-slate-400'">{{ f.value || $t('app.profilePage.notSet') }}</dd>
                  </div>
                </div>
              </dl>
            </section>

            <nav class="rounded-xl border bg-white p-2 text-sm shadow-sm" :aria-label="$t('app.profilePage.shortcuts')">
              <NuxtLink
                v-for="l in shortcuts"
                :key="l.key"
                :to="l.to"
                class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-700 transition-colors hover:bg-green-50 hover:text-green-800"
              >
                <component :is="l.icon" class="size-4 text-green-700" />
                <span class="flex-1">{{ $t(`app.profilePage.links.${l.key}`) }}</span>
                <ChevronRight class="size-4 text-slate-400" />
              </NuxtLink>
            </nav>
          </aside>
        </div>
      </template>
    </div>
  </div>
</template>
