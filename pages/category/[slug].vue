<script setup lang="ts">
import {useRoute} from 'vue-router'
import {computed, onMounted, ref} from 'vue'
import type {FeaturedCategory} from '~/types/LandingPage'
import {useLandingFeaturedCategories} from '~/services/landing-page.service'

const route = useRoute()
const slug = route.params.slug as string

const category = ref<FeaturedCategory | null>(null)
const selectedFilter = ref('All Tumblers')
const selectedSubCategory = ref<FeaturedCategory | null>(null)

const {
  data,
  loading,
  error,
  refetch
} = useLandingFeaturedCategories()

const featuredCategories = computed(() => (data.value ?? []) as FeaturedCategory[])

onMounted(async () => {
  await refetch()
  category.value = featuredCategories.value.find(c => c.slug === slug) ?? null
})

const pageTitle = computed(() => {
  return category.value ? `Category: ${category.value.name}` : 'Category'
})

// Hardcoded category filters
const categoryFilters = [
  'All Tumblers',
  'Stainless',
  'Aluminum', 
  'Hydration Waterbottle',
  'Vacuum Flask',
  'Mug'
]

// Hardcoded products
const products = ref([
  {
    id: 1,
    name: 'The Nordic Flask',
    description: 'Minimalist design meets maximum functionality. Perfect for the modern professional.',
    price: 34.00,
    image: 'https://via.placeholder.com/300x300'
  },
  {
    id: 2,
    name: 'Midnight Executive',
    description: 'Sleek black finish with vacuum-sealed technology keeps drinks hot or cold for hours.',
    price: 28.50,
    image: 'https://via.placeholder.com/300x300'
  },
  {
    id: 3,
    name: 'Ceramic Cork Mug',
    description: 'Eco-friendly ceramic with natural cork base. Sustainable elegance for your desk.',
    price: 22.00,
    image: 'https://via.placeholder.com/300x300'
  },
  {
    id: 4,
    name: 'Prism Hydration',
    description: 'Geometric design with BPA-free materials. Hydration with style.',
    price: 19.50,
    image: 'https://via.placeholder.com/300x300'
  },
  {
    id: 5,
    name: 'The Copper Duo',
    description: 'Premium copper construction with double-wall insulation. Health benefits included.',
    price: 42.00,
    image: 'https://via.placeholder.com/300x300'
  },
  {
    id: 6,
    name: 'Active Team Pack',
    description: 'Set of 6 vibrant colors perfect for team events and corporate gifting.',
    price: 15.00,
    image: 'https://via.placeholder.com/300x300'
  }
])

// Hardcoded subcategories
const subCategories = ref([
  {
    id: 1,
    name: 'Stainless Collection',
    description: 'Premium stainless steel tumblers with lifetime warranty and custom engraving options.',
    image: 'https://via.placeholder.com/400x300',
    cover: 'https://via.placeholder.com/800x400'
  },
  {
    id: 2,
    name: 'Eco-Friendly Line',
    description: 'Sustainable materials meet modern design. Carbon-neutral manufacturing process.',
    image: 'https://via.placeholder.com/400x300',
    cover: 'https://via.placeholder.com/800x400'
  }
])

useHead({
  title: pageTitle,
})

definePageMeta({
  layout: 'page-layout'
})
</script>

<template>
  <div class="app-container">
    <!-- Header Section -->
    <div class="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-8 rounded-lg mb-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold mb-4">Tumbler</h1>
        <p class="text-xl mb-6 text-blue-100">
          Sustainable hydration meets corporate elegance. Discover our collection of premium, eco-friendly drinkware designed for the modern workplace.
        </p>
        <div class="flex gap-4">
          <button class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Explore Collection
          </button>
          <button class="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
            Request Catalog
          </button>
        </div>
      </div>
    </div>

    <!-- Category Filter Navigation -->
    <div class="mb-8">
      <div class="flex flex-wrap gap-2 justify-center">
        <button 
          v-for="filter in categoryFilters" 
          :key="filter"
          @click="selectedFilter = filter"
          :class="[
            'px-4 py-2 rounded-full font-medium transition-colors',
            selectedFilter === filter 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          {{ filter }}
        </button>
      </div>
    </div>

    <!-- Categories List Section -->
    <div class="mb-12">
      <h2 class="text-2xl font-bold mb-6 text-center">Featured Categories</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div 
          v-for="cat in featuredCategories" 
          :key="cat.id"
          class="text-center cursor-pointer group"
          @click="selectedSubCategory = cat"
        >
          <div class="bg-gray-100 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <img :src="cat.image" alt="" class="w-full h-24 object-cover rounded mb-2"/>
            <h3 class="font-semibold text-sm">{{ cat.name }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Products Section -->
    <div class="mb-12">
      <h2 class="text-3xl font-bold mb-8 text-center">Featured Hydration</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="product in products" 
          :key="product.id"
          class="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
        >
          <img :src="product.image" alt="" class="w-full h-48 object-cover"/>
          <div class="p-4">
            <h3 class="text-lg font-semibold mb-2">{{ product.name }}</h3>
            <p class="text-gray-600 text-sm mb-3">{{ product.description }}</p>
            <div class="flex justify-between items-center">
              <span class="text-xl font-bold text-blue-600">${{ product.price.toFixed(2) }}</span>
              <button class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                Add to Quote
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="text-center mt-8">
        <button class="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
          Load More Products
        </button>
      </div>
    </div>

    <!-- Selected Sub Category Section -->
    <div v-if="selectedSubCategory" class="mb-8">
      <div class="bg-gray-50 rounded-lg p-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <img :src="selectedSubCategory.image" alt="" class="w-full h-64 object-cover rounded-lg"/>
          </div>
          <div>
            <h2 class="text-3xl font-bold mb-4">{{ selectedSubCategory.name }}</h2>
            <p class="text-gray-700 mb-6">{{ selectedSubCategory.description }}</p>
            <div class="space-y-3 mb-6">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>BPA-Free & Food Grade Materials</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Carbon-Neutral Manufacturing</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Custom Laser Engraving Included</span>
              </div>
            </div>
            <a href="#" class="text-blue-600 font-semibold hover:underline">Learn about our sourcing →</a>
            <div class="mt-4">
              <div class="bg-green-100 text-green-800 px-4 py-2 rounded-lg inline-block font-semibold">
                98% SUSTAINABILITY RATING
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sustainability Section -->
    <div class="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <img src="https://via.placeholder.com/400x300" alt="Hydration that matters" class="w-full h-64 object-cover rounded-lg"/>
        </div>
        <div>
          <h2 class="text-3xl font-bold mb-4">Hydration that matters.</h2>
          <p class="text-gray-700 mb-6">
            Choosing the right merchandise isn't just about branding; it's about the message you send. Our tumbler collection focuses on high-quality materials that last years, not weeks. From vacuum-sealed technology to carbon-neutral shipping, we help your company make an impact without the footprint.
          </p>
          <div class="space-y-3 mb-6">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>BPA-Free & Food Grade Materials</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Carbon-Neutral Manufacturing</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Custom Laser Engraving Included</span>
            </div>
          </div>
          <a href="#" class="text-blue-600 font-semibold hover:underline">Learn about our sourcing →</a>
          <div class="mt-4">
            <div class="bg-green-100 text-green-800 px-4 py-2 rounded-lg inline-block font-semibold">
              98% SUSTAINABILITY RATING
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

