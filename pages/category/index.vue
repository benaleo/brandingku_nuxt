<template>
  <div class="min-h-screen bg-gray-100 text-slate-700">
    <!-- Header Section: top padding clears the fixed navbar -->
    <div class="text-center px-4 pt-28 pb-8 md:pt-36 md:pb-12">
      <span class="text-green-600 text-xs md:text-sm font-semibold tracking-wide">{{ $t('app.categoryPage.eyebrow', { year: new Date().getFullYear() }) }}</span>
      <h1 class="mt-2 text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800">{{ $t('app.categoryPage.title') }}</h1>
      <p class="mt-3 text-sm md:text-base text-gray-500 max-w-xl mx-auto">{{ $t('app.categoryPage.subtitle') }}</p>
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
          {{ $t('app.categoryPage.retry') }}
        </button>
      </div>

      <!-- Categories Grid: 2 columns on phones, 3 on tablets, 4 on desktop -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
        <div v-for="category in categories" :key="category.id" class="relative">
        <NuxtLink
          :to="category.slug.startsWith('/') ? category.slug : `/category/${category.slug}`"
          class="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
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
              <p class="text-xs sm:text-sm text-gray-500">{{ $t('app.categoryPage.productCount', { count: category.product_count }, category.product_count) }}</p>
            </div>
            <ArrowRight class="size-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-green-700" />
          </div>
        </NuxtLink>
        <!-- the category's catalog: a stored file downloads, a link opens in a new tab -->
        <a
          v-if="category.catalog"
          :href="category.catalog.url"
          target="_blank"
          rel="noopener"
          :download="category.catalog.download ? '' : undefined"
          class="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-green-700 shadow-md ring-1 ring-black/5 transition hover:bg-green-600 hover:text-white"
          :aria-label="$t('app.categoryPage.downloadCatalogOf', { name: category.name })"
        >
          <Download class="size-4" /> {{ $t('app.categoryPage.catalog') }}
        </a>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && !error && categories.length === 0" class="text-center py-12">
        <p class="text-gray-400">{{ $t('app.categoryPage.empty') }}</p>
      </div>
    </div>

    <!-- Featured Eco Kits Section -->
    <div class="bg-gray-200 py-12 md:py-16 px-4">
      <div class="app-container text-center">
        <h2 class="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-slate-800">{{ $t('app.categoryPage.ecoTitle') }}</h2>
        <p class="text-sm md:text-base text-gray-500 mb-6 md:mb-8 max-w-2xl mx-auto">
          {{ $t('app.categoryPage.ecoDescription') }}
        </p>
        <NuxtLink to="/product" class="inline-flex w-full sm:w-auto items-center justify-center bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
          {{ $t('app.categoryPage.ecoCta') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Bespoke Gifting Section -->
    <div class="py-12 md:py-16 px-4">
      <div class="app-container text-center">
        <h2 class="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-slate-800">{{ $t('app.categoryPage.giftTitle') }}</h2>
        <p class="text-sm md:text-base text-gray-500 mb-6 md:mb-8 max-w-2xl mx-auto">
          {{ $t('app.categoryPage.giftDescription') }}
        </p>
        <NuxtLink to="/kontak" class="text-green-600 hover:text-green-500 font-semibold underline transition-colors duration-300">
          {{ $t('app.categoryPage.giftCta') }}
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
  catalog: { url: string; download: boolean } | null
}

// Import service
import { useProductCategoryService } from '~/services/product-category.service'
import { ArrowRight, Download } from 'lucide-vue-next'

const { t } = useI18n()
const config = useRuntimeConfig()

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
      product_count: item.product_count,
      catalog: item.catalog_file ? { url: `${config.public.STORAGE_URL}${item.catalog_file}`, download: true }
        : item.catalog_url ? { url: item.catalog_url, download: false } : null,
    }))
  } catch (err: any) {
    console.error('Error fetching categories:', err)
    error.value = err?.message || t('app.categoryPage.loadFailed')
  } finally {
    loading.value = false
  }
}

// Fetch data on mount
onMounted(() => {
  fetchCategories()
})

// Page metadata
useHead(() => ({
  title: t('app.categoryPage.metaTitle'),
  meta: [
    { name: 'description', content: t('app.categoryPage.metaDescription') }
  ]
}))
</script>

<style scoped>
/* Additional custom styles if needed */
</style>