<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ExternalLink, FileText, Loader2, Wallet } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { useOrderService } from '~/services/order.service'
import type { Order, PaymentPlanInput } from '~/types/order.type'

// the customer picks the first payment of an accepted quotation once its deal is sent:
// a DP of at least half the deal (as a percentage or a nominal) or the full amount
const props = defineProps<{ order: Order }>()
const emit = defineEmits<{ chosen: [order: Order] }>()

const { t } = useI18n()
const { previewPaymentPlan, choosePaymentPlan } = useOrderService()
const PERCENT_CHIPS = [50, 60, 70, 80]
const PLANS = ['dp', 'full'] as const
const MODES = ['percent', 'amount'] as const

const options = computed(() => props.order.payment_options!)
const plan = ref<'dp' | 'full'>('dp')
const mode = ref<'percent' | 'amount'>('percent')
const percent = ref<number | string>(50)
const amount = ref<number | string>(options.value.min_dp_amount)

const formatIDR = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v || 0)

// what the backend will bill: percentages are rounded half up like the server does
const dpAmount = computed(() => {
  if (mode.value === 'amount') return Math.round(Number(amount.value) || 0)
  return Math.round((options.value.deal_total * (Number(percent.value) || 0)) / 100)
})
const dpError = computed(() => {
  if (plan.value !== 'dp') return ''
  if (mode.value === 'percent') {
    const p = Number(percent.value)
    return !Number.isFinite(p) || p < 50 || p >= 100 ? t('app.paymentPlan.percentRange') : ''
  }
  return dpAmount.value < options.value.min_dp_amount || dpAmount.value >= options.value.deal_total
    ? t('app.paymentPlan.amountRange', { min: formatIDR(options.value.min_dp_amount), total: formatIDR(options.value.deal_total) })
    : ''
})
const payNow = computed(() => (plan.value === 'dp' ? dpAmount.value : options.value.deal_total))
const input = computed<PaymentPlanInput>(() => {
  if (plan.value === 'full') return { plan: 'full' }
  return mode.value === 'percent'
    ? { plan: 'dp', dp_percent_bps: Math.round(Number(percent.value) * 100) }
    : { plan: 'dp', dp_amount: dpAmount.value }
})

// the PDF preview follows the edits once they settle
const previewUrl = ref('')
const previewing = ref(false)
const previewFailed = ref(false)
let previewTimer: ReturnType<typeof setTimeout> | null = null
let previewSeq = 0
const dropPreview = () => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
}
const loadPreview = async () => {
  const seq = ++previewSeq
  previewing.value = true
  previewFailed.value = false
  try {
    const b64 = await previewPaymentPlan(props.order.code, input.value)
    if (seq !== previewSeq) return
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
    dropPreview()
    previewUrl.value = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
  } catch {
    if (seq === previewSeq) previewFailed.value = true
  } finally {
    if (seq === previewSeq) previewing.value = false
  }
}
watch(input, () => {
  if (previewTimer) clearTimeout(previewTimer)
  if (dpError.value) {
    previewSeq++
    previewing.value = false
    dropPreview()
    return
  }
  previewTimer = setTimeout(loadPreview, 700)
}, { immediate: true, deep: true })
onBeforeUnmount(() => {
  if (previewTimer) clearTimeout(previewTimer)
  dropPreview()
})

const confirmOpen = ref(false)
const submitting = ref(false)
const submit = async () => {
  submitting.value = true
  try {
    const order = await choosePaymentPlan(props.order.code, input.value)
    confirmOpen.value = false
    toast.success(t(plan.value === 'dp' ? 'app.paymentPlan.dpCreated' : 'app.paymentPlan.fullCreated'))
    emit('chosen', order)
  } catch (e: any) {
    toast.error(cartErrorMessage(e, t('app.orderPage.failed')))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="rounded-xl border-2 border-green-600 bg-white p-5 shadow-sm">
    <h2 class="flex items-center gap-2 font-semibold"><Wallet class="size-5 text-green-700" /> {{ $t('app.paymentPlan.title') }}</h2>
    <p class="mt-1 text-sm text-slate-600">{{ $t('app.paymentPlan.subtitle', { number: options.deal_number, total: formatIDR(options.deal_total) }) }}</p>

    <div role="radiogroup" :aria-label="$t('app.paymentPlan.title')" class="mt-4 grid gap-2 sm:grid-cols-2">
      <label
        v-for="opt in PLANS"
        :key="opt"
        class="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors"
        :class="plan === opt ? 'border-green-600 bg-green-50' : 'hover:bg-slate-50'"
      >
        <input v-model="plan" type="radio" name="payment-plan" :value="opt" class="mt-1 accent-green-600">
        <span>
          <span class="block text-sm font-semibold text-slate-900">{{ $t(`app.paymentPlan.${opt}`) }}</span>
          <span class="block text-xs text-slate-600">{{ $t(`app.paymentPlan.${opt}Text`) }}</span>
        </span>
      </label>
    </div>

    <div v-if="plan === 'dp'" class="mt-4 space-y-3">
      <div class="inline-flex rounded-lg border bg-slate-50 p-0.5 text-sm" role="tablist" :aria-label="$t('app.paymentPlan.dpType')">
        <button
          v-for="m in MODES"
          :key="m"
          type="button"
          role="tab"
          :aria-selected="mode === m"
          class="rounded-md px-3 py-1.5 font-medium transition-colors"
          :class="mode === m ? 'bg-white text-green-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          @click="mode = m"
        >
          {{ $t(`app.paymentPlan.${m}`) }}
        </button>
      </div>

      <div v-if="mode === 'percent'" class="space-y-2">
        <label for="dp-percent" class="sr-only">{{ $t('app.paymentPlan.percent') }}</label>
        <div class="flex items-center gap-2">
          <input id="dp-percent" v-model="percent" type="number" inputmode="decimal" min="50" max="99.99" step="1" class="h-10 w-28 rounded-md border px-3 text-base outline-none focus:ring-2 focus:ring-green-600/40 md:text-sm">
          <span class="text-sm text-slate-600">%</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="p in PERCENT_CHIPS"
            :key="p"
            type="button"
            class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
            :class="Number(percent) === p ? 'border-green-600 bg-green-600 text-white' : 'hover:border-green-600 hover:text-green-700'"
            @click="percent = p"
          >
            {{ p }}%
          </button>
        </div>
      </div>
      <div v-else class="space-y-1">
        <label for="dp-amount" class="sr-only">{{ $t('app.paymentPlan.amount') }}</label>
        <div class="max-w-56">
          <ElementsRupiahInput id="dp-amount" v-model="amount" class="h-10" :aria-invalid="!!dpError || undefined" />
        </div>
      </div>
      <p class="text-xs" :class="dpError ? 'font-medium text-red-600' : 'text-slate-500'">
        {{ dpError || $t('app.paymentPlan.minHint', { min: formatIDR(options.min_dp_amount) }) }}
      </p>
    </div>

    <dl class="mt-4 space-y-1 rounded-lg bg-slate-50 p-3 text-sm">
      <div class="flex justify-between gap-3">
        <dt class="text-slate-600">{{ $t('app.paymentPlan.payNow') }}</dt>
        <dd class="font-semibold text-slate-900">{{ dpError ? '–' : formatIDR(payNow) }}</dd>
      </div>
      <div v-if="plan === 'dp'" class="flex justify-between gap-3">
        <dt class="text-slate-600">{{ $t('app.paymentPlan.payLater') }}</dt>
        <dd class="text-slate-900">{{ dpError ? '–' : formatIDR(options.deal_total - payNow) }}</dd>
      </div>
    </dl>

    <!-- PDF preview: inline from md up, a link on phones where embedded PDFs do not render -->
    <div class="mt-4">
      <p class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <FileText class="size-3.5" /> {{ $t(plan === 'dp' ? 'app.paymentPlan.previewDp' : 'app.paymentPlan.previewFull') }}
        <Loader2 v-if="previewing" class="size-3.5 animate-spin" />
      </p>
      <p v-if="previewFailed" class="text-xs text-red-600">{{ $t('app.paymentPlan.previewFailed') }}</p>
      <template v-else-if="previewUrl">
        <iframe :src="previewUrl" :title="$t('app.paymentPlan.previewDp')" class="hidden h-[520px] w-full rounded-lg border bg-slate-100 md:block" />
        <a :href="previewUrl" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:underline md:hidden">
          <ExternalLink class="size-4" /> {{ $t('app.paymentPlan.openPreview') }}
        </a>
      </template>
      <p v-else-if="!dpError" class="text-xs text-slate-500">{{ $t('app.paymentPlan.previewLoading') }}</p>
    </div>

    <Button class="mt-4 w-full bg-green-600 hover:bg-green-700 sm:w-auto" :disabled="!!dpError || submitting" @click="confirmOpen = true">
      {{ $t(plan === 'dp' ? 'app.paymentPlan.submitDp' : 'app.paymentPlan.submitFull') }}
    </Button>

    <ElementsConfirmDialog
      v-model:open="confirmOpen"
      :icon="Wallet"
      :title="$t(plan === 'dp' ? 'app.paymentPlan.confirmDpTitle' : 'app.paymentPlan.confirmFullTitle', { amount: formatIDR(payNow) })"
      :description="$t(plan === 'dp' ? 'app.paymentPlan.confirmDpText' : 'app.paymentPlan.confirmFullText')"
      :confirm-label="$t(plan === 'dp' ? 'app.paymentPlan.submitDp' : 'app.paymentPlan.submitFull')"
      :busy="submitting"
      @confirm="submit"
    />
  </section>
</template>
