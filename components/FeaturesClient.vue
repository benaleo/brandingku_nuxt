<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useClientService } from '~/services/client.service'

const { datas: clients, loading, reFetch } = useClientService()

// Get only active clients for display
const activeClients = computed(() => clients.value.filter(client => client.is_active))

// Duplicate clients for seamless infinite loop
const duplicatedClients = computed(() => {
  const active = activeClients.value
  if (active.length === 0) return []
  
  // Calculate how many duplicates needed for seamless loop
  // We need enough items to fill the container width twice
  const minItemsForSeamlessLoop = 24 // Double the amount for smooth looping
  
  // Calculate how many times we need to duplicate the array
  const timesToDuplicate = Math.ceil(minItemsForSeamlessLoop / active.length)
  
  // Create array with enough duplicates
  const result = []
  for (let i = 0; i < timesToDuplicate; i++) {
    result.push(...active)
  }
  
  return result
})

const config = useRuntimeConfig();
const STORAGE_URL = config.public.STORAGE_URL;

// Fetch clients on component mount
onMounted(() => {
  reFetch()
})
</script>

<template>
  <div class="w-full px-4 py-12 bg-[#F2F4F7]">
    <div class="container max-w-6xl mx-auto py-12">
      <h2 class="text-2xl md:text-3xl font-bold text-center">Partner Kami</h2>
    </div>

    <div class="container max-w-6xl mx-auto py-12 overflow-hidden">
      <div class="relative">
        <div class="flex animate-scroll gap-12">
          <div v-for="client in duplicatedClients" :key="`${client.name}-${duplicatedClients.indexOf(client)}`" class="flex-shrink-0 w-1/4 md:w-1/5 lg:w-1/6 px-3">
            <img :src="`${STORAGE_URL}${client.logo}`" :alt="client.name" class="w-full h-16 md:h-20 lg:h-24 object-contain">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-scroll {
  animation: scroll 40s linear infinite;
  width: fit-content;
}

/* Ensure no jump at the end of animation */
.animate-scroll:hover {
  animation-play-state: paused;
}
</style>
