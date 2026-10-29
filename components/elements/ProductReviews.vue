<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAftercareService } from '~/services/aftercare.service'
import { useTestimonialService } from '~/services/testimonial.service'
import type { ReviewSummary } from '~/types/aftercare.type'

// the product's active testimonials, mostly customers' reviews; hidden while there are none
const props = defineProps<{ productId: number }>()

const { locale } = useI18n()
const { getProductReviewSummary } = useAftercareService()
const { datas: reviews, reFetch } = useTestimonialService({ is_active: true, placement: 'product', product_id: props.productId, limit: 12 })
const summary = ref<ReviewSummary | null>(null)

onMounted(async () => {
  try {
    const [, s] = await Promise.all([reFetch(), getProductReviewSummary(props.productId)])
    summary.value = s
  } catch {
    // no reviews section rather than an error on the product page
  }
})

</script>

<template>
  <section v-if="reviews.length && summary?.count" class="mt-10" aria-labelledby="product-reviews-title">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <h2 id="product-reviews-title" class="text-xl font-semibold text-slate-900">{{ $t('app.reviews.title') }}</h2>
      <div class="flex items-center gap-2 text-sm text-slate-600">
        <span class="text-2xl font-bold text-slate-900">{{ summary.average.toLocaleString(locale === 'en' ? 'en-US' : 'id-ID', { minimumFractionDigits: 1 }) }}</span>
        <ElementsStarRating :model-value="summary.average" size="md" />
        <span>{{ $t('app.reviews.count', { count: summary.count }) }}</span>
      </div>
    </div>
    <ul class="mt-4 grid gap-4 md:grid-cols-2">
      <li v-for="r in reviews" :key="r.id" class="rounded-xl border bg-white p-5 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-semibold text-slate-900">{{ r.name }}</p>
            <p v-if="r.job" class="text-xs text-slate-500">{{ r.job }}</p>
          </div>
          <span class="text-xs text-slate-400">{{ formatDay(r.created_at) }}</span>
        </div>
        <ElementsStarRating :model-value="r.rating" class="mt-2" />
        <p class="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">{{ r.content }}</p>
      </li>
    </ul>
  </section>
</template>
