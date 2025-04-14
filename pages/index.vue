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
     <ElementsHero/>
    <section class="relative bg-gray-50 py-16 md:py-24">
      <div class="container px-4 mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 class="text-4xl md:text-5xl font-bold tracking-tight mb-4">Modern Essentials for Everyday Life</h1>
            <p class="text-lg text-gray-600 mb-8">Discover our curated collection of high-quality products designed to
              simplify your daily routine.</p>
            <div class="flex flex-col sm:flex-row gap-4">
              <Button class="w-full sm:w-auto">Shop Now</Button>
              <Button variant="outline" class="w-full sm:w-auto">Learn More</Button>
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
      <section class="py-16 md:py-24">
        <div class="container px-4 mx-auto">
          <h2 class="text-2xl md:text-3xl font-bold mb-8 text-center">Shop by Category</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card v-for="category in categories" :key="category.id" class="hover:shadow-md transition-shadow">
              <CardContent class="p-4 flex flex-col items-center">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span class="text-2xl">{{ category.icon }}</span>
                </div>
                <h3 class="font-medium">{{ category.name }}</h3>
                <p class="text-sm text-gray-500 mt-1">{{ category.count }} items</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <!-- Featured Products -->
      <section class="py-16 md:py-24 bg-gray-50">
        <div class="container px-4">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-2xl md:text-3xl font-bold">Featured Products</h2>
            <Button variant="link" class="text-primary">View All</Button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <Card v-for="product in featuredProducts" :key="product.id" class="group">
              <CardHeader class="relative p-0">
                <img :src="product.image" :alt="product.name" class="w-full aspect-square object-cover rounded-t-lg"
                  loading="lazy" />
                <Badge v-if="product.isNew" variant="secondary" class="absolute top-2 left-2">New</Badge>
                <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" class="rounded-full bg-white shadow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
                      </path>
                    </svg>
                  </Button>
                </div>
              </CardHeader>
              <CardContent class="p-4">
                <h3 class="font-medium">{{ product.name }}</h3>
                <p class="text-sm text-gray-500 mt-1">{{ product.category }}</p>
                <div class="flex justify-between items-center mt-4">
                  <span class="font-bold">${{ product.price }}</span>
                  <Button variant="outline" size="sm">Add to Cart</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </section>

    <!-- Newsletter -->
    <ElementsBannerCTA />

    <!-- Footer -->
    <ElementsFooter />
  </div>
</template>

<script>
// Data would typically come from an API in a real app
const categories = [
  { id: 1, name: "Electronics", icon: "📱", count: 42 },
  { id: 2, name: "Home", icon: "🏠", count: 36 },
  { id: 3, name: "Fashion", icon: "👕", count: 58 },
  { id: 4, name: "Beauty", icon: "💄", count: 27 }
]

const featuredProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 129.99,
    image: "https://picsum.photos/400/400?random=2",
    isNew: true
  },
  {
    id: 2,
    name: "Organic Cotton T-Shirt",
    category: "Fashion",
    price: 29.99,
    image: "https://picsum.photos/400/400?random=3",
    isNew: false
  },
  {
    id: 3,
    name: "Ceramic Coffee Mug",
    category: "Home",
    price: 19.99,
    image: "https://picsum.photos/400/400?random=4",
    isNew: true
  },
  {
    id: 4,
    name: "Natural Face Cream",
    category: "Beauty",
    price: 24.99,
    image: "https://picsum.photos/400/400?random=5",
    isNew: false
  }
]

export default {
  data() {
    return {
      categories,
      featuredProducts
    }
  }
}
</script>