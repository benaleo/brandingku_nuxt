<template>
  <div
    class="relative flex min-h-[18rem] w-full items-center justify-center overflow-hidden bg-gradient-to-r from-green-800 to-green-200 px-4 pb-20 pt-28 md:min-h-[24rem] md:pb-28 md:pt-32"
  >
    <component
      :is="tag"
      v-if="title"
      class="max-w-3xl text-center text-3xl font-bold leading-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl"
    >
      {{ title }}
    </component>
    <!-- the title is still loading -->
    <span v-else class="block h-9 w-2/3 max-w-md animate-pulse rounded-lg bg-white/30 sm:h-10 md:h-12" aria-hidden="true" />
    <!-- wave sits 1px below the edge so the gradient never peeks through -->
    <svg
      class="absolute inset-x-0 -bottom-px block h-16 w-full sm:h-20 md:h-28"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 100 1440 220"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path fill="#ffffff" fill-opacity="1" d="M0,192L48,170.7C96,149,192,107,288,112C384,117,480,171,576,170.7C672,171,768,117,864,128C960,139,1056,213,1152,240C1248,267,1344,245,1392,234.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
    </svg>
  </div>
</template>
<script setup lang="ts">

// pages with their own h1 keep the default p
const { title, tag = 'p' } = defineProps<{ title: string; tag?: 'h1' | 'p' }>()
</script>
