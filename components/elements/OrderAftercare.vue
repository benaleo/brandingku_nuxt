<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { FileText, Loader2, ShieldCheck, Star } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useAftercareService } from '~/services/aftercare.service'
import type { ClaimResolution, GuaranteeClaimFile, OrderAftercare, ReviewInput } from '~/types/aftercare.type'
import type { Testimonial, TestimonialPlacement } from '~/types/testimonial.type'

// After a completed order: the guarantee window with its claims, and the customer's reviews.
// The customer (token) gets the claim and review buttons; staff (orderId) see the same read-only.
const props = defineProps<{ viewer: 'customer' | 'staff'; code: string; token?: string; orderId?: number }>()

const { t } = useI18n()
const STORAGE_URL = useRuntimeConfig().public.STORAGE_URL
const service = useAftercareService()
const data = ref<OrderAftercare | null>(null)

const load = async () => {
  try {
    data.value = props.viewer === 'customer' ? await service.getMyAftercare(props.token!) : await service.getOrderAftercare(props.orderId!)
  } catch {
    // the section stays hidden; the rest of the order page still works
  }
}
onMounted(load)
// the parent remounts it with a new key when the order changes status
watch(() => [props.token, props.orderId], load)

const isCustomer = computed(() => props.viewer === 'customer')
const fileUrl = (path: string) => (path.startsWith('http') ? path : `${STORAGE_URL}${path}`)
const isImage = (f: GuaranteeClaimFile) => f.content_type.startsWith('image/')
const expired = computed(() => !!data.value?.guarantee_until && new Date(data.value.guarantee_until) <= new Date())
const STATUS_STYLE: Record<string, string> = {
  submitted: 'bg-amber-100 text-amber-800', approved: 'bg-sky-100 text-sky-800', rejected: 'bg-zinc-200 text-zinc-700', resolved: 'bg-green-100 text-green-800',
}
const viewing = ref<GuaranteeClaimFile | null>(null)

// --- guarantee claim
const claimOpen = ref(false)
const resolution = ref<ClaimResolution>('replace')
const reason = ref('')
const files = ref<File[]>([])
const busy = ref(false)
const REASON_MIN = 20
const pickFiles = (picked: File[]) => {
  const bad = picked.find(f => f.size > MAX_UPLOAD_BYTES || !isImageOrPdf(f))
  if (bad) toast.error(t(bad.size > MAX_UPLOAD_BYTES ? 'app.orderPage.fileTooLarge' : 'app.orderPage.fileType'))
  files.value = [...files.value, ...picked.filter(f => f.size <= MAX_UPLOAD_BYTES && isImageOrPdf(f))].slice(0, 5)
}
const canSubmitClaim = computed(() => reason.value.trim().length >= REASON_MIN && files.value.length > 0 && !busy.value)
const submitClaim = async () => {
  if (!canSubmitClaim.value) return
  busy.value = true
  try {
    const attachments = await Promise.all(files.value.map(async f => ({ file_name: f.name, content_type: f.type, content: await readFileAsDataURL(f) })))
    await service.claimGuarantee(props.code, { resolution: resolution.value, reason: reason.value.trim(), files: attachments })
    toast.success(t('app.aftercare.claimSent'))
    claimOpen.value = false
    reason.value = ''
    files.value = []
    await load()
  } catch (e: any) {
    toast.error(cartErrorMessage(e, t('app.aftercare.failed')))
  } finally {
    busy.value = false
  }
}

// --- reviews
const CONTENT_MIN = 50
const reviewKind = ref<TestimonialPlacement | null>(null)
const productId = ref<number | null>(null)
const rating = ref(5)
const content = ref('')
const consent = ref(false)
const unreviewed = computed(() => data.value?.products.filter(p => !p.testimonial) ?? [])
const myReviews = computed(() => [
  ...(data.value?.landing_testimonial ? [data.value.landing_testimonial] : []),
  ...(data.value?.products.flatMap(p => (p.testimonial ? [p.testimonial] : [])) ?? []),
])
const openReview = (kind: TestimonialPlacement) => {
  reviewKind.value = kind
  productId.value = kind === 'product' ? unreviewed.value[0]?.product_id ?? null : null
  rating.value = 5
  content.value = ''
  consent.value = false
}
const contentLength = computed(() => content.value.trim().length)
const canSubmitReview = computed(() => contentLength.value >= CONTENT_MIN && (reviewKind.value === 'landing_page' || !!productId.value) && !busy.value)
const submitReview = async () => {
  if (!canSubmitReview.value || !reviewKind.value) return
  busy.value = true
  try {
    const input: ReviewInput = { placement: reviewKind.value, product_id: productId.value, rating: rating.value, content: content.value.trim(), public_consent: consent.value }
    await service.submitReview(props.code, input)
    toast.success(t('app.aftercare.reviewSent'))
    reviewKind.value = null
    await load()
  } catch (e: any) {
    toast.error(cartErrorMessage(e, t('app.aftercare.failed')))
  } finally {
    busy.value = false
  }
}
const reviewState = (r: Testimonial) =>
  r.is_active ? t('app.aftercare.reviewPublished') : r.public_consent ? t('app.aftercare.reviewModeration') : t('app.aftercare.reviewPrivate')
</script>

<template>
  <section v-if="data && data.completed_at" class="space-y-5 rounded-xl border bg-white p-5 text-sm shadow-sm">
    <!-- guarantee -->
    <div v-if="data.guarantee_days > 0 || data.claims.length" class="space-y-3">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700"><ShieldCheck class="size-5" /></span>
          <div>
            <h2 class="font-semibold text-slate-900">{{ $t('app.aftercare.guaranteeTitle', { days: data.guarantee_days }) }}</h2>
            <p v-if="data.guarantee_until" class="text-xs" :class="expired ? 'text-slate-500' : 'text-green-700'">
              {{ $t(expired ? 'app.aftercare.guaranteeEnded' : 'app.aftercare.guaranteeUntil', { date: formatDateTime(data.guarantee_until) }) }}
            </p>
          </div>
        </div>
        <Button v-if="isCustomer && data.can_claim_guarantee" size="sm" variant="outline" class="border-green-600 text-green-700" @click="claimOpen = true">
          {{ $t('app.aftercare.claim') }}
        </Button>
      </div>

      <ul v-if="data.claims.length" class="space-y-2">
        <li v-for="c in data.claims" :key="c.id" class="rounded-lg border bg-slate-50 p-3">
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>{{ formatDateTime(c.created_at) }} · {{ $t(`app.aftercare.resolution.${c.resolution}`) }}</span>
            <span class="rounded-full px-2 py-0.5 font-medium" :class="STATUS_STYLE[c.status]">{{ $t(`app.aftercare.claimStatus.${c.status}`) }}</span>
          </div>
          <p class="mt-1 whitespace-pre-wrap break-words text-slate-700">{{ c.reason }}</p>
          <div v-if="c.files.length" class="mt-2 flex flex-wrap gap-2">
            <template v-for="f in c.files" :key="f.path">
              <button v-if="isImage(f)" type="button" class="size-16 overflow-hidden rounded-md border bg-white" :aria-label="$t('app.production.viewFile', { name: f.file_name })" @click="viewing = f">
                <img :src="fileUrl(f.path)" :alt="f.file_name" loading="lazy" class="size-full object-cover">
              </button>
              <a v-else :href="fileUrl(f.path)" target="_blank" rel="noopener" class="flex h-16 w-28 flex-col items-center justify-center gap-1 rounded-md border bg-white px-2 text-center text-xs text-slate-600">
                <FileText class="size-4" /><span class="w-full truncate">{{ f.file_name }}</span>
              </a>
            </template>
          </div>
          <p v-if="c.decision_note" class="mt-2 rounded-md bg-white p-2 text-xs text-slate-700">{{ $t('app.aftercare.decisionNote') }}: {{ c.decision_note }}</p>
          <p v-if="c.resolution_note" class="mt-2 rounded-md bg-green-50 p-2 text-xs text-green-800">{{ $t('app.aftercare.resolutionNote') }}: {{ c.resolution_note }}</p>
        </li>
      </ul>
      <NuxtLink v-if="!isCustomer && data.claims.length" to="/console/secret/guarantees" class="inline-block text-xs font-medium text-green-700 hover:underline">Proses di menu Klaim Garansi</NuxtLink>
    </div>

    <!-- reviews -->
    <div class="space-y-3" :class="(data.guarantee_days > 0 || data.claims.length) && 'border-t pt-5'">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="font-semibold text-slate-900">{{ $t('app.aftercare.reviewTitle') }}</h2>
          <p v-if="isCustomer && data.can_review" class="text-xs text-slate-500">{{ $t('app.aftercare.reviewHint') }}</p>
        </div>
        <div v-if="isCustomer && data.can_review" class="flex flex-wrap gap-2">
          <Button v-if="unreviewed.length" size="sm" variant="outline" @click="openReview('product')"><Star class="size-4" /> {{ $t('app.aftercare.reviewProduct') }}</Button>
          <Button v-if="!data.landing_testimonial" size="sm" class="bg-green-600 hover:bg-green-700" @click="openReview('landing_page')"><Star class="size-4" /> {{ $t('app.aftercare.reviewCompany') }}</Button>
        </div>
      </div>
      <ul v-if="myReviews.length" class="space-y-2">
        <li v-for="r in myReviews" :key="r.id" class="rounded-lg border bg-slate-50 p-3">
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span class="font-medium text-slate-800">{{ r.placement === 'landing_page' ? $t('app.aftercare.aboutCompany') : r.product_name }}</span>
            <span class="text-slate-500">{{ reviewState(r) }}</span>
          </div>
          <ElementsStarRating :model-value="r.rating" class="mt-1" />
          <p class="mt-1 whitespace-pre-wrap break-words text-slate-700">{{ r.content }}</p>
        </li>
      </ul>
      <p v-else-if="!isCustomer" class="text-xs text-slate-500">Belum ada ulasan.</p>
    </div>

    <!-- claim form -->
    <Dialog :open="claimOpen" @update:open="(v: boolean) => { if (!busy) claimOpen = v }">
      <DialogContent class="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogTitle>{{ $t('app.aftercare.claimTitle') }}</DialogTitle>
        <DialogDescription>{{ $t('app.aftercare.claimDescription', { date: data.guarantee_until ? formatDateTime(data.guarantee_until) : '' }) }}</DialogDescription>
        <form class="space-y-4" @submit.prevent="submitClaim">
          <fieldset class="space-y-2">
            <legend class="mb-1 text-sm font-medium">{{ $t('app.aftercare.claimWant') }}</legend>
            <div class="grid grid-cols-2 gap-2">
              <label v-for="opt in (['replace', 'refund'] as const)" :key="opt" class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2" :class="resolution === opt ? 'border-green-600 bg-green-50 font-medium' : 'hover:bg-slate-50'">
                <input v-model="resolution" type="radio" name="claim-resolution" :value="opt" class="accent-green-600">
                {{ $t(`app.aftercare.resolution.${opt}`) }}
              </label>
            </div>
          </fieldset>
          <div class="space-y-1">
            <label for="claim-reason" class="text-sm font-medium">{{ $t('app.aftercare.claimReason') }}</label>
            <textarea id="claim-reason" v-model="reason" rows="4" maxlength="2000" :placeholder="$t('app.aftercare.claimReasonPlaceholder')" class="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-green-600" />
            <p class="text-xs" :class="reason.trim().length >= REASON_MIN ? 'text-slate-500' : 'text-amber-700'">{{ $t('app.aftercare.minChars', { count: reason.trim().length, min: REASON_MIN }) }}</p>
          </div>
          <div class="space-y-1">
            <span class="text-sm font-medium">{{ $t('app.aftercare.claimEvidence') }}</span>
            <ElementsFilePickField
              id="claim-files"
              multiple
              :files="files"
              :label="$t('app.aftercare.claimEvidencePick')"
              :hint="$t('app.aftercare.claimEvidenceHint')"
              :disabled="busy || files.length >= 5"
              @pick="pickFiles"
              @remove="(i: number) => files.splice(i, 1)"
            />
          </div>
          <Button type="submit" class="w-full bg-green-600 hover:bg-green-700" :disabled="!canSubmitClaim">
            <Loader2 v-if="busy" class="size-4 animate-spin" />{{ $t('app.aftercare.claimSubmit') }}
          </Button>
        </form>
      </DialogContent>
    </Dialog>

    <!-- review form -->
    <Dialog :open="!!reviewKind" @update:open="(v: boolean) => { if (!v && !busy) reviewKind = null }">
      <DialogContent class="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogTitle>{{ reviewKind === 'landing_page' ? $t('app.aftercare.reviewCompanyTitle') : $t('app.aftercare.reviewProductTitle') }}</DialogTitle>
        <DialogDescription>{{ $t('app.aftercare.reviewDescription') }}</DialogDescription>
        <form class="space-y-4" @submit.prevent="submitReview">
          <fieldset v-if="reviewKind === 'product'" class="space-y-2">
            <legend class="mb-1 text-sm font-medium">{{ $t('app.aftercare.pickProduct') }}</legend>
            <label v-for="p in unreviewed" :key="p.product_id" class="flex cursor-pointer items-center gap-3 rounded-lg border p-2" :class="productId === p.product_id ? 'border-green-600 bg-green-50' : 'hover:bg-slate-50'">
              <input v-model="productId" type="radio" name="review-product" :value="p.product_id" class="accent-green-600">
              <img v-if="p.image" :src="fileUrl(p.image)" :alt="p.name" class="size-10 rounded object-cover">
              <span class="font-medium">{{ p.name }}</span>
            </label>
          </fieldset>
          <div class="space-y-1">
            <span class="block text-sm font-medium">{{ $t('app.aftercare.rating') }}</span>
            <ElementsStarRating v-model="rating" editable size="lg" :label="$t('app.aftercare.rating')" />
          </div>
          <div class="space-y-1">
            <label for="review-content" class="text-sm font-medium">{{ $t('app.aftercare.content') }}</label>
            <textarea id="review-content" v-model="content" rows="5" maxlength="2000" :placeholder="$t('app.aftercare.contentPlaceholder')" class="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-green-600" />
            <p class="text-xs" :class="contentLength >= CONTENT_MIN ? 'text-slate-500' : 'text-amber-700'">{{ $t('app.aftercare.minChars', { count: contentLength, min: CONTENT_MIN }) }}</p>
          </div>
          <label class="flex cursor-pointer items-start gap-2 rounded-lg bg-slate-50 p-3 text-sm">
            <input v-model="consent" type="checkbox" class="mt-0.5 size-4 accent-green-600">
            <span>{{ reviewKind === 'landing_page' ? $t('app.aftercare.consentCompany') : $t('app.aftercare.consentProduct') }}</span>
          </label>
          <Button type="submit" class="w-full bg-green-600 hover:bg-green-700" :disabled="!canSubmitReview">
            <Loader2 v-if="busy" class="size-4 animate-spin" />{{ $t('app.aftercare.reviewSubmit') }}
          </Button>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog :open="!!viewing" @update:open="(v: boolean) => { if (!v) viewing = null }">
      <DialogContent class="max-w-[calc(100%-2rem)] gap-3 p-3 sm:max-w-3xl">
        <DialogTitle class="truncate pr-8 text-sm font-medium">{{ viewing?.file_name }}</DialogTitle>
        <DialogDescription class="sr-only">{{ $t('app.aftercare.claimEvidence') }}</DialogDescription>
        <img v-if="viewing" :src="fileUrl(viewing.path)" :alt="viewing.file_name" class="mx-auto max-h-[75vh] w-auto max-w-full rounded-md object-contain">
      </DialogContent>
    </Dialog>
  </section>
</template>
