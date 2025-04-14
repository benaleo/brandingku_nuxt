// product detail
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

const route = useRoute()
const loading = ref(true)
const error = ref(null)
const product = ref(null)

// Sample product data - would normally come from API
const mockProducts = {
  '1': {
    id: 1,
    name: "Wireless Headphones",
    price: 129.99,
    originalPrice: 149.99,
    category: "Electronics",
    description: "Premium wireless headphones with noise cancellation and 30-hour battery life.",
    features: [
      "Active Noise Cancellation",
      "30-hour battery life",
      "Bluetooth 5.0",
      "Built-in microphone",
      "Foldable design",
      "Comfortable ear cushions"
    ],
    details: "Material: Plastic, Metal | Dimensions: 7.5 x 6.7 x 3.2 inches | Weight: 0.55 lbs | Warranty: 1 year",
    images: [
      "https://picsum.photos/800/800?random=1",
      "https://picsum.photos/800/800?random=11",
      "https://picsum.photos/800/800?random=12",
      "https://picsum.photos/800/800?random=13"
    ],
    rating: 4.5,
    reviews: 86,
    isNew: true,
    colors: ["Black", "White", "Blue"],
    sizes: ["One Size"],
    inStock: true
  },
  '2': {
    id: 2,
    name: "Organic Cotton T-Shirt",
    price: 29.99,
    originalPrice: 39.99,
    category: "Fashion",
    description: "Comfortable organic cotton t-shirt made from 100% certified organic materials.",
    features: [
      "100% organic cotton",
      "Breathable fabric",
      "Classic fit",
      "Reinforced stitching",
      "Machine washable",
      "Available in multiple colors"
    ],
    details: "Material: 100% Organic Cotton | Care: Machine wash cold | Origin: USA",
    images: [
      "https://picsum.photos/800/800?random=2",
      "https://picsum.photos/800/800?random=21",
      "https://picsum.photos/800/800?random=22",
      "https://picsum.photos/800/800?random=23",
      "https://picsum.photos/800/800?random=24",
      "https://picsum.photos/800/800?random=25"
    ],
    rating: 4.2,
    reviews: 45,
    isNew: false,
    colors: ["White", "Black", "Gray", "Navy"],
    sizes: ["S", "M", "L", "XL"],
    inStock: true
  },
  // Add similar entries for all 8 products
}

onMounted(async () => {
  try {
    const productId = route.params.id
    product.value = mockProducts[productId]
    if (!product.value) {
      error.value = 'Product not found'
    } else {
      selectedImage.value = product.value.images[0]
      if (product.value.colors && product.value.colors.length > 0) {
        selectedColor.value = product.value.colors[0]
      }
      if (product.value.sizes && product.value.sizes.length > 0) {
        selectedSize.value = product.value.sizes[0]
      }
    }
  } catch (err) {
    error.value = 'Failed to load product'
    console.error('Error loading product:', err)
  } finally {
    loading.value = false
  }
})

const relatedProducts = [
  { id: 2, name: "Organic Cotton T-Shirt", price: 29.99, image: "https://picsum.photos/400/400?random=2", rating: 4.2 },
  { id: 3, name: "Ceramic Coffee Mug", price: 19.99, image: "https://picsum.photos/400/400?random=3", rating: 4.7 },
  { id: 4, name: "Natural Face Cream", price: 24.99, image: "https://picsum.photos/400/400?random=4", rating: 4.3 }
]

// State
const selectedImage = ref('')
const selectedColor = ref('')
const selectedSize = ref('')
const quantity = ref(1)
const activeTab = ref('description')

const incrementQuantity = () => quantity.value++
const decrementQuantity = () => quantity.value > 1 && quantity.value--
</script>

<template>
  <ElementsHeaderProduct :title="product ? product.name : 'Product'" />
  <div v-if="loading" class="container px-4 py-8 md:py-12 flex justify-center">
    <p>Loading...</p>
  </div>

  <div v-else-if="error" class="container px-4 py-8 md:py-12 flex justify-center">
    <p class="text-red-500">{{ error }}</p>
  </div>

  <div v-else class="app-container">
    <!-- Breadcrumb -->
    <div class="text-sm text-gray-500 mb-6">
      <span class="hover:text-primary cursor-pointer">Home</span> /
      <span class="hover:text-primary cursor-pointer">Shop</span> /
      <span class="hover:text-primary cursor-pointer">{{ product.category }}</span> /
      <span class="text-primary">{{ product.name }}</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <!-- Product Gallery -->
      <div>
        <AtomsProductThumbnail :images="product.images" :class="'sticky top-20'"/>
      </div>

      <!-- Product Info -->
      <div>
        <div class="flex justify-between items-start gap-4">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold tracking-tight">{{ product.name }}</h1>
            <p class="text-gray-500 mt-1">{{ product.category }}</p>
          </div>
          <Badge v-if="product.isNew" variant="secondary" class="shrink-0">New</Badge>
        </div>

        <!-- Rating -->
        <div class="mt-4 flex items-center gap-2">
          <div class="flex">
            <svg v-for="i in 5" :key="i" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="text-yellow-400">
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2">
              </polygon>
            </svg>
          </div>
          <span class="text-sm text-gray-500">{{ product.rating }} ({{ product.reviews }} reviews)</span>
        </div>

        <!-- Price -->
        <div class="mt-6">
          <div class="flex items-center gap-3">
            <span class="text-3xl font-bold">${{ product.price.toFixed(2) }}</span>
            <span v-if="product.originalPrice" class="text-lg text-gray-500 line-through">${{
              product.originalPrice.toFixed(2) }}</span>
            <Badge v-if="product.originalPrice" variant="destructive" class="text-sm">
              {{ Math.round((1 - product.price / product.originalPrice) * 100) }}% OFF
            </Badge>
          </div>
        </div>

        <!-- Short Description -->
        <p class="mt-6 text-gray-700">{{ product.description }}</p>

        <!-- Color Selection -->
        <div v-if="product.colors && product.colors.length > 0" class="mt-8">
          <h3 class="text-sm font-medium mb-2">Color</h3>
          <div class="flex gap-2">
            <button v-for="color in product.colors" :key="color" @click="selectedColor = color"
              class="px-4 py-2 border rounded-full text-sm font-medium transition-all"
              :class="{ 'border-primary bg-primary/10 text-primary': color === selectedColor, 'border-gray-200 hover:border-gray-300': color !== selectedColor }">
              {{ color }}
            </button>
          </div>
        </div>

        <!-- Size Selection -->
        <div v-if="product.sizes && product.sizes.length > 0" class="mt-6">
          <h3 class="text-sm font-medium mb-2">Size</h3>
          <Select v-model="selectedSize">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Select a size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="size in product.sizes" :key="size" :value="size">
                {{ size }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Quantity and Add to Cart -->
        <div class="mt-8 flex items-center gap-6">
          <div class="flex items-center border rounded-lg overflow-hidden">
            <button @click="decrementQuantity" class="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors">
              -
            </button>
            <span class="px-4 py-2 w-12 text-center">{{ quantity }}</span>
            <button @click="incrementQuantity" class="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors">
              +
            </button>
          </div>
          <Button class="flex-1">Add to Cart</Button>
        </div>

        <!-- Stock Status -->
        <div class="mt-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="text-green-500">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
          <span class="text-sm text-gray-500">In stock and ready to ship</span>
        </div>

        <!-- Additional Info -->
        <div class="mt-8 pt-6 border-t">
          <Tabs v-model="activeTab" class="w-full">
            <TabsList class="grid w-full grid-cols-2">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
            </TabsList>
            <TabsContent value="description" class="mt-4">
              <p class="text-gray-700">{{ product.description }}</p>
              <ul class="mt-4 space-y-2">
                <li v-for="(feature, index) in product.features" :key="index" class="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="mr-2 mt-0.5 text-primary">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  {{ feature }}
                </li>
              </ul>
            </TabsContent>
            <TabsContent value="specifications" class="mt-4">
              <p class="text-gray-700">{{ product.details }}</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>

    <!-- Related Products -->
    <div class="mt-16 mb-12 pt-12 border-t">
      <h2 class="text-2xl font-bold mb-8">You may also like</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card v-for="item in relatedProducts" :key="item.id" class="group overflow-hidden">
          <CardHeader class="p-0 relative">
            <img :src="item.image" :alt="item.name" class="w-full aspect-square object-cover" />
          </CardHeader>
          <CardContent class="p-4">
            <h3 class="font-medium">{{ item.name }}</h3>
            <div class="mt-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="text-yellow-400">
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2">
                </polygon>
              </svg>
              <span class="text-sm">{{ item.rating }}</span>
            </div>
            <div class="mt-4 flex justify-between items-center">
              <span class="font-bold">${{ item.price.toFixed(2) }}</span>
              <Button variant="outline" size="sm">Add to Cart</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>

  <!-- footer -->
  <ElementsFooter/>
</template>