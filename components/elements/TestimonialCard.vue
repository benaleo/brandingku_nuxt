<script setup lang="ts">
import type { Testimonial } from '~/types/testimonial.type'

// one quote with its author and stars, as shown on the landing page
defineProps<{ testimonial: Testimonial }>()
</script>

<template>
  <div class="relative flex h-full flex-col justify-between rounded-xl bg-white p-6 shadow-sm">
    <div class="absolute right-4 top-4 font-serif text-6xl text-green-200" aria-hidden="true">"</div>
    <p class="relative z-10 mb-6 line-clamp-6 text-gray-700">"{{ testimonial.content }}"</p>
    <div class="flex items-center">
      <span class="mr-4 flex size-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg font-semibold text-green-700" aria-hidden="true">
        {{ (testimonial.name || '?').charAt(0).toUpperCase() }}
      </span>
      <div class="min-w-0">
        <h4 class="truncate font-semibold text-gray-800">{{ testimonial.name }}</h4>
        <p class="truncate text-sm text-gray-600">{{ testimonial.job }}</p>
        <ElementsStarRating :model-value="testimonial.rating" class="mt-1" />
      </div>
    </div>
  </div>
</template>
