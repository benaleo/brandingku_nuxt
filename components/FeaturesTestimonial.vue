<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import { useElementSize } from '@vueuse/core'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '~/components/ui/carousel'
import { useTestimonialService } from '~/services/testimonial.service'
import { useAftercareService } from '~/services/aftercare.service'
import type { ReviewSummary } from '~/types/aftercare.type'
import { useIntersectionObserver } from '~/composables/useIntersectionObserver'

// active landing page testimonials, customers' published reviews among them
const { datas: testimonials, loading, reFetch } = useTestimonialService({ is_active: true, placement: 'landing_page', limit: 12 })
const { locale } = useI18n()
const { getTestimonialSummary } = useAftercareService()
const score = ref<ReviewSummary | null>(null)
const isInitialLoad = ref(true)
const shouldLoad = ref(false)

// Set up intersection observer to trigger data loading
const { target } = useIntersectionObserver(() => {
  shouldLoad.value = true
  loadTestimonials()
})

const loadTestimonials = async () => {
  if (!shouldLoad.value) return
  await Promise.all([
    reFetch(),
    getTestimonialSummary('landing_page').then(s => { score.value = s }).catch(() => {}),
  ])
  isInitialLoad.value = false
}

// the phone deck: the front card, with the next two peeking out below it
const front = ref(0)
const frontCard = ref<HTMLElement | null>(null)
const { height: frontHeight } = useElementSize(frontCard)
const PEEK = 18
const deckHeight = computed(() => Math.max(220, frontHeight.value) + PEEK * Math.min(2, testimonials.value.length - 1))
const deckStyle = (i: number) => {
  const n = testimonials.value.length
  const depth = (i - front.value + n) % n
  // cards behind the front one take its height, so only their bottom edges show
  const behind = depth ? { height: `${frontHeight.value}px`, overflow: 'hidden' } : {}
  if (depth > 2) return { ...behind, opacity: 0, transform: `translateY(${PEEK * 2}px) scale(0.9)`, zIndex: 0, pointerEvents: 'none' as const }
  return { ...behind, opacity: 1 - depth * 0.2, transform: `translateY(${depth * PEEK}px) scale(${1 - depth * 0.05})`, zIndex: 10 - depth, pointerEvents: depth ? 'none' as const : 'auto' as const }
}
const next = () => { front.value = (front.value + 1) % testimonials.value.length }
const prev = () => { front.value = (front.value - 1 + testimonials.value.length) % testimonials.value.length }
watch(() => testimonials.value.length, async () => { front.value = 0; await nextTick() })
let touchX = 0
const onTouchStart = (e: TouchEvent) => { touchX = e.touches[0]?.clientX ?? 0 }
const onTouchEnd = (e: TouchEvent) => {
  const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX
  if (Math.abs(dx) < 40) return
  if (dx < 0) next()
  else prev()
}
</script>

<template>
  <div ref="target" class="w-full px-4 py-12 bg-[#F2F4F7]">
    <div class="container max-w-6xl mx-auto py-12">
      <h2 class="text-3xl font-bold text-center text-gray-800" :class="score?.count ? 'mb-3' : 'mb-12'">{{ $t('app.testimonials.title') }}</h2>
      <!-- the overall score of the testimonials shown here -->
      <div v-if="score?.count" class="mb-12 flex flex-wrap items-center justify-center gap-2 text-gray-700">
        <span class="text-2xl font-bold tabular-nums">{{ score.average.toLocaleString(locale === 'en' ? 'en-US' : 'id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }}</span>
        <ElementsStarRating :model-value="score.average" size="md" />
        <span class="text-sm text-gray-500">{{ $t('app.testimonials.score', { count: score.count }) }}</span>
      </div>
      
      <div v-if="loading || isInitialLoad" class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Skeleton Card 1 -->
        <div class="bg-white rounded-lg p-6 shadow-sm relative">
          <div class="text-green-200 text-6xl absolute top-4 right-4 font-serif">"</div>
          <div class="space-y-3">
            <Skeleton class="h-4 w-full mb-6" />
            <Skeleton class="h-4 w-3/4" />
          </div>
          <div class="flex items-center mt-6">
            <Skeleton class="w-12 h-12 rounded-full mr-4" />
            <div class="space-y-2">
              <Skeleton class="h-4 w-24" />
              <Skeleton class="h-3 w-32" />
              <div class="flex mt-1">
                <Skeleton v-for="star in 5" :key="star" class="h-4 w-4 mr-1" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Skeleton Card 2 -->
        <div class="bg-white rounded-lg p-6 shadow-sm relative">
          <div class="text-green-200 text-6xl absolute top-4 right-4 font-serif">"</div>
          <div class="space-y-3">
            <Skeleton class="h-4 w-full mb-6" />
            <Skeleton class="h-4 w-2/3" />
          </div>
          <div class="flex items-center mt-6">
            <Skeleton class="w-12 h-12 rounded-full mr-4" />
            <div class="space-y-2">
              <Skeleton class="h-4 w-28" />
              <Skeleton class="h-3 w-36" />
              <div class="flex mt-1">
                <Skeleton v-for="star in 5" :key="star" class="h-4 w-4 mr-1" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Skeleton Card 3 -->
        <div class="bg-white rounded-lg p-6 shadow-sm relative">
          <div class="text-green-200 text-6xl absolute top-4 right-4 font-serif">"</div>
          <div class="space-y-3">
            <Skeleton class="h-4 w-full mb-6" />
            <Skeleton class="h-4 w-4/5" />
          </div>
          <div class="flex items-center mt-6">
            <Skeleton class="w-12 h-12 rounded-full mr-4" />
            <div class="space-y-2">
              <Skeleton class="h-4 w-20" />
              <Skeleton class="h-3 w-28" />
              <div class="flex mt-1">
                <Skeleton v-for="star in 5" :key="star" class="h-4 w-4 mr-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else-if="testimonials.length === 0" class="text-center py-8">
        <p class="text-gray-600">{{ $t('app.testimonials.empty') }}</p>
      </div>
      
      <template v-else>
        <!-- md and up: one row that slides -->
        <Carousel class="relative hidden md:block" :opts="{ align: 'start', loop: testimonials.length > 3 }">
          <CarouselContent class="-ml-6">
            <CarouselItem v-for="t in testimonials" :key="t.id" class="pl-6 md:basis-1/2 lg:basis-1/3">
              <ElementsTestimonialCard :testimonial="t" />
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious class="-left-4 bg-white shadow-md lg:-left-12" />
          <CarouselNext class="-right-4 bg-white shadow-md lg:-right-12" />
        </Carousel>

        <!-- phones: a stacked deck; the next button floats under the front card, a swipe works too -->
        <div class="md:hidden">
          <div
            class="relative mx-auto max-w-sm"
            :style="{ height: `${deckHeight}px` }"
            role="region"
            aria-roledescription="carousel"
            :aria-label="$t('app.testimonials.title')"
            @touchstart.passive="onTouchStart"
            @touchend="onTouchEnd"
          >
            <div
              v-for="(t, i) in testimonials"
              :key="t.id"
              :ref="(el) => { if (i === front) frontCard = el as HTMLElement | null }"
              class="absolute inset-x-0 top-0 transition-all duration-300 ease-out"
              :class="i !== front && '[&>div]:shadow-md [&>div]:ring-1 [&>div]:ring-black/5 [&>div>*]:invisible'"
              :style="deckStyle(i)"
              :aria-hidden="i !== front"
            >
              <ElementsTestimonialCard :testimonial="t" />
            </div>
          </div>
          <div class="relative z-20 -mt-10 flex flex-col items-center gap-2">
            <button
              v-if="testimonials.length > 1"
              type="button"
              class="flex size-12 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition hover:bg-green-700 active:scale-95"
              :aria-label="$t('app.testimonials.next')"
              @click="next"
            >
              <ArrowRight class="size-5" />
            </button>
            <p class="text-xs text-gray-500 tabular-nums">{{ front + 1 }} / {{ testimonials.length }}</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>