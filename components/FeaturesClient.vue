<script setup lang="ts">
import { computed, ref } from 'vue'
import { useClientService } from '~/services/client.service'
import { useIntersectionObserver } from '~/composables/useIntersectionObserver'

const { datas: clients, loading, reFetch } = useClientService()
const isInitialLoad = ref(true)
const shouldLoad = ref(false)

// Set up intersection observer to trigger data loading
const { target } = useIntersectionObserver(() => {
  shouldLoad.value = true
  loadClients()
})

const loadClients = async () => {
  if (!shouldLoad.value) return
  await reFetch()
  isInitialLoad.value = false
}

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
</script>

<template>
  <div ref="target" class="w-full px-4 py-12 md:py-16">
    <div class="container max-w-6xl mx-auto pb-8 md:pb-12">
      <h2 class="text-2xl md:text-3xl font-bold text-center">{{ $t('app.clients.title') }}</h2>
    </div>

    <div class="container max-w-6xl mx-auto overflow-hidden">
      <div class="relative">
        <!-- Skeleton Loading State -->
        <div v-if="loading || isInitialLoad" class="flex gap-6 md:gap-12">
          <div v-for="n in 6" :key="n" class="client-logo shrink-0">
            <Skeleton class="h-full w-full rounded-lg" />
          </div>
        </div>

        <!-- Actual Client Display -->
        <!-- fixed logo box per breakpoint: % widths inside the fit-content track resolve to the image's natural size -->
        <div v-else class="flex animate-scroll gap-6 md:gap-12">
          <div v-for="(client, i) in duplicatedClients" :key="`${client.id ?? client.name}-${i}`" class="client-logo shrink-0">
            <img :src="`${STORAGE_URL}${client.logo}`" :alt="client.name" class="h-full w-full object-contain">
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

.client-logo {
  width: 7rem;
  height: 3.5rem;
}
@media (min-width: 640px) {
  .client-logo { width: 9rem; height: 4.5rem; }
}
@media (min-width: 1024px) {
  .client-logo { width: 11rem; height: 5.5rem; }
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
