<template>
  <div class="w-full min-h-[50vh] flex gap-4">
    <div class="flex-1">Form Login</div>
    <div class="relative bg-green-100 flex-1">
      <nuxt-img :src="`${$config.BASE_URL}/images/html/logo.png`" width="200"/>
      <div class="relative">Hello</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const config = useRuntimeConfig();
console.log("baseUrl " + config.BASE_URL)

const feature = ref();
</script>