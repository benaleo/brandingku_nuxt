<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, reactive, ref, watch} from 'vue'
import {useElementVisibility} from '@vueuse/core'
import {useRoute, useRouter} from 'vue-router'
import {toast} from 'vue-sonner'
import {AlertCircle, ArrowLeft, Ban, CheckCircle2, FileDown, ExternalLink, Loader2, XCircle} from 'lucide-vue-next'
import {Badge} from '@/components/ui/badge'
import {Dialog, DialogContent, DialogDescription, DialogTitle} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {useInvoiceService} from '~/services/invoice.service'
import {useOrderService} from '~/services/order.service'
import type {InvoiceItem} from '~/types/invoice.type'
import type {Order} from '~/types/order.type'


const {t, te, locale} = useI18n()
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const token = useCookie<string | null>('token', {sameSite: 'lax'})
const {getMyOrder, submitPaymentProof, cancelMyOrder, respondQuotation, startOnlinePayment, reviewProgress} = useOrderService()
const code = computed(() => String(route.params.code || ''))

const order = ref<Order | null>(null)
const loading = ref(true)
const notFound = ref(false)
const busy = ref(false)


const formatIDR = (v: number) => new Intl.NumberFormat('id-ID', {style: 'currency', currency: 'IDR', maximumFractionDigits: 0}).format(v || 0)
const formatWhen = (iso?: string | null) => iso
  ? new Date(iso).toLocaleString(locale.value === 'en' ? 'en-US' : 'id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})
  : ''
const imageSrc = (image: string) => !image ? '/images/no-image.jpg' : image.startsWith('http') ? image : `${config.public.STORAGE_URL}${image}`
const storageUrl = (path: string) => path.startsWith('http') ? path : `${config.public.STORAGE_URL}${path}`

const inv = computed(() => order.value?.invoice || null)
const isQuote = computed(() => order.value?.type === 'quotation')
// the document a proof is for: purchases have one invoice, quotation orders a DP and/or final
const payTarget = ref<number | null>(null)
const targetDoc = computed(() => order.value?.payable_documents.find(d => d.id === payTarget.value) || order.value?.payable_documents[0] || null)
const remaining = computed(() => targetDoc.value ? Math.max(0, targetDoc.value.amount_due - targetDoc.value.paid_amount) : 0)
const allPayments = computed(() => (order.value?.documents || []).flatMap(d => d.payments.map(p => ({...p, number: d.number}))))
const docUrl = (token: string) => `/invoice/${token}`
const docPdf = (token: string) => `${String(config.public.API_URL).replace(/\/$/, '')}/invoice/${token}/pdf`
const invoiceUrl = computed(() => inv.value?.public_token ? `/invoice/${inv.value.public_token}` : '')
const pdfUrl = computed(() => inv.value?.public_token ? `${String(config.public.API_URL).replace(/\/$/, '')}/invoice/${inv.value.public_token}/pdf` : '')
const statusClass = computed(() => order.value ? ORDER_STATUS_STYLE[order.value.status] : '')

async function load() {
  try {
    order.value = await getMyOrder(code.value)
    notFound.value = false
    resetProof()
  } catch (e: any) {
    // a failed refresh keeps the order on screen
    if (order.value) toast.error(cartErrorMessage(e, t('app.orderPage.failed')))
    else notFound.value = true
  } finally {
    loading.value = false
  }
}

// coming back from the gateway with the browser's back button restores this page as it was
const onPageShow = (e: PageTransitionEvent) => { if (e.persisted) paying.value = false }
onMounted(() => window.addEventListener('pageshow', onPageShow))
onBeforeUnmount(() => window.removeEventListener('pageshow', onPageShow))

onMounted(() => {
  if (!token.value) {
    router.replace({path: '/console/auth', query: {redirect: route.fullPath}})
    return
  }
  load()
})

const proof = reactive({amount: 0 as number | string, paid_on: todayISO(), payer_name: '', note: '', file: null as File | null})
// the remaining amount of the first payable document is the natural default for a new proof
function resetProof() {
  payTarget.value = order.value?.payable_documents[0]?.id ?? null
  proof.amount = remaining.value
}
const pickProof = ([file]: File[]) => {
  if (file.size > MAX_UPLOAD_BYTES || !isImageOrPdf(file)) {
    toast.error(t(file.size > MAX_UPLOAD_BYTES ? 'app.orderPage.fileTooLarge' : 'app.orderPage.fileType'))
    return
  }
  proof.file = file
}

async function sendProof() {
  if (!order.value || !proof.file) return
  busy.value = true
  try {
    order.value = await submitPaymentProof(order.value.code, {
      invoice_id: targetDoc.value?.id,
      amount: Math.floor(Number(proof.amount) || 0),
      paid_on: proof.paid_on,
      payer_name: proof.payer_name.trim(),
      note: proof.note.trim(),
      proof: {file_name: proof.file.name, content_type: proof.file.type, content: await readFileAsDataURL(proof.file)},
    })
    toast.success(t('app.orderPage.proofSent'))
    proof.file = null
    resetProof()
  } catch (e: any) {
    toast.error(cartErrorMessage(e, t('app.orderPage.failed')))
  } finally {
    busy.value = false
  }
}

const reviseMessage = ref('')
const showRevise = ref(false)
async function respond(action: 'accept' | 'reject' | 'revise', reason = '') {
  if (!order.value || !inv.value) return
  const message = action === 'revise' ? reviseMessage.value.trim() : reason
  busy.value = true
  try {
    order.value = await respondQuotation(order.value.code, action, message)
    toast.success(t(action === 'accept' ? 'app.orderPage.accepted' : action === 'reject' ? 'app.orderPage.rejected' : 'app.orderPage.revisionSent'))
    showRevise.value = false
    reviseMessage.value = ''
    resetProof()
  } catch (e: any) {
    toast.error(cartErrorMessage(e, t('app.orderPage.failed')))
  } finally {
    busy.value = false
  }
}

// Midtrans sends the customer back here with ?transaction_status=...; the webhook may land a moment later
const returnedFromGateway = computed(() => ['settlement', 'capture', 'pending'].includes(String(route.query.transaction_status || '')))
const paying = ref(false)
async function payOnline() {
  if (!order.value || !targetDoc.value) return
  paying.value = true
  try {
    const page = await startOnlinePayment(order.value.code, targetDoc.value.id)
    if (new URL(page.redirect_url).protocol !== 'https:') throw new Error(t('app.orderPage.onlineFailed'))
    window.location.href = page.redirect_url
  } catch (e: any) {
    toast.error(cartErrorMessage(e, t('app.orderPage.onlineFailed')))
    paying.value = false
  }
}
async function refreshStatus() {
  busy.value = true
  try {
    await load()
  } finally {
    busy.value = false
  }
}

async function cancel() {
  if (!order.value) return
  busy.value = true
  try {
    order.value = await cancelMyOrder(order.value.code)
    toast.success(t('app.orderPage.cancelled'))
  } catch (e: any) {
    toast.error(cartErrorMessage(e, t('app.orderPage.failed')))
  } finally {
    busy.value = false
  }
}

// phones keep a pay bar at the bottom while something is payable and the payment card is off screen
const canPay = computed(() => !!(order.value?.can_submit_payment && inv.value && targetDoc.value))
const payCard = ref<HTMLElement | null>(null)
const payCardVisible = useElementVisibility(payCard)
const showPayBar = computed(() => canPay.value && !payCardVisible.value)
useHead(() => ({
  title: t('app.orderPage.metaTitle', {code: order.value?.code || ''}),
  meta: [{name: 'robots', content: 'noindex'}],
  // lifts the chat bubble above the pay bar
  htmlAttrs: {class: showPayBar.value ? 'has-bottom-bar' : ''},
}))
// the card flashes briefly so the eye lands on it after the scroll
const payCardFlash = ref(false)
function goToPayment() {
  payCard.value?.scrollIntoView({behavior: 'smooth', block: 'start'})
  payCardFlash.value = true
  setTimeout(() => { payCardFlash.value = false }, 1600)
}

// documents newest first; only the latest shows until the customer asks for more
const DOCS_STEP = 3
const docsShown = ref(1)
const sortedDocs = computed(() => [...(order.value?.documents || [])].sort((a, b) => b.id - a.id))
const visibleDocs = computed(() => sortedDocs.value.slice(0, docsShown.value))
const docsHidden = computed(() => Math.max(0, sortedDocs.value.length - docsShown.value))

// the first invoice the customer picked becomes payable right away
function onPlanChosen(updated: Order) {
  order.value = updated
  resetProof()
}

const timeline = ref<{ resetReview: () => void } | null>(null)
async function answerProgress(progressId: number, approve: boolean, note: string) {
  if (!order.value) return
  busy.value = true
  try {
    const stage = order.value.production_stage
    order.value = await reviewProgress(order.value.code, progressId, approve, note)
    timeline.value?.resetReview()
    toast.success(t(approve ? `app.production.approvedToast.${stage}` : 'app.production.revisionToast'))
  } catch (e: any) {
    toast.error(cartErrorMessage(e, t('app.orderPage.failed')))
  } finally {
    busy.value = false
  }
}

// once a deal is sent its items and prices replace the requested ones (utils/order-items.utils)
const {getPublicInvoice} = useInvoiceService()
const deal = computed(() => currentDeal(order.value))
const dealItems = ref<InvoiceItem[] | null>(null)
watch(() => deal.value?.public_token, async (token) => {
  dealItems.value = null
  if (!token) return
  try {
    dealItems.value = (await getPublicInvoice(token))?.items || null
  } catch {
    // the requested items stay on screen
  }
}, {immediate: true})

const itemRows = computed(() => !order.value ? []
  : dealItems.value?.length ? rowsFromDeal(order.value, dealItems.value)
  : rowsFromOrder(order.value, name => `${t('app.cartPage.branding')} ${name}`))
const itemsTotal = computed(() => rowsTotal(itemRows.value))

// accepting, declining and cancelling are final, so each asks first in a dialog
// the action outlives the open flag so the copy does not change while the dialog fades out
const confirming = ref<'accept' | 'reject' | 'cancel' | 'resubmit'>('accept')
const confirmOpen = ref(false)
const rejectReason = ref('')
const confirmCopy = computed(() => {
  const number = inv.value?.number || ''
  switch (confirming.value) {
    case 'accept':
      return {icon: CheckCircle2, tone: 'primary' as const, title: t('app.orderPage.acceptConfirmTitle', {number}), text: t('app.orderPage.acceptConfirmText'), action: t('app.orderPage.accept')}
    case 'reject':
      return {icon: XCircle, tone: 'danger' as const, title: t('app.orderPage.rejectConfirmTitle', {number}), text: t('app.orderPage.rejectConfirmText'), action: t('app.orderPage.reject')}
    case 'resubmit': {
      const last = earlierProofs.value[earlierProofs.value.length - 1]
      return {
        icon: AlertCircle, tone: 'primary' as const, title: t('app.orderPage.resubmitTitle'), action: t('app.orderPage.resubmitAction'),
        text: t('app.orderPage.resubmitText', {
          number: targetDoc.value?.number || '', amount: formatIDR(last?.amount || 0), date: last ? formatInvoiceDate(last.paid_on) : '',
          status: last ? t(`app.orderPage.paymentStatus.${last.status}`).toLowerCase() : '',
        }),
      }
    }
    default:
      return {icon: Ban, tone: 'danger' as const, title: t('app.orderPage.cancelConfirmTitle'), text: t('app.orderPage.cancelConfirmText'), action: t('app.orderPage.cancel')}
  }
})
// proofs already sent for the document being paid that still count (waiting or verified)
const earlierProofs = computed(() => (targetDoc.value?.payments || []).filter(p => p.status === 'pending' || p.status === 'verified'))
// a second proof for the same bill is usually a duplicate, so it asks first
function submitProof() {
  if (earlierProofs.value.length) askConfirm('resubmit')
  else sendProof()
}

// a proof opens in a popup: pictures inline, PDFs embedded with a link to open them
const viewingProof = ref<{url: string; name: string; pdf: boolean} | null>(null)
function showProof(path: string) {
  const name = path.split('/').pop() || ''
  viewingProof.value = {url: storageUrl(path), name, pdf: /\.pdf$/i.test(name)}
}

function askConfirm(action: 'accept' | 'reject' | 'cancel' | 'resubmit') {
  confirming.value = action
  rejectReason.value = ''
  confirmOpen.value = true
}
async function runConfirmed() {
  if (confirming.value === 'cancel') await cancel()
  else if (confirming.value === 'resubmit') await sendProof()
  else await respond(confirming.value, rejectReason.value.trim())
  confirmOpen.value = false
}

const eventLabel = (action: string) => te(`app.orderStatus.${action}`) ? t(`app.orderStatus.${action}`) : action.replaceAll('_', ' ')
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-green-50 via-white to-white">
    <div class="app-container px-4 md:px-6 pt-28" :class="showPayBar ? 'pb-32 lg:pb-16' : 'pb-16'">
      <NuxtLink to="/profile/order-histories" class="mb-4 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-green-700">
        <ArrowLeft class="size-4"/> {{ $t('app.orderPage.back') }}
      </NuxtLink>

      <p v-if="loading" class="py-10 text-center text-slate-500">{{ $t('app.orderPage.loading') }}</p>
      <p v-else-if="notFound || !order" class="py-10 text-center text-slate-600">{{ $t('app.orderPage.notFound') }}</p>

      <div v-else class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div class="space-y-6">
          <header class="rounded-xl border bg-white p-5 shadow-sm">
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="text-2xl font-bold text-slate-900">{{ order.code }}</h1>
              <Badge :class="statusClass">{{ $t(`app.orderStatus.${order.status}`) }}</Badge>
            </div>
            <p class="mt-1 text-sm text-slate-500">{{ $t('app.orderPage.placedAt', {date: formatWhen(order.created_at)}) }}</p>
            <p v-if="order.status === 'awaiting_shipping_fee'" class="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-800">{{ $t('app.orderPage.awaitingShippingInfo') }}</p>
            <p v-if="order.status === 'pending_payment' && order.expires_at" class="mt-3 rounded-md bg-sky-50 p-3 text-sm text-sky-800">{{ $t('app.orderPage.payBefore', {date: formatWhen(order.expires_at)}) }}</p>
            <div v-if="returnedFromGateway && order.can_submit_payment" class="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md bg-green-50 p-3 text-sm text-green-800">
              <span>{{ $t('app.orderPage.onlineReturned') }}</span>
              <Button size="sm" variant="outline" :disabled="busy" @click="refreshStatus">{{ $t('app.orderPage.refreshStatus') }}</Button>
            </div>
            <p v-if="order.status === 'requested'" class="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-800">{{ $t('app.orderPage.requestedInfo') }}</p>
            <p v-if="order.status === 'revision_requested'" class="mt-3 rounded-md bg-orange-50 p-3 text-sm text-orange-800">{{ $t('app.orderPage.revisionInfo') }}</p>
            <p v-if="order.status === 'accepted' && !order.payable_documents.length && !order.payment_options" class="mt-3 rounded-md bg-teal-50 p-3 text-sm text-teal-800">{{ $t('app.orderPage.acceptedInfo') }}</p>
            <p v-if="order.cancel_reason" class="mt-3 text-sm text-slate-600">{{ order.cancel_reason }}</p>
            <a v-if="order.design_file_path" :href="storageUrl(order.design_file_path)" target="_blank" rel="noopener" class="mt-2 inline-block text-sm text-green-700 hover:underline">
              {{ $t('app.orderPage.designFile') }}: {{ order.design_file_name }}
            </a>
          </header>

          <section v-if="isQuote && inv && order.can_respond_quotation" class="rounded-xl border-2 border-green-600 bg-white p-5 shadow-sm">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 class="font-semibold">{{ $t('app.orderPage.quotation') }} {{ inv.number }}</h2>
                <p class="text-sm text-slate-500">{{ $t('app.orderPage.validUntil', {date: formatInvoiceDate(inv.due_date)}) }}</p>
              </div>
              <p class="text-xl font-bold">{{ formatIDR(inv.total) }}</p>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" as="a" :href="invoiceUrl" target="_blank" rel="noopener"><ExternalLink class="size-4"/> {{ $t('app.orderPage.viewInvoice') }}</Button>
              <Button variant="outline" size="sm" as="a" :href="pdfUrl"><FileDown class="size-4"/> {{ $t('app.orderPage.downloadPdf') }}</Button>
            </div>
            <div class="mt-4 flex flex-wrap gap-2 border-t pt-4">
              <Button class="bg-green-600 hover:bg-green-700" :disabled="busy" @click="askConfirm('accept')">{{ $t('app.orderPage.accept') }}</Button>
              <Button variant="outline" :disabled="busy" @click="showRevise = !showRevise">{{ $t('app.orderPage.revise') }}</Button>
              <Button variant="outline" class="text-red-600" :disabled="busy" @click="askConfirm('reject')">{{ $t('app.orderPage.reject') }}</Button>
            </div>
            <form v-if="showRevise" class="mt-3 space-y-2" @submit.prevent="respond('revise')">
              <Label for="revise-msg">{{ $t('app.orderPage.reviseMessage') }}</Label>
              <textarea id="revise-msg" v-model="reviseMessage" rows="3" maxlength="1000" class="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-green-600"></textarea>
              <Button type="submit" size="sm" :disabled="busy || !reviseMessage.trim()">{{ $t('app.orderPage.send') }}</Button>
            </form>
          </section>

          <ElementsPaymentPlanCard v-if="order.payment_options" :order="order" @chosen="onPlanChosen" />

          <ElementsOrderProgressTimeline
            v-if="isQuote && order.production_stage"
            ref="timeline"
            :order="order"
            viewer="customer"
            :busy="busy"
            @review="answerProgress"
          />

          <section v-if="isQuote && order.documents.length" class="rounded-xl border bg-white p-5 text-sm shadow-sm">
            <h2 class="mb-2 font-semibold">{{ $t('app.orderPage.documents') }}</h2>
            <ul class="divide-y">
              <li v-for="d in visibleDocs" :key="d.id" class="flex flex-wrap items-center justify-between gap-2 py-2">
                <div>
                  <p class="font-medium">{{ $t(`app.orderPage.docTypes.${d.type}`) }} {{ d.number }}</p>
                  <p class="text-xs text-slate-500">{{ formatInvoiceDate(d.issue_date) }} · {{ formatIDR(d.amount_due) }}<template v-if="d.paid_amount"> · {{ $t('app.orderPage.paid') }} {{ formatIDR(d.paid_amount) }}</template></p>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-xs text-slate-600">{{ d.status }}</span>
                  <a v-if="d.public_token" :href="docUrl(d.public_token)" target="_blank" rel="noopener" class="text-green-700 hover:underline">{{ $t('app.orderPage.viewInvoice') }}</a>
                  <a v-if="d.public_token" :href="docPdf(d.public_token)" class="text-green-700 hover:underline">PDF</a>
                </div>
              </li>
            </ul>
            <button
              v-if="docsHidden"
              type="button"
              class="mt-1 w-full rounded-md border border-dashed py-2 text-sm font-medium text-green-700 hover:bg-green-50"
              @click="docsShown += DOCS_STEP"
            >
              {{ $t('app.orderPage.moreDocuments', {count: docsHidden}) }}
            </button>
            <button v-else-if="docsShown > 1" type="button" class="mt-1 w-full py-1 text-xs text-slate-500 hover:text-slate-700" @click="docsShown = 1">
              {{ $t('app.orderPage.fewerDocuments') }}
            </button>
          </section>

          <section class="rounded-xl border bg-white p-5 shadow-sm">
            <div class="mb-1 flex items-baseline justify-between gap-3">
              <h2 class="font-semibold">{{ $t('app.orderPage.items') }}</h2>
              <p class="text-base font-bold text-slate-900">{{ formatIDR(itemsTotal) }}</p>
            </div>
            <p v-if="dealItems?.length && deal" class="text-xs text-teal-700">{{ $t('app.orderPage.dealPrices', {number: deal.number}) }}</p>
            <ul class="mt-2 divide-y">
              <li v-for="row in itemRows" :key="row.key" class="flex gap-3 py-3">
                <NuxtLink v-if="row.slug" :to="`/product/${row.slug}`" class="shrink-0">
                  <img :src="imageSrc(row.image)" :alt="row.name" class="size-16 rounded-lg bg-gray-100 object-cover" onerror="this.src='/images/no-image.jpg'"/>
                </NuxtLink>
                <div class="min-w-0 flex-1 text-sm">
                  <p class="font-medium">{{ row.name }}</p>
                  <!-- one qty × price line for the product, then one per branding service -->
                  <div v-for="line in linesOf(row)" :key="line.key" class="mt-1 flex items-baseline justify-between gap-3">
                    <p class="min-w-0 text-slate-500">
                      <span v-if="line.label" class="text-slate-700">{{ line.label }} · </span><span class="whitespace-nowrap">{{ line.quantity }} × {{ formatIDR(line.unitPrice) }}</span>
                      <span v-if="line.discountBps" class="text-xs text-green-700"> −{{ line.discountBps / 100 }}%</span>
                    </p>
                    <p class="shrink-0 font-medium text-slate-900">{{ formatIDR(line.total) }}</p>
                  </div>
                  <p v-if="row.note" class="mt-1 text-xs text-slate-500">{{ row.note }}</p>
                </div>
              </li>
            </ul>
          </section>

          <section class="rounded-xl border bg-white p-5 text-sm shadow-sm">
            <h2 class="mb-2 font-semibold">{{ $t('app.orderPage.delivery') }}</h2>
            <template v-if="order.delivery_method === 'pickup'">
              <p>{{ $t('app.orderPage.pickup') }}</p>
            </template>
            <template v-else>
              <p class="font-medium">{{ order.shipping_name }} · {{ order.shipping_phone }}</p>
              <p class="whitespace-pre-line text-slate-600">{{ order.shipping_address }}</p>
              <p class="text-slate-600">{{ [order.shipping_city, order.shipping_postal_code].filter(Boolean).join(' ') }}</p>
              <p v-if="order.shipping_note" class="mt-2"><span class="text-slate-500">{{ $t('app.orderPage.shippingNote') }}:</span> {{ order.shipping_note }}</p>
            </template>
            <p v-if="order.tracking_number" class="mt-2"><span class="text-slate-500">{{ $t('app.orderPage.tracking') }}:</span> <span class="font-mono">{{ order.tracking_number }}</span></p>
          </section>

          <section v-if="order.events.length" class="rounded-xl border bg-white p-5 text-sm shadow-sm">
            <h2 class="mb-2 font-semibold">{{ $t('app.orderPage.history') }}</h2>
            <ul class="space-y-1">
              <li v-for="e in [...order.events].reverse()" :key="e.id" class="flex flex-wrap gap-x-2">
                <span class="text-slate-500">{{ formatWhen(e.created_at) }}</span>
                <span>{{ eventLabel(e.action) }}</span>
                <span v-if="e.note" class="text-slate-500">· {{ e.note }}</span>
              </li>
            </ul>
          </section>

          <ElementsDiscussionThread v-if="isQuote" subject-type="order" :subject-id="order.id" viewer="customer" />
        </div>

        <aside class="space-y-6 lg:self-stretch">
          <section class="rounded-xl border bg-white p-5 text-sm shadow-sm">
            <h2 class="mb-3 font-semibold">{{ $t('app.orderPage.summary') }}</h2>
            <dl v-if="inv" class="space-y-1.5">
              <div class="flex justify-between"><dt class="text-slate-600">{{ $t('app.orderPage.subtotal') }}</dt><dd>{{ formatIDR(inv.subtotal) }}</dd></div>
              <div v-if="inv.discount_total" class="flex justify-between text-green-700"><dt>{{ $t('app.orderPage.discount', {code: order.voucher_code}) }}</dt><dd>-{{ formatIDR(inv.discount_total) }}</dd></div>
              <div class="flex justify-between"><dt class="text-slate-600">{{ $t('app.orderPage.shipping') }}</dt><dd>{{ order.status === 'awaiting_shipping_fee' ? '—' : formatIDR(inv.shipping_fee) }}</dd></div>
              <div v-if="inv.tax_mode !== 'none'" class="flex justify-between"><dt class="text-slate-600">{{ $t('app.orderPage.tax', {rate: formatBps(inv.tax_rate_bps)}) }}</dt><dd>{{ formatIDR(inv.tax_total) }}</dd></div>
              <div class="flex justify-between border-t pt-2 text-base font-bold"><dt>{{ $t('app.orderPage.total') }}</dt><dd>{{ formatIDR(inv.total) }}</dd></div>
              <template v-if="inv.paid_amount">
                <div class="flex justify-between text-green-700"><dt>{{ $t('app.orderPage.paid') }}</dt><dd>{{ formatIDR(inv.paid_amount) }}</dd></div>
                <div class="flex justify-between font-semibold"><dt>{{ $t('app.orderPage.remaining') }}</dt><dd>{{ formatIDR(remaining) }}</dd></div>
              </template>
            </dl>
            <div v-if="invoiceUrl" class="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" as="a" :href="invoiceUrl" target="_blank" rel="noopener"><ExternalLink class="size-4"/> {{ $t('app.orderPage.viewInvoice') }}</Button>
              <Button variant="outline" size="sm" as="a" :href="pdfUrl"><FileDown class="size-4"/> {{ $t('app.orderPage.downloadPdf') }}</Button>
            </div>
          </section>

          <section v-if="allPayments.length" class="rounded-xl border bg-white p-5 text-sm shadow-sm">
            <h2 class="mb-2 font-semibold">{{ $t('app.orderPage.proofs') }}</h2>
            <ul class="divide-y">
              <li v-for="p in allPayments" :key="p.id" class="space-y-0.5 py-2.5">
                <div class="flex items-baseline justify-between gap-3">
                  <span class="font-medium text-slate-900">{{ formatIDR(p.amount) }} <span class="font-normal text-slate-500">· {{ formatInvoiceDate(p.paid_on) }}</span></span>
                  <span class="shrink-0 text-xs font-medium" :class="p.status === 'verified' ? 'text-green-700' : p.status === 'rejected' ? 'text-red-600' : 'text-amber-700'">{{ $t(`app.orderPage.paymentStatus.${p.status}`) }}</span>
                </div>
                <div class="flex items-baseline justify-between gap-3 text-xs">
                  <span class="truncate text-slate-500">{{ p.number }}</span>
                  <button v-if="p.proof_path" type="button" class="shrink-0 font-medium text-green-700 hover:underline" @click="showProof(p.proof_path)">{{ $t('app.orderPage.viewProof') }}</button>
                </div>
                <p v-if="p.reject_reason" class="text-xs text-red-600">{{ p.reject_reason }}</p>
              </li>
            </ul>
          </section>

          <Button v-if="order.can_cancel" variant="outline" class="w-full text-red-600" :disabled="busy" @click="askConfirm('cancel')">{{ $t('app.orderPage.cancel') }}</Button>
          <!-- from lg up the payment card follows the page down while the main column scrolls -->
          <div v-if="canPay" class="lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto lg:rounded-xl">
            <section id="payment-card" ref="payCard" class="scroll-mt-28 rounded-xl border bg-white p-5 text-sm shadow-sm transition-shadow duration-500" :class="payCardFlash && 'ring-2 ring-green-600'">
              <h2 class="mb-2 font-semibold">{{ $t('app.orderPage.payment') }}</h2>
              <label v-if="order.payable_documents.length > 1" class="mb-3 block space-y-1">
                <span class="text-slate-600">{{ $t('app.orderPage.payFor') }}</span>
                <select v-model="payTarget" class="h-9 w-full rounded-md border bg-white px-2" @change="proof.amount = remaining">
                  <option v-for="d in order.payable_documents" :key="d.id" :value="d.id">{{ d.number }} · {{ formatIDR(d.amount_due - d.paid_amount) }}</option>
                </select>
              </label>
              <div v-if="order.can_pay_online" class="mb-4 space-y-2 border-b pb-4">
                <Button class="h-11 w-full bg-green-600 hover:bg-green-700" :disabled="paying || busy" @click="payOnline">
                  <Loader2 v-if="paying" class="size-4 animate-spin"/> {{ $t('app.orderPage.payOnline', {amount: formatIDR(remaining)}) }}
                </Button>
                <p class="text-xs text-slate-500">{{ $t('app.orderPage.payOnlineHint') }}</p>
              </div>
              <p class="text-slate-600">{{ $t('app.orderPage.transferTo', {number: targetDoc.number}) }}</p>
              <ul class="mt-2 space-y-1">
                <li v-for="b in inv.bank_accounts" :key="b.number"><span class="font-medium">{{ b.bank }} {{ b.number }}</span> a.n. {{ b.name }}</li>
              </ul>
              <form class="mt-4 space-y-3 border-t pt-4" @submit.prevent="submitProof">
                <p class="font-medium">{{ $t('app.orderPage.uploadProof') }}</p>
                <div class="grid grid-cols-2 gap-3">
                  <div class="space-y-1">
                    <Label for="pf-amount">{{ $t('app.orderPage.amount') }}</Label>
                    <ElementsRupiahInput id="pf-amount" v-model="proof.amount"/>
                  </div>
                  <div class="space-y-1">
                    <Label for="pf-date">{{ $t('app.orderPage.paidOn') }}</Label>
                    <Input id="pf-date" v-model="proof.paid_on" type="date" :max="todayISO()"/>
                  </div>
                </div>
                <div class="space-y-1">
                  <Label for="pf-payer">{{ $t('app.orderPage.payer') }}</Label>
                  <Input id="pf-payer" v-model="proof.payer_name" maxlength="100"/>
                </div>
                <div class="space-y-1">
                  <Label for="pf-file">{{ $t('app.orderPage.proofLabel') }}</Label>
                  <ElementsFilePickField
                    id="pf-file"
                    :files="proof.file ? [proof.file] : []"
                    :label="$t('app.orderPage.proofChoose')"
                    :hint="$t('app.orderPage.proofHint')"
                    :disabled="busy"
                    @pick="pickProof"
                    @remove="proof.file = null"
                  />
                </div>
                <Button type="submit" class="w-full bg-green-600 hover:bg-green-700" :disabled="busy || !proof.file">
                  <Loader2 v-if="busy" class="size-4 animate-spin"/> {{ $t('app.orderPage.submit') }}
                </Button>
              </form>
            </section>
          </div>
        </aside>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-full opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="showPayBar && targetDoc"
        class="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden"
      >
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs text-slate-500">{{ $t('app.orderPage.payBarDue', {number: targetDoc.number}) }}</p>
          <p class="text-base font-bold text-slate-900">{{ formatIDR(remaining) }}</p>
        </div>
        <Button class="h-11 shrink-0 bg-green-600 px-6 hover:bg-green-700" @click="goToPayment">{{ $t('app.orderPage.payNow') }}</Button>
      </div>
    </Transition>

    <Dialog :open="!!viewingProof" @update:open="(open: boolean) => { if (!open) viewingProof = null }">
      <DialogContent class="max-w-[calc(100%-2rem)] gap-3 p-3 sm:max-w-2xl">
        <DialogTitle class="truncate pr-8 text-sm font-medium">{{ $t('app.orderPage.proofDialog') }}</DialogTitle>
        <DialogDescription class="truncate text-xs">{{ viewingProof?.name }}</DialogDescription>
        <template v-if="viewingProof">
          <iframe v-if="viewingProof.pdf" :src="viewingProof.url" :title="viewingProof.name" class="h-[70vh] w-full rounded-md border"/>
          <img v-else :src="viewingProof.url" :alt="viewingProof.name" class="mx-auto max-h-[75vh] w-auto max-w-full rounded-md object-contain">
          <a :href="viewingProof.url" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-xs font-medium text-green-700 hover:underline">
            <ExternalLink class="size-3.5"/> {{ $t('app.orderPage.openProof') }}
          </a>
        </template>
      </DialogContent>
    </Dialog>

    <ElementsConfirmDialog
      v-model:open="confirmOpen"
      :icon="confirmCopy.icon"
      :tone="confirmCopy.tone"
      :title="confirmCopy.title"
      :description="confirmCopy.text"
      :confirm-label="confirmCopy.action"
      :busy="busy"
      @confirm="runConfirmed"
    >
      <div v-if="confirming === 'reject'" class="mt-4 space-y-1.5 text-left">
        <Label for="reject-reason">{{ $t('app.orderPage.rejectMessage') }}</Label>
        <textarea
          id="reject-reason"
          v-model="rejectReason"
          rows="3"
          maxlength="1000"
          :placeholder="$t('app.orderPage.rejectPlaceholder')"
          class="w-full resize-none rounded-md border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-red-500"
        ></textarea>
      </div>
    </ElementsConfirmDialog>
  </div>
</template>
