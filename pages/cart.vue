<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { CartItem } from '~/composables/useCart'

// the cart needs an account; login brings the visitor back here
definePageMeta({
  middleware: (to) => {
    if (!useCookie<string | null>('token').value) return navigateTo({ path: '/console/auth', query: { redirect: to.fullPath } })
  },
})

const router = useRouter()
const { t } = useI18n()
const config = useRuntimeConfig()
const STORAGE_URL = config.public.STORAGE_URL

useHead(() => ({
  title: t('app.cartPage.metaTitle'),
  meta: [{ name: 'robots', content: 'noindex' }],
}))

const { cart, loading, refresh, update, remove } = useCart()
const loaded = ref(false)

onMounted(async () => {
  try {
    await refresh()
  } catch (e: any) {
    // an expired session: sign in again instead of showing the error
    if (e?.cause?.code === 'UNAUTHENTICATED') {
      token.value = null
      await router.replace({ path: '/console/auth', query: { redirect: '/cart' } })
      return
    }
    toast.error(cartErrorMessage(e, t('app.cartPage.failed')))
  } finally {
    loaded.value = true
  }
})

const formatIDR = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0)

const imageSrc = (image: string) => {
  if (!image) return '/images/no-image.jpg'
  if (image.startsWith('http') || image.startsWith('data:')) return image
  return `${STORAGE_URL}${image}`
}

// guest lines have no id yet, the variant identifies them
const lineKey = (item: CartItem) => item.id || `v${item.product_additional_id}`
const pending = reactive<Record<string, boolean>>({})
const notes = reactive<Record<string, string>>({})
const noteOf = (item: CartItem) => notes[lineKey(item)] ?? item.note

const run = async (item: CartItem, action: () => Promise<void>) => {
  const key = lineKey(item)
  if (pending[key]) return
  pending[key] = true
  try {
    await action()
  } catch (e: any) {
    toast.error(cartErrorMessage(e, t('app.cartPage.failed')))
  } finally {
    pending[key] = false
  }
}

const setQuantity = (item: CartItem, value: number | string) => {
  const n = Math.floor(Number(value))
  const qty = Number.isFinite(n) ? Math.min(Math.max(n, item.moq), 100000) : item.moq
  if (qty === item.quantity) return
  run(item, () => update(item, qty))
}

const saveNote = (item: CartItem) => {
  const note = (notes[lineKey(item)] ?? item.note).trim()
  delete notes[lineKey(item)]
  if (note === item.note) return
  run(item, () => update(item, item.quantity, note))
}

const removeItem = (item: CartItem) => run(item, () => remove(item))

const token = useCookie<string | null>('token', { sameSite: 'lax' })
const hasPayable = computed(() => cart.value.items.some(i => i.available))
// guests sign in first; their cart is merged into the account on the way back
const goCheckout = () => token.value
  ? router.push('/checkout')
  : router.push({ path: '/console/auth', query: { redirect: '/checkout' } })
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-green-50 via-white to-white">
    <div class="app-container px-4 md:px-6 pt-28 pb-16">
      <div class="mb-6 flex items-end justify-between gap-3">
        <h1 class="text-2xl md:text-3xl font-bold text-slate-900">{{ $t('app.cartPage.title') }}</h1>
        <span v-if="cart.item_count" class="shrink-0 rounded-full border bg-white px-3 py-1 text-sm text-slate-700 shadow-sm">
          {{ $t('app.cartPage.lines', { count: cart.item_count }, cart.item_count) }}
        </span>
      </div>

      <ul v-if="!loaded && loading" class="space-y-3" :aria-label="$t('app.cartPage.loading')">
        <li v-for="n in 3" :key="n" class="flex gap-4 rounded-xl border bg-white p-4 animate-pulse">
          <div class="size-20 shrink-0 rounded-lg bg-gray-200"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-1/2 rounded bg-gray-200"></div>
            <div class="h-3 w-1/3 rounded bg-gray-200"></div>
          </div>
        </li>
      </ul>

      <div v-else-if="!cart.items.length" class="mx-auto max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
        <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-green-100">
          <ShoppingCart class="size-7 text-green-700" />
        </div>
        <p class="text-lg font-semibold text-slate-900">{{ $t('app.cartPage.empty') }}</p>
        <div class="mt-6">
          <Button class="bg-green-600 hover:bg-green-700" @click="router.push('/product')">{{ $t('app.cartPage.browse') }}</Button>
        </div>
      </div>

      <div v-else class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <ul class="space-y-3">
          <li
            v-for="item in cart.items"
            :key="lineKey(item)"
            class="flex gap-3 rounded-xl border bg-white p-3 shadow-sm sm:gap-4 sm:p-4"
            :class="{ 'opacity-70': !item.available }"
          >
            <NuxtLink :to="`/product/${item.product_slug}`" class="shrink-0">
              <img
                :src="imageSrc(item.product_image)"
                :alt="item.product_name"
                class="size-20 rounded-lg object-cover bg-gray-100 sm:size-24"
                loading="lazy"
                onerror="this.src='/images/no-image.jpg'"
              />
            </NuxtLink>

            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <NuxtLink :to="`/product/${item.product_slug}`" class="line-clamp-2 font-medium text-slate-900 hover:text-green-700">
                    {{ item.product_name }}
                  </NuxtLink>
                  <p class="mt-0.5 text-sm text-slate-500">{{ $t('app.cartPage.variant') }}: {{ item.variant_name }}</p>
                </div>
                <button
                  type="button"
                  class="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                  :aria-label="`${$t('app.cartPage.remove')} ${item.product_name}`"
                  :disabled="pending[lineKey(item)]"
                  @click="removeItem(item)"
                >
                  <Trash2 class="size-4" />
                </button>
              </div>

              <template v-if="item.available">
                <div class="mt-1 text-sm">
                  <template v-if="item.unit_price > 0">
                    <span class="font-semibold text-slate-900">{{ formatIDR(item.unit_price) }}</span>
                    <span v-if="item.original_unit_price > item.unit_price" class="ml-2 text-slate-400 line-through">{{ formatIDR(item.original_unit_price) }}</span>
                  </template>
                  <span v-else class="font-semibold text-green-700">{{ $t('app.cartPage.priceOnRequest') }}</span>
                </div>

                <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div class="inline-flex items-center rounded-md border bg-white">
                      <button
                        type="button"
                        class="inline-flex size-9 items-center justify-center text-slate-600 hover:bg-gray-50 disabled:opacity-40"
                        :aria-label="$t('app.cartPage.decrease')"
                        :disabled="pending[lineKey(item)] || item.quantity <= item.moq"
                        @click="setQuantity(item, item.quantity - 1)"
                      >
                        <Minus class="size-4" />
                      </button>
                      <input
                        :value="item.quantity"
                        type="number"
                        inputmode="numeric"
                        :min="item.moq"
                        :aria-label="`${$t('app.cartPage.quantity')} ${item.product_name}`"
                        :disabled="pending[lineKey(item)]"
                        class="h-9 w-20 border-x text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        @change="setQuantity(item, ($event.target as HTMLInputElement).value)"
                      />
                      <button
                        type="button"
                        class="inline-flex size-9 items-center justify-center text-slate-600 hover:bg-gray-50 disabled:opacity-40"
                        :aria-label="$t('app.cartPage.increase')"
                        :disabled="pending[lineKey(item)]"
                        @click="setQuantity(item, item.quantity + 1)"
                      >
                        <Plus class="size-4" />
                      </button>
                    </div>
                    <p v-if="item.moq > 1" class="mt-1 text-xs text-slate-500">{{ $t('app.cartPage.minQty', { moq: item.moq }) }}</p>
                  </div>
                  <p v-if="item.unit_price > 0" class="font-semibold text-slate-900">{{ formatIDR(item.line_total) }}</p>
                </div>

                <p v-if="item.unit_price > 0 && item.quantity > item.stock" class="mt-2 text-xs text-amber-700">
                  {{ $t('app.cartPage.overStock', { stock: item.stock }) }}
                </p>

                <label class="mt-3 block">
                  <span class="sr-only">{{ $t('app.cartPage.note') }}</span>
                  <textarea
                    :value="noteOf(item)"
                    rows="1"
                    maxlength="500"
                    :placeholder="`${$t('app.cartPage.note')}: ${$t('app.cartPage.notePlaceholder')}`"
                    :disabled="pending[lineKey(item)]"
                    class="w-full resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-green-600"
                    @input="notes[lineKey(item)] = ($event.target as HTMLTextAreaElement).value"
                    @blur="saveNote(item)"
                  ></textarea>
                </label>
              </template>

              <p v-else class="mt-2 text-sm text-red-600">
                <span class="font-medium">{{ $t('app.cartPage.unavailable') }}.</span>
                {{ $t('app.cartPage.unavailableHint') }}
              </p>
            </div>
          </li>
        </ul>

        <aside class="rounded-xl border bg-white p-5 shadow-sm lg:sticky lg:top-28">
          <h2 class="text-lg font-semibold text-slate-900">{{ $t('app.cartPage.summary') }}</h2>
          <div class="mt-4 flex items-center justify-between">
            <span class="text-slate-600">{{ $t('app.cartPage.subtotal') }}</span>
            <span class="text-lg font-bold text-slate-900">{{ formatIDR(cart.subtotal) }}</span>
          </div>
          <p class="mt-1 text-xs text-slate-500">{{ $t('app.cartPage.subtotalHint') }}</p>
          <p v-if="cart.has_price_on_request" class="mt-3 rounded-md bg-green-50 p-3 text-xs text-green-800">
            {{ $t('app.cartPage.priceOnRequestHint') }}
          </p>
          <Button class="mt-5 h-11 w-full bg-green-600 hover:bg-green-700" :disabled="!hasPayable" @click="goCheckout">
            {{ $t('app.cartPage.checkout') }}
          </Button>
          <p v-if="!token" class="mt-2 text-center text-xs text-slate-500">{{ $t('app.cartPage.checkoutHint') }}</p>
          <Button variant="outline" class="mt-3 w-full" @click="router.push('/product')">
            {{ $t('app.cartPage.continueShopping') }}
          </Button>
        </aside>
      </div>
    </div>
  </div>
</template>
