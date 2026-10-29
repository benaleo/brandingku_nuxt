<template>
  <!-- product cards while the list loads; same grid as the product list -->
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6" aria-hidden="true">
    <div v-for="i in count" :key="i" class="overflow-hidden rounded-2xl border bg-white">
      <Skeleton class="aspect-square rounded-none" />
      <div class="space-y-2 p-3 sm:p-4">
        <Skeleton class="h-3 w-1/2" />
        <Skeleton class="h-4 w-3/4" />
        <Skeleton class="h-4 w-1/3" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { count = 8 } = defineProps<{ count?: number }>()
</script>
