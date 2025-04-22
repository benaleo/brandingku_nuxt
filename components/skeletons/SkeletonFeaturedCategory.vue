<template>
  <div class="flex justify-center items-center gap-2">
    <div v-for="i in 5" :key="i" class="grid gap-2">
      <Skeleton class="w-[100px] h-[120px] rounded-md" />
      <Skeleton class="w-[100px] h-6 rounded-md" />
    </div>
  </div>
</template>
<script setup lang="ts">
</script>