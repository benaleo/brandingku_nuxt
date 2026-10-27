<script setup lang="ts">
import {computed, onMounted, reactive, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {toast} from 'vue-sonner'
import {Loader2, Store, Truck} from 'lucide-vue-next'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'
import {useOrderService} from '~/services/order.service'
import {getSecureIdFromToken} from '~/utils/token.helper'
import type {CheckoutInput, CheckoutItemInput, CheckoutPreview} from '~/types/order.type'

const {t} = useI18n()
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const STORAGE_URL = config.public.STORAGE_URL
const token = useCookie<string | null>('token', {sameSite: 'lax'})
const {previewCheckout, placeOrder} = useOrderService()
const {getUserProfile} = useUserProfile()
const {refresh: refreshCart} = useCart()

useHead(() => ({title: t('app.checkoutPage.metaTitle'), meta: [{name: 'robots', content: 'noindex'}]}))

// "Beli sekarang" passes one variant in the query; otherwise the cart is checked out
const buyNowItems = computed<CheckoutItemInput[] | undefined>(() => {
  const id = Number(route.query.item)
  const qty = Number(route.query.qty)
  return id > 0 && qty > 0 ? [{product_additional_id: id, quantity: Math.floor(qty)}] : undefined
})

const preview = ref<CheckoutPreview | null>(null)
const loading = ref(true)
const loadError = ref('')
const placing = ref(false)
const voucherInput = ref('')
const appliedVoucher = ref('')
const applyingVoucher = ref(false)
// one key per checkout page: a double submit or a retry after a timeout returns the same order
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
})

const formatIDR = (v: number) => new Intl.NumberFormat('id-ID', {style: 'currency', currency: 'IDR', maximumFractionDigits: 0}).format(v || 0)
const imageSrc = (image: string) => !image ? '/images/no-image.jpg' : image.startsWith('http') ? image : `${STORAGE_URL}${image}`
const taxRate = computed(() => preview.value ? formatBps(preview.value.tax_rate_bps) : '')

async function loadPreview(voucher = appliedVoucher.value) {
  const res = await previewCheckout(buyNowItems.value, voucher || undefined)
  preview.value = res
  return res
}

onMounted(async () => {
  if (!token.value) {
    toast.info(t('app.checkoutPage.loginFirst'))
    await router.replace({path: '/console/auth', query: {redirect: route.fullPath}})
    return
  }
  try {
    await loadPreview()
  } catch (e: any) {
    loadError.value = cartErrorMessage(e, t('app.checkoutPage.empty'))
  } finally {
    loading.value = false
  }
  // prefill from the account; checkout still works without it
  try {
    const secureId = getSecureIdFromToken(token.value || '')
    const profile = secureId ? await getUserProfile(secureId) : null
    if (profile) {
      form.customer_name ||= profile.name || ''
      form.customer_phone ||= profile.phone || ''
      form.shipping_name ||= profile.name || ''
      form.shipping_phone ||= profile.phone || ''
      form.shipping_address ||= profile.address || ''
    }
  } catch {
    // ignore
  }
})

async function applyVoucher() {
  const code = voucherInput.value.trim().toUpperCase()
  if (!code) return
  applyingVoucher.value = true
  try {
    const res = await loadPreview(code)
    if (res.voucher_message) {
      toast.error(res.voucher_message)
      await loadPreview('')
      appliedVoucher.value = ''
    } else {
      appliedVoucher.value = code
      toast.success(t('app.checkoutPage.voucherApplied', {code}))
    }
  } catch (e: any) {
    toast.error(cartErrorMessage(e, t('app.checkoutPage.failed')))
  } finally {
    applyingVoucher.value = false
  }
}

async function removeVoucher() {
  appliedVoucher.value = ''
  voucherInput.value = ''
  await loadPreview('')
}

function missingField(): string | null {
  const required: [string, string][] = [[form.customer_name, 'name'], [form.customer_phone, 'phone']]
  if (form.delivery_method === 'delivery') {
    required.push([form.shipping_name, 'recipient'], [form.shipping_phone, 'recipientPhone'], [form.shipping_address, 'address'], [form.shipping_city, 'city'])
  }
  const missing = required.find(([value]) => !value.trim())
  return missing ? t(`app.checkoutPage.${missing[1]}`) : null
}

async function submit() {
  const missing = missingField()
  if (missing) {
    toast.error(t('app.checkoutPage.required', {field: missing}))
    return
  }
  const input: CheckoutInput = {
    items: buyNowItems.value,
    voucher_code: appliedVoucher.value || undefined,
    delivery_method: form.delivery_method,
    customer_name: form.customer_name.trim(),
    customer_phone: form.customer_phone.trim(),
    customer_company: form.customer_company.trim(),
    notes: form.notes.trim(),
    ...(form.delivery_method === 'delivery' ? {
      shipping_name: form.shipping_name.trim(),
      shipping_phone: form.shipping_phone.trim(),
      shipping_address: form.shipping_address.trim(),
      shipping_city: form.shipping_city.trim(),
      shipping_postal_code: form.shipping_postal_code.trim(),
    } : {}),
  }
  placing.value = true
  try {
    const order = await placeOrder(input, idempotencyKey)
    refreshCart().catch(() => {})
    await router.push(`/orders/${order.code}`)
  } catch (e: any) {
    toast.error(cartErrorMessage(e, t('app.checkoutPage.failed')))
    // prices or stock may have changed meanwhile
    loadPreview().catch(() => {})
  } finally {
    placing.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-green-50 via-white to-white">
    <div class="app-container px-4 md:px-6 pt-28 pb-16">
      <h1 class="mb-6 text-2xl font-bold text-slate-900 md:text-3xl">{{ $t('app.checkoutPage.title') }}</h1>

      <p v-if="loading" class="py-10 text-center text-slate-500">{{ $t('app.checkoutPage.loading') }}</p>
      <div v-else-if="loadError || !preview" class="mx-auto max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
        <p class="text-slate-700">{{ loadError || $t('app.checkoutPage.empty') }}</p>
        <Button class="mt-6 bg-green-600 hover:bg-green-700" @click="router.push('/cart')">{{ $t('app.checkoutPage.backToCart') }}</Button>
      </div>

      <form v-else class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start" @submit.prevent="submit">
        <div class="space-y-6">
          <!-- items -->
          <section class="rounded-xl border bg-white p-4 shadow-sm sm:p-5">
            <h2 class="mb-3 font-semibold text-slate-900">{{ $t('app.checkoutPage.items') }}</h2>
            <ul class="divide-y">
              <li v-for="line in preview.lines" :key="line.product_additional_id" class="flex gap-3 py-3">
                <img :src="imageSrc(line.product_image)" :alt="line.product_name" class="size-16 shrink-0 rounded-lg bg-gray-100 object-cover" onerror="this.src='/images/no-image.jpg'"/>
                <div class="min-w-0 flex-1 text-sm">
                  <p class="font-medium text-slate-900">{{ line.product_name }}</p>
                  <p class="text-slate-500">{{ line.variant_name }} · {{ line.quantity }} × {{ formatIDR(line.unit_price) }}</p>
                  <p v-if="line.note" class="text-xs text-slate-500">{{ line.note }}</p>
                  <p v-if="line.problem" class="mt-1 text-xs font-medium text-red-600">{{ line.problem }}</p>
                </div>
                <p class="shrink-0 text-sm font-semibold">{{ formatIDR(line.line_total) }}</p>
              </li>
            </ul>
          </section>

          <!-- contact -->
          <section class="rounded-xl border bg-white p-4 shadow-sm sm:p-5">
            <h2 class="mb-3 font-semibold text-slate-900">{{ $t('app.checkoutPage.contact') }}</h2>
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="space-y-1.5">
                <Label for="co-name">{{ $t('app.checkoutPage.name') }} *</Label>
                <Input id="co-name" v-model="form.customer_name" maxlength="150" autocomplete="name"/>
              </div>
              <div class="space-y-1.5">
                <Label for="co-phone">{{ $t('app.checkoutPage.phone') }} *</Label>
                <Input id="co-phone" v-model="form.customer_phone" maxlength="40" autocomplete="tel" inputmode="tel"/>
              </div>
              <div class="space-y-1.5 sm:col-span-2">
                <Label for="co-company">{{ $t('app.checkoutPage.company') }}</Label>
                <Input id="co-company" v-model="form.customer_company" maxlength="150" autocomplete="organization"/>
              </div>
            </div>
          </section>

          <!-- delivery -->
          <section class="rounded-xl border bg-white p-4 shadow-sm sm:p-5">
            <h2 class="mb-3 font-semibold text-slate-900">{{ $t('app.checkoutPage.delivery') }}</h2>
            <div class="grid gap-3 sm:grid-cols-2">
              <label
                v-for="opt in [
                  { value: 'delivery', icon: Truck, title: $t('app.checkoutPage.methodDelivery'), hint: $t('app.checkoutPage.methodDeliveryHint') },
                  { value: 'pickup', icon: Store, title: $t('app.checkoutPage.methodPickup'), hint: $t('app.checkoutPage.methodPickupHint') },
                ]"
                :key="opt.value"
                class="flex cursor-pointer gap-3 rounded-lg border p-3 text-sm"
                :class="form.delivery_method === opt.value ? 'border-green-600 bg-green-50' : 'hover:border-slate-300'"
              >
                <input v-model="form.delivery_method" type="radio" :value="opt.value" class="mt-1"/>
                <component :is="opt.icon" class="mt-0.5 size-5 shrink-0 text-green-700"/>
                <span>
                  <span class="block font-medium text-slate-900">{{ opt.title }}</span>
                  <span class="text-slate-500">{{ opt.hint }}</span>
                </span>
              </label>
            </div>
            <div v-if="form.delivery_method === 'delivery'" class="mt-4 grid gap-3 sm:grid-cols-2">
              <div class="space-y-1.5">
                <Label for="co-recipient">{{ $t('app.checkoutPage.recipient') }} *</Label>
                <Input id="co-recipient" v-model="form.shipping_name" maxlength="150"/>
              </div>
              <div class="space-y-1.5">
                <Label for="co-recipient-phone">{{ $t('app.checkoutPage.recipientPhone') }} *</Label>
                <Input id="co-recipient-phone" v-model="form.shipping_phone" maxlength="40" inputmode="tel"/>
              </div>
              <div class="space-y-1.5 sm:col-span-2">
                <Label for="co-address">{{ $t('app.checkoutPage.address') }} *</Label>
                <Textarea id="co-address" v-model="form.shipping_address" rows="2" maxlength="500" autocomplete="street-address"/>
              </div>
              <div class="space-y-1.5">
                <Label for="co-city">{{ $t('app.checkoutPage.city') }} *</Label>
                <Input id="co-city" v-model="form.shipping_city" maxlength="100" autocomplete="address-level2"/>
              </div>
              <div class="space-y-1.5">
                <Label for="co-postal">{{ $t('app.checkoutPage.postalCode') }}</Label>
                <Input id="co-postal" v-model="form.shipping_postal_code" maxlength="10" inputmode="numeric" autocomplete="postal-code"/>
              </div>
            </div>
            <div class="mt-4 space-y-1.5">
              <Label for="co-notes">{{ $t('app.checkoutPage.notes') }}</Label>
              <Textarea id="co-notes" v-model="form.notes" rows="2" maxlength="1000"/>
            </div>
          </section>
        </div>

        <!-- summary -->
        <aside class="space-y-4 rounded-xl border bg-white p-5 shadow-sm lg:sticky lg:top-28">
          <h2 class="font-semibold text-slate-900">{{ $t('app.checkoutPage.summary') }}</h2>

          <div class="space-y-1.5">
            <Label for="co-voucher">{{ $t('app.checkoutPage.voucher') }}</Label>
            <div v-if="appliedVoucher" class="flex items-center justify-between rounded-md border border-green-600 bg-green-50 px-3 py-2 text-sm">
              <span class="font-mono font-semibold text-green-800">{{ appliedVoucher }}</span>
              <button type="button" class="text-slate-500 hover:text-red-600" @click="removeVoucher">{{ $t('app.checkoutPage.remove') }}</button>
            </div>
            <div v-else class="flex gap-2">
              <Input id="co-voucher" v-model="voucherInput" class="font-mono uppercase" maxlength="32" :placeholder="$t('app.checkoutPage.voucherPlaceholder')" @keydown.enter.prevent="applyVoucher"/>
              <Button type="button" variant="outline" :disabled="applyingVoucher || !voucherInput.trim()" @click="applyVoucher">
                <Loader2 v-if="applyingVoucher" class="size-4 animate-spin"/>
                {{ $t('app.checkoutPage.apply') }}
              </Button>
            </div>
          </div>

          <dl class="space-y-1.5 border-t pt-3 text-sm">
            <div class="flex justify-between"><dt class="text-slate-600">{{ $t('app.checkoutPage.subtotal') }}</dt><dd>{{ formatIDR(preview.subtotal) }}</dd></div>
            <div v-if="preview.discount" class="flex justify-between text-green-700"><dt>{{ $t('app.checkoutPage.discount') }}</dt><dd>-{{ formatIDR(preview.discount) }}</dd></div>
            <div v-if="preview.tax_mode === 'exclusive'" class="flex justify-between"><dt class="text-slate-600">{{ $t('app.checkoutPage.tax', {rate: taxRate}) }}</dt><dd>{{ formatIDR(preview.tax_total) }}</dd></div>
            <div class="flex justify-between">
              <dt class="text-slate-600">{{ $t('app.checkoutPage.shipping') }}</dt>
              <dd>{{ form.delivery_method === 'pickup' ? $t('app.checkoutPage.shippingFree') : $t('app.checkoutPage.shippingPending') }}</dd>
            </div>
            <div class="flex justify-between border-t pt-2 text-base font-bold">
              <dt>{{ form.delivery_method === 'pickup' ? $t('app.checkoutPage.total') : $t('app.checkoutPage.totalNoShipping') }}</dt>
              <dd>{{ formatIDR(preview.total) }}</dd>
            </div>
            <p v-if="preview.tax_mode === 'inclusive'" class="text-xs text-slate-500">{{ $t('app.checkoutPage.taxIncluded', {rate: taxRate}) }}</p>
          </dl>

          <p v-if="!preview.can_pay" class="rounded-md bg-amber-50 p-3 text-sm text-amber-800">{{ $t('app.checkoutPage.cannotPay') }}</p>
          <Button type="submit" class="h-11 w-full bg-green-600 hover:bg-green-700" :disabled="placing || !preview.can_pay">
            <Loader2 v-if="placing" class="size-4 animate-spin"/>
            {{ placing ? $t('app.checkoutPage.placing') : $t('app.checkoutPage.placeOrder') }}
          </Button>
          <Button type="button" variant="outline" class="w-full" @click="router.push('/cart')">{{ $t('app.checkoutPage.backToCart') }}</Button>
        </aside>
      </form>
    </div>
  </div>
</template>
