<template>
  <div class="flex justify-center items-center gap-2">
    <NuxtLink v-for="data in datas" :key="data.id" :href="data.url" class="opacity-60 hover:opacity-100 transition-opacity duration-1000 w-[100px] h-[100px] px-2 gap-2 flex justify-center items-center flex-col">
      <img class="w-[80%]" :src="data.src" :alt="data.name">
      <p class="">{{data.name}}</p>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const datas = [
  {
    "id": 1,
    "src": "/images/html/tumbler.png",
    "name": "tumbler",
    "url": "/products/tumbler"
  },
  {
    "id": 2,
    "src": "/images/html/powerbank.png",
    "name": "powerbank",
    "url": "/products/powerbank"
  },
  {
    "id": 3,
    "src": "/images/html/stationary.png",
    "name": "stationary",
    "url": "/products/stationary"
  },
]
</script>