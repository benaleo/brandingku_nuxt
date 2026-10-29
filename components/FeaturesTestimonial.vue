<script setup lang="ts">
import { ref } from 'vue'
import { useTestimonialService } from '~/services/testimonial.service'
import { useAftercareService } from '~/services/aftercare.service'
import type { ReviewSummary } from '~/types/aftercare.type'
import { useIntersectionObserver } from '~/composables/useIntersectionObserver'

// active landing page testimonials, customers' published reviews among them
const { datas: testimonials, loading, reFetch } = useTestimonialService({ is_active: true, placement: 'landing_page', limit: 6 })
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
      
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div 
          v-for="testimonial in testimonials"
          :key="testimonial.id"
          class="bg-white flex flex-col justify-between rounded-lg p-6 shadow-sm relative"
        >
          <div class="text-green-200 text-6xl absolute top-4 right-4 font-serif">"</div>
          <p class="text-gray-700 mb-6 relative z-10">
            "{{ testimonial.content }}"
          </p>
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
            <div>
              <h4 class="font-semibold text-gray-800">{{ testimonial.name }}</h4>
              <p class="text-sm text-gray-600">{{ testimonial.job }}</p>
              <ElementsStarRating :model-value="testimonial.rating" class="mt-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>