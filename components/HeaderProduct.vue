<template>
  <div class="relative w-full h-[40vh] md:h-[50vh] bg-gradient-to-r from-green-800 to-green-200 overflow-hidden">
    <div class="absolute bottom-[-5px] md:bottom-[-50px] w-full">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#ffffff" fill-opacity="1" d="M0,192L48,170.7C96,149,192,107,288,112C384,117,480,171,576,170.7C672,171,768,117,864,128C960,139,1056,213,1152,240C1248,267,1344,245,1392,234.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
    </div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <p class="text-4xl font-bold text-white drop-shadow-lg mt-0 md:mt-[-80px]">{{ title !== null ? title : 'Header' }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">

const {title} = defineProps<{title: string}>()
</script>