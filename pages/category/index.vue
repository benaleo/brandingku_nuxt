<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Header Section -->
    <div class="text-center pt-32 pb-12 px-4">
      <h1 class="text-4xl font-bold mb-4">Kategori Premium Pilihan</h1>
      <p class="text-gray-400 mb-2">Jelajahi koleksi eksklusif produk berkualitas tinggi kami</p>
      <span class="text-green-500 text-sm font-semibold">KATALOG 2024</span>
    </div>

    <!-- Category Grid -->
    <div class="container mx-auto px-4 pb-12">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <p class="mt-4 text-gray-400">Memuat data kategori...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-500 mb-4">{{ error }}</p>
        <button @click="fetchCategories" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
          Coba Lagi
        </button>
      </div>

      <!-- Categories Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform duration-300"
        >
          <div class="h-48 bg-gray-800 flex items-center justify-center">
            <img :src="category.image" :alt="category.name" class="w-full h-full object-cover">
          </div>
          <div class="p-4">
            <h3 class="text-xl font-semibold mb-2">{{ category.name }}</h3>
            <p class="text-gray-400 text-sm">{{ category.product_count }} Produk</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && !error && categories.length === 0" class="text-center py-12">
        <p class="text-gray-400">Belum ada kategori tersedia</p>
      </div>
    </div>

    <!-- Featured Eco Kits Section -->
    <div class="bg-gray-900 py-16 px-4">
      <div class="container mx-auto text-center">
        <h2 class="text-3xl font-bold mb-4">Paket Eco Unggulan</h2>
        <p class="text-gray-400 mb-8 max-w-2xl mx-auto">
          Bundel produk yang berkelanjutan dan ramah lingkungan, sempurna untuk hadiah korporat dan acara promosi
        </p>
        <button class="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
          Jelajahi Paket
        </button>
      </div>
    </div>

    <!-- Bespoke Gifting Section -->
    <div class="py-16 px-4">
      <div class="container mx-auto text-center">
        <h2 class="text-3xl font-bold mb-4">Hadiah Kustom</h2>
        <p class="text-gray-400 mb-8 max-w-2xl mx-auto">
          Solusi hadiah yang dirancang khusus sesuai dengan merek dan kebutuhan Anda
        </p>
        <a href="#" class="text-green-500 hover:text-green-400 font-semibold underline transition-colors duration-300">
          Hubungi Spesialis
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Interface untuk kategori
interface Category {
  id: string
  name: string
  image: string
  product_count: number
}

// Import service
import { useProductCategoryService } from '~/services/product-category.service'

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