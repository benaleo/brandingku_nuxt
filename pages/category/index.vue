<template>
  <div class="min-h-screen bg-gray-100 text-slate-700">
    <!-- Header Section: top padding clears the fixed navbar -->
    <div class="text-center px-4 pt-28 pb-8 md:pt-36 md:pb-12">
      <span class="text-green-600 text-xs md:text-sm font-semibold tracking-wide">KATALOG {{ new Date().getFullYear() }}</span>
      <h1 class="mt-2 text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800">Kategori Premium Pilihan</h1>
      <p class="mt-3 text-sm md:text-base text-gray-500 max-w-xl mx-auto">Jelajahi koleksi eksklusif produk berkualitas tinggi kami</p>
    </div>

    <!-- Category Grid -->
    <div class="app-container px-4 md:px-6 pb-12 md:pb-16">
      <!-- Loading State: skeleton cards in the same grid -->
      <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
        <div v-for="n in 8" :key="n" class="overflow-hidden rounded-xl bg-white animate-pulse">
          <div class="aspect-square bg-gray-200"></div>
          <div class="p-3 sm:p-4 space-y-2">
            <div class="h-4 w-2/3 rounded bg-gray-200"></div>
            <div class="h-3 w-1/3 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-500 mb-4">{{ error }}</p>
        <button @click="fetchCategories" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
          Coba Lagi
        </button>
      </div>

      <!-- Categories Grid: 2 columns on phones, 3 on tablets, 4 on desktop -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
        <NuxtLink
          v-for="category in categories"
          :key="category.id"
          :to="category.slug.startsWith('/') ? category.slug : `/category/${category.slug}`"
          class="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <div class="aspect-square overflow-hidden bg-slate-800">
            <img
              v-if="category.image"
              :src="category.image"
              :alt="category.name"
              loading="lazy"
              class="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            >
            <div v-else class="flex size-full items-center justify-center text-3xl font-bold uppercase text-white/70">
              {{ category.name.charAt(0) }}
            </div>
          </div>
          <div class="flex flex-1 items-center justify-between gap-2 p-3 sm:p-4">
            <div class="min-w-0">
              <h3 class="truncate text-sm sm:text-base lg:text-lg font-semibold capitalize text-slate-800 group-hover:text-green-700">{{ category.name }}</h3>
              <p class="text-xs sm:text-sm text-gray-500">{{ category.product_count }} Produk</p>
            </div>
            <ArrowRight class="size-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-green-700" />
          </div>
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && !error && categories.length === 0" class="text-center py-12">
        <p class="text-gray-400">Belum ada kategori tersedia</p>
      </div>
    </div>

    <!-- Featured Eco Kits Section -->
    <div class="bg-gray-200 py-12 md:py-16 px-4">
      <div class="app-container text-center">
        <h2 class="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-slate-800">Paket Eco Unggulan</h2>
        <p class="text-sm md:text-base text-gray-500 mb-6 md:mb-8 max-w-2xl mx-auto">
          Bundel produk yang berkelanjutan dan ramah lingkungan, sempurna untuk hadiah korporat dan acara promosi
        </p>
        <NuxtLink to="/product" class="inline-flex w-full sm:w-auto items-center justify-center bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
          Jelajahi Paket
        </NuxtLink>
      </div>
    </div>

    <!-- Bespoke Gifting Section -->
    <div class="py-12 md:py-16 px-4">
      <div class="app-container text-center">
        <h2 class="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-slate-800">Hadiah Kustom</h2>
        <p class="text-sm md:text-base text-gray-500 mb-6 md:mb-8 max-w-2xl mx-auto">
          Solusi hadiah yang dirancang khusus sesuai dengan merek dan kebutuhan Anda
        </p>
        <NuxtLink to="/kontak" class="text-green-600 hover:text-green-500 font-semibold underline transition-colors duration-300">
          Hubungi Spesialis
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Interface untuk kategori
interface Category {
  id: string
  slug: string
  name: string
  image: string
  product_count: number
}

// Import service
import { useProductCategoryService } from '~/services/product-category.service'
import { ArrowRight } from 'lucide-vue-next'

// State
const categories = ref<Category[]>([])
const loading = ref<boolean>(false)
const error = ref<string | null>(null)

// Service
const { getProductCategoriesPage } = useProductCategoryService()

// Fetch categories
const fetchCategories = async () => {
  loading.value = true
  error.value = null
  
  try {
    const result = await getProductCategoriesPage(
      { page: 1, limit: 50 }, // pagination
      true // is_active filter
    )
    
    // Transform data to match our interface
    categories.value = result.items.map((item: any) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      image: item.image,
      product_count: item.product_count
    }))
  } catch (err: any) {
    console.error('Error fetching categories:', err)
    error.value = err?.message || 'Gagal memuat data kategori'
  } finally {
    loading.value = false
  }
}

// Fetch data on mount
onMounted(() => {
  fetchCategories()
})

// Page metadata
useHead({
  title: 'Kategori - Koleksi Produk Premium',
  meta: [
    { name: 'description', content: 'Jelajahi kategori premium pilihan produk berkualitas tinggi kami' }
  ]
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>