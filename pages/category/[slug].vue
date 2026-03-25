<script setup lang="ts">
import {useRoute} from 'vue-router'
import {computed, ref} from 'vue'
import {useGetProductCategoryBySlug, type SubCategory} from '~/services/landing-page.service'
import {useGetProductsWithCategorySlug} from '~/composables/useGetProductsWithCategorySlug'

const route = useRoute()
const slug = route.params.slug as string

const selectedFilter = ref('All')
const selectedSubCategory = ref<SubCategory | null>(null)

const {
  data: category,
  loading: categoryLoading,
  error: categoryError
} = useGetProductCategoryBySlug(slug)

const {
  products,
  pageInfo,
  loading: productsLoading,
  error: productsError,
  loadMore
} = useGetProductsWithCategorySlug(slug)

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
    <!-- Loading State -->
    <div v-if="categoryLoading" class="relative bg-gradient-to-r from-green-600 to-green-800 text-white py-16 px-8 rounded-lg mb-8">
      <div class="relative max-w-4xl mx-auto pt-24">
        <div class="h-12 bg-white/20 rounded w-1/2 mb-4 animate-pulse"></div>
        <div class="h-6 bg-white/20 rounded w-3/4 mb-6 animate-pulse"></div>
        <div class="flex gap-4">
          <div class="h-12 bg-white/20 rounded w-40 animate-pulse"></div>
          <div class="h-12 bg-white/20 rounded w-40 animate-pulse"></div>
        </div>
      </div>
    </div>
    
    <!-- Error State -->
    <div v-else-if="categoryError" class="relative bg-red-50 border border-red-200 text-red-800 py-16 px-8 rounded-lg mb-8">
      <div class="relative max-w-4xl mx-auto text-center">
        <h1 class="text-4xl font-bold mb-4">Category Not Found</h1>
        <p class="text-xl mb-6">{{ categoryError }}</p>
        <button @click="$router.push('/')" class="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
          Back to Home
        </button>
      </div>
    </div>
    
    <!-- Category Header -->
    <div v-else-if="category" class="relative bg-gradient-to-r from-green-600 to-green-800 text-white py-16 px-8 rounded-lg mb-8">
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
      
      <!-- Loading State -->
      <div v-if="productsLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 6" :key="n" class="bg-white border rounded-lg overflow-hidden animate-pulse">
          <div class="w-full h-48 bg-gray-200"></div>
          <div class="p-4">
            <div class="h-4 bg-gray-200 rounded mb-2"></div>
            <div class="h-3 bg-gray-200 rounded mb-3"></div>
            <div class="flex justify-between items-center">
              <div class="h-4 bg-gray-200 rounded w-20"></div>
              <div class="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="productsError" class="text-center py-12">
        <p class="text-red-600 mb-4">{{ productsError }}</p>
        <button @click="loadMore" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
          Try Again
        </button>
      </div>
      
      <!-- Products Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink 
          v-for="product in products" 
          :key="product.id"
          :to="`/product/${product.slug}`"
          class="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow block group"
        >
        <div class="aspect-square p-4 bg-gray-100">
          <img :src="product.image" alt="" class="aspect-square object-cover rounded-md"/>
        </div>
          <div class="p-4 bg-gray-100">
            <h3 class="text-lg font-semibold mb-2 group-hover:text-green-600 transition-colors">{{ product.name }}</h3>
            <p class="text-gray-600 text-sm mb-3 line-clamp-3" v-html="product.description?.substring(0, 200) + (product.description?.length > 200 ? '...' : '')"></p>
            <div class="flex justify-between items-center">
              <span class="text-xl font-bold text-green-600">Rp {{ (product.additionals?.[0]?.price || 0).toLocaleString() }}</span>
              <button 
                @click.prevent
                class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
              >
                Add to Quote
              </button>
            </div>
          </div>
        </NuxtLink>
      </div>
      
      <!-- Load More Button -->
      <div v-if="!productsLoading && !productsError && pageInfo?.has_next_page" class="text-center mt-8">
        <button 
          @click="loadMore" 
          :disabled="productsLoading"
          class="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ productsLoading ? 'Loading...' : 'Load More Products' }}
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

