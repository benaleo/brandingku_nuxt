<script setup>
// Import shadcn-vue components
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const pageTitle = 'Brandingku - Best Merchandise Supplier'

useHead({
  title: pageTitle,
})

definePageMeta({
  layout: 'default'
})
</script>

<template>
  <div class="min-h-screen bg-white">

    <!-- Hero Section -->
     <Hero/>

    <section class="app-container">
      <!-- Featured Categories -->
       <FeaturedCategories/>

      <!-- Featured Products -->
       <FeaturesProduct/>
      
    </section>

    <!-- Benefit FAQ -->

    <!-- Newsletter -->
    <BannerCTA />

  </div>
</template>
