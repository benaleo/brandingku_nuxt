<script setup lang="ts">
import {useRoute} from 'vue-router'
import {computed, ref} from 'vue'
import {useGetProductCategoryBySlug, type SubCategory} from '~/services/landing-page.service'

const route = useRoute()
const slug = route.params.slug as string

const selectedFilter = ref('All')
const selectedSubCategory = ref<SubCategory | null>(null)

const {
  data: category,
  loading,
  error
} = useGetProductCategoryBySlug(slug)

const subCategories = computed(() => category.value?.sub || [])

const pageTitle = computed(() => {
  return category.value?.meta_title || category.value?.name || 'Category'
})

const pageDescription = computed(() => {
  return category.value?.meta_description || category.value?.description || ''
})

// Category filters from sub categories
const categoryFilters = computed(() => {
  const filters = ['All']
  if (subCategories.value.length > 0) {
    subCategories.value.forEach(sub => {
      if (sub.name) filters.push(sub.name)
    })
  }
  return filters
})

// Hardcoded products (will be replaced with actual product fetch)
const products = ref([
  {
    id: 1,
    name: 'The Nordic Flask',
    description: 'Minimalist design meets maximum functionality. Perfect for the modern professional.',
    price: 34000,
    image: 'https://via.placeholder.com/300x300'
  },
  {
    id: 2,
    name: 'Midnight Executive',
    description: 'Sleek black finish with vacuum-sealed technology keeps drinks hot or cold for hours.',
    price: 28500,
    image: 'https://via.placeholder.com/300x300'
  },
  {
    id: 3,
    name: 'Ceramic Cork Mug',
    description: 'Eco-friendly ceramic with natural cork base. Sustainable elegance for your desk.',
    price: 22000,
    image: 'https://via.placeholder.com/300x300'
  },
  {
    id: 4,
    name: 'Prism Hydration',
    description: 'Geometric design with BPA-free materials. Hydration with style.',
    price: 19500,
    image: 'https://via.placeholder.com/300x300'
  },
  {
    id: 5,
    name: 'The Copper Duo',
    description: 'Premium copper construction with double-wall insulation. Health benefits included.',
    price: 42000,
    image: 'https://via.placeholder.com/300x300'
  },
  {
    id: 6,
    name: 'Active Team Pack',
    description: 'Set of 6 vibrant colors perfect for team events and corporate gifting.',
    price: 15000,
    image: 'https://via.placeholder.com/300x300'
  }
])

useHead({
  title: pageTitle,
  meta: [
    { name: 'description', content: pageDescription }
  ]
})

// Handle filter click - select subcategory when filter is clicked
const handleFilterClick = (filter: string) => {
  selectedFilter.value = filter
  
  // Find the corresponding subcategory
  if (filter === 'All') {
    selectedSubCategory.value = null
  } else {
    const subCategory = subCategories.value.find(sub => sub.name === filter)
    selectedSubCategory.value = subCategory || null
  }
}

definePageMeta({
  layout: 'page-layout'
})
</script>

<template>
  <div class="bg-gray-100">
    <!-- Header Section with dynamic banner -->
    <div v-if="category" class="relative bg-gradient-to-r from-green-600 to-green-800 text-white py-16 px-8 rounded-lg mb-8">
      <div v-if="category.banner_image" class="absolute inset-0 overflow-hidden rounded-lg">
        <img :src="category.banner_image" alt="" class="w-full h-full object-cover opacity-30"/>
      </div>
      <div class="relative max-w-4xl mx-auto pt-24">
        <h1 class="text-4xl font-bold mb-4">{{ category.name }}</h1>
        <div
          class="text-xl mb-6 text-green-100 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-4 [&_a]:underline [&_a]:text-green-200"
          v-html="category.description"
        ></div>
        <div class="flex gap-4">
          <button class="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors">
            Explore Collection
          </button>
          <button class="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
            Request Catalog
          </button>
        </div>
      </div>
    </div>

   <div class="relative container mx-auto">
     <!-- Category Filter Navigation -->
    <div class="absolute top-[-70px] left-0 right-0 mb-8 bg-white py-4 px-2 rounded-lg">
      <div class="flex gap-2 justify-start overflow-x-auto scrollbar-hide pl-4 snap-x snap-mandatory">
        <button 
          v-for="filter in categoryFilters" 
          :key="filter"
          @click="handleFilterClick(filter)"
          :class="[
            'px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap snap-start',
            selectedFilter === filter 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          {{ filter }}
        </button>
      </div>
    </div>


    <!-- Products Section -->
    <div class="mb-12 pt-12">
      <h2 class="text-3xl font-bold mb-8 text-center">{{ selectedSubCategory?.name || 'Products' }}</h2>
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
              <span class="text-xl font-bold text-green-600">Rp {{ product.price.toLocaleString() }}</span>
              <button class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
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
   </div>

    <!-- Sustainability Section - Show only when subcategory is selected -->
    <div v-if="selectedSubCategory" class="bg-gradient-to-r from-green-50 to-green-50 rounded-lg p-8">
      <div class="container mx-auto flex flex-col lg:flex-row gap-8 items-center py-8">
        <div class="w-full max-w-[300px]">
          <img :src="selectedSubCategory.cover || selectedSubCategory.image" :alt="selectedSubCategory.name" class=" object-contains rounded-lg"/>
        </div>
        <div class="flex-1">
          <h2 class="text-3xl font-bold mb-4">{{ selectedSubCategory.name }} that matters.</h2>
          <div 
            class="text-gray-700 mb-6 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-4 [&_a]:underline [&_a]:text-green-600"
            v-html="selectedSubCategory.description || `<p>Choosing the right merchandise isn't just about branding; it's about the message you send. Our ${selectedSubCategory.name.toLowerCase()} collection focuses on high-quality materials that last years, not weeks. From vacuum-sealed technology to carbon-neutral shipping, we help your company make an impact without the footprint.</p>`"
          ></div>
          <a href="#" class="text-green-600 font-semibold hover:underline">Learn about our sourcing →</a>
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

