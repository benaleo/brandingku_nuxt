<script setup>
// Import shadcn-vue components
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <header class="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div class="container flex h-16 items-center justify-between px-4">
        <div class="flex items-center space-x-4">
          <h1 class="text-xl font-bold">Essentials</h1>
          <nav class="hidden md:flex items-center space-x-6">
            <a href="#" class="text-sm font-medium transition-colors hover:text-primary">Home</a>
            <a href="#" class="text-sm font-medium transition-colors hover:text-primary">Shop</a>
            <a href="#" class="text-sm font-medium transition-colors hover:text-primary">Blog</a>
            <a href="#" class="text-sm font-medium transition-colors hover:text-primary">About</a>
            <a href="#" class="text-sm font-medium transition-colors hover:text-primary">Contact</a>
          </nav>
        </div>
        <div class="flex items-center space-x-4">
          <button class="p-2 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <button class="p-2 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </button>
          <Button variant="outline" class="hidden md:inline-flex">Sign In</Button>
          <Button class="hidden md:inline-flex">Sign Up</Button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="relative bg-gray-50 py-16 md:py-24">
      <div class="container px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 class="text-4xl md:text-5xl font-bold tracking-tight mb-4">Modern Essentials for Everyday Life</h1>
            <p class="text-lg text-gray-600 mb-8">Discover our curated collection of high-quality products designed to simplify your daily routine.</p>
            <div class="flex flex-col sm:flex-row gap-4">
              <Button class="w-full sm:w-auto">Shop Now</Button>
              <Button variant="outline" class="w-full sm:w-auto">Learn More</Button>
            </div>
          </div>
          <div class="relative">
            <img 
              src="https://picsum.photos/800/600?random=1" 
              alt="Hero product image" 
              class="w-full rounded-lg shadow-lg"
              loading="lazy"
            />
            <Badge variant="secondary" class="absolute top-4 right-4">New Arrival</Badge>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Categories -->
    <section class="py-16 md:py-24">
      <div class="container px-4">
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
              <img 
                :src="product.image" 
                :alt="product.name" 
                class="w-full aspect-square object-cover rounded-t-lg"
                loading="lazy"
              />
              <Badge v-if="product.isNew" variant="secondary" class="absolute top-2 left-2">New</Badge>
              <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" class="rounded-full bg-white shadow">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
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

    <!-- Newsletter -->
    <section class="py-16 md:py-24 bg-primary text-white">
      <div class="container px-4">
        <div class="max-w-2xl mx-auto text-center">
          <h2 class="text-2xl md:text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p class="text-gray-200 mb-8">Get the latest updates on new products and upcoming sales</p>
          <div class="flex flex-col sm:flex-row gap-2">
            <Input type="email" placeholder="Your email address" class="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60" />
            <Button variant="secondary" class="w-full sm:w-auto">Subscribe</Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="container px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 class="text-lg font-bold mb-4">Essentials</h3>
            <p class="text-gray-400">Quality products for your everyday needs.</p>
          </div>
          <div>
            <h4 class="font-bold mb-4">Shop</h4>
            <ul class="space-y-2">
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">All Products</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Featured</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">New Arrivals</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Sale</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold mb-4">Company</h4>
            <ul class="space-y-2">
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold mb-4">Connect</h4>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div class="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2023 Essentials. All rights reserved.</p>
        </div>
      </div>
    </footer>
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