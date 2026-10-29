<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Star } from 'lucide-vue-next'
import { useAftercareService } from '~/services/aftercare.service'
import { useTestimonialService } from '~/services/testimonial.service'
import type { ReviewSummary } from '~/types/aftercare.type'

// The product's score with its star breakdown and the five latest reviews (active
// testimonials), which a star filter narrows down. Hidden while the product has none.
const props = defineProps<{ productId: number }>()
const LATEST = 5

const { locale } = useI18n()
const { getTestimonialSummary } = useAftercareService()
const { datas: reviews, loading, reFetch, setParams } = useTestimonialService({ is_active: true, placement: 'product', product_id: props.productId, limit: LATEST })
const summary = ref<ReviewSummary | null>(null)
const stars = ref<number | null>(null)

onMounted(async () => {
  try {
    const [, s] = await Promise.all([reFetch(), getTestimonialSummary('product', props.productId)])
    summary.value = s
  } catch {
    // no reviews section rather than an error on the product page
  }
})
// the list refetches itself when its params change
const filter = (n: number | null) => {
  stars.value = stars.value === n ? null : n
  setParams({ stars: stars.value ?? undefined })
}

const numberLocale = computed(() => (locale.value === 'en' ? 'en-US' : 'id-ID'))
const average = computed(() => summary.value?.average.toLocaleString(numberLocale.value, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) ?? '')
const share = (count: number) => (summary.value?.count ? (count / summary.value.count) * 100 : 0)
</script>

<template>
  <section v-if="summary?.count" class="mt-10" aria-labelledby="product-reviews-title">
    <h2 id="product-reviews-title" class="text-xl font-semibold text-slate-900">{{ $t('app.reviews.title') }}</h2>
    <div class="mt-4 grid gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
      <!-- score and breakdown; each star row filters the list -->
      <div class="h-fit rounded-xl border bg-white p-5 shadow-sm">
        <div class="flex items-end gap-3">
          <span class="text-4xl font-bold leading-none text-slate-900 tabular-nums">{{ average }}</span>
          <span class="pb-1 text-sm text-slate-500">/ 5</span>
        </div>
        <ElementsStarRating :model-value="summary.average" size="md" class="mt-2" />
        <p class="mt-1 text-sm text-slate-600">{{ $t('app.reviews.count', { count: summary.count }) }}</p>
        <ul class="mt-4 space-y-1.5">
          <li v-for="d in summary.distribution" :key="d.stars">
            <button
              type="button"
              class="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-sm transition"
              :class="stars === d.stars ? 'bg-green-50 ring-1 ring-green-600' : 'hover:bg-slate-50'"
              :aria-pressed="stars === d.stars"
              :disabled="!d.count"
              @click="filter(d.stars)"
            >
              <span class="flex w-8 shrink-0 items-center gap-0.5 font-medium text-slate-700 tabular-nums">
                {{ d.stars }}<Star class="size-3.5 fill-amber-400 text-amber-400" />
              </span>
              <span class="h-2 flex-1 rounded-full bg-slate-100">
                <span class="block h-2 rounded-full bg-amber-400" :style="{ width: `${share(d.count)}%` }" />
              </span>
              <span class="w-6 shrink-0 text-right text-xs text-slate-500 tabular-nums">{{ d.count }}</span>
            </button>
          </li>
        </ul>
      </div>

      <div>
        <div class="flex flex-wrap items-center gap-2" role="group" :aria-label="$t('app.reviews.filterLabel')">
          <button
            type="button"
            class="rounded-full border px-3 py-1 text-sm"
            :class="stars === null ? 'border-green-600 bg-green-600 text-white' : 'hover:bg-slate-50'"
            :aria-pressed="stars === null"
            @click="filter(null)"
          >{{ $t('app.reviews.filterAll') }}</button>
          <button
            v-for="n in [5, 4, 3, 2, 1]"
            :key="n"
            type="button"
            class="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm"
            :class="stars === n ? 'border-green-600 bg-green-600 text-white' : 'hover:bg-slate-50'"
            :aria-pressed="stars === n"
            @click="filter(n)"
          >
            {{ n }}<Star class="size-3.5" :class="stars === n ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'" />
          </button>
        </div>
        <p class="mt-3 text-xs text-slate-500">{{ $t('app.reviews.latest', { count: LATEST }) }}</p>

        <p v-if="!loading && !reviews.length" class="mt-3 rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">
          {{ $t('app.reviews.emptyFilter', { stars }) }}
        </p>
        <ul v-else class="mt-3 space-y-3" :class="loading && 'opacity-60'">
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
      </div>
    </div>
  </section>
</template>
