<script setup>
// Import shadcn-vue components
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'vue-router'

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 129.99,
    category: "Electronics",
    image: "https://picsum.photos/400/400?random=1",
    rating: 4.5,
    isNew: true
  },
  {
    id: 2,
    name: "Organic Cotton T-Shirt",
    price: 29.99,
    category: "Fashion",
    image: "https://picsum.photos/400/400?random=2",
    rating: 4.2,
    isNew: false
  },
  {
    id: 3,
    name: "Ceramic Coffee Mug",
    price: 19.99,
    category: "Home",
    image: "https://picsum.photos/400/400?random=3",
    rating: 4.7,
    isNew: true
  },
  {
    id: 4,
    name: "Natural Face Cream",
    price: 24.99,
    category: "Beauty",
    image: "https://picsum.photos/400/400?random=4",
    rating: 4.3,
    isNew: false
  },
  {
    id: 5,
    name: "Leather Wallet",
    price: 49.99,
    category: "Accessories",
    image: "https://picsum.photos/400/400?random=5",
    rating: 4.8,
    isNew: true
  },
  {
    id: 6,
    name: "Yoga Mat",
    price: 34.99,
    category: "Fitness",
    image: "https://picsum.photos/400/400?random=6",
    rating: 4.6,
    isNew: false
  },
  {
    id: 7,
    name: "Smart Watch",
    price: 199.99,
    category: "Electronics",
    image: "https://picsum.photos/400/400?random=7",
    rating: 4.4,
    isNew: true
  },
  {
    id: 8,
    name: "Wooden Desk Organizer",
    price: 39.99,
    category: "Office",
    image: "https://picsum.photos/400/400?random=8",
    rating: 4.9,
    isNew: false
  }
]

const sortOptions = [
  { value: "popular", label: "Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" }
]

const router = useRouter()

const viewProductDetail = (productId) => {
  router.push(`/product/${productId}`)
}

const selectedCategory = ref('All')

const filteredProducts = computed(() => {
  if (selectedCategory.value === 'All') {
    return products
  }
  return products.filter(product => product.category === selectedCategory.value)
})

</script>

<template>
  <!-- Header -->
  <ElementsHeaderProduct :title="'Brandingku Products'" />

  <!-- Content -->
  <main class="app-container my-12 flex gap-4">
    <div class="min-w-48 bg-slate-200 h-fit rounded-md py-4 px-2 mt-18 sticky top-30">
      <ul class="space-y-2">
        <li v-for="category in [...new Set(products.map(product => product.category))].sort()" :key="category" class="relative">
          <button
            class="block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-100"
            :class="{ 'bg-gray-100': selectedCategory === category }"
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
          <div :class="{ 'block': selectedCategory === category, 'hidden': selectedCategory !== category }" class="absolute right-0 top-1/2 -translate-y-1/2">
            <button
            class="block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-100"
            @click="selectedCategory = 'All'"
          >
            <Icon name="mdi:delete" class="mr-1 text-red-600" />
          </button>
          </div>
        </li>
        
      </ul>
    </div>
    
    <div class="">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <h1 class="text-3xl font-bold">Daftar Produk</h1>
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-500">Sort by:</span>
        <Select>
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Popular" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <Card v-for="product in filteredProducts" :key="product.id" class="group overflow-hidden">
        <div class="relative aspect-square overflow-hidden">
          <img :src="product.image" :alt="product.name"
            class="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" />
          <Badge v-if="product.isNew" variant="secondary" class="absolute top-2 left-2">
            New
          </Badge>
          <div
            class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button variant="outline"
              class="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all"
              @click="viewProductDetail(product.id)">
              Quick View
            </Button>
          </div>
        </div>
        <CardContent class="p-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-medium">{{ product.name }}</h3>
              <p class="text-sm text-gray-500">{{ product.category }}</p>
            </div>
            <div class="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="text-yellow-400">
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2">
                </polygon>
              </svg>
              <span class="text-sm">{{ product.rating }}</span>
            </div>
          </div>
          <div class="mt-4 flex justify-between items-center">
            <span class="font-bold">${{ product.price.toFixed(2) }}</span>
            <Button variant="outline" size="sm">Add to Cart</Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="mt-12 flex justify-center">
      <div class="flex gap-2">
        <Button variant="outline">1</Button>
        <Button variant="outline">2</Button>
        <Button variant="outline">3</Button>
        <Button variant="outline">Next</Button>
      </div>
    </div>
    </div>
  </main>

  <!-- footer -->
  <ElementsFooter />
</template>