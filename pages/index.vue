<script setup>
// Import shadcn-vue components
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
</script>

<template>
  <div class="min-h-screen bg-white">

    <!-- Hero Section -->
     <Hero/>
    <section class="relative bg-gray-50 py-16 md:py-24">
      <div class="container px-4 mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 class="text-4xl md:text-5xl font-bold tracking-tight mb-4">Eksklusif Tumbler Vivo 550ml</h1>
            <p class="text-lg text-gray-600 mb-8">Tumbler Vivo 550ml ini adalah tumbler yang ideal untuk Anda. Dengan desain yang unik dan kualitas yang luar biasa, tumbler ini akan menjadi pilihan yang tepat untuk Anda.</p>
            <div class="flex flex-col sm:flex-row gap-4">
              <Button class="w-full sm:w-auto">Beli Sekarang</Button>
              <Button variant="outline" class="w-full sm:w-auto">Lihat Detail</Button>
            </div>
          </div>
          <div class="relative">
            <img src="https://picsum.photos/800/600?random=1" alt="Hero product image"
              class="w-full rounded-lg shadow-lg" loading="lazy" />
            <Badge variant="secondary" class="absolute top-4 right-4">New Arrival</Badge>
          </div>
        </div>
      </div>
    </section>

    <section class="app-container">
      <!-- Featured Categories -->
       <FeaturedCategories/>

      <!-- Featured Products -->
       <FeaturesProduct/>
      
    </section>

    <!-- Newsletter -->
    <BannerCTA />

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>


</script>