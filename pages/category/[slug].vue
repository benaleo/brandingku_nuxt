<script setup lang="ts">
import {useRoute} from 'vue-router'
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {useGetProductCategoryBySlug, type SubCategory} from '~/services/landing-page.service'
import {useGetProductsWithCategorySlug} from '~/composables/useGetProductsWithCategorySlug'
import {Download, MessageCircle} from 'lucide-vue-next'

const route = useRoute()
const { t } = useI18n()
const slug = route.params.slug as string
const subSlug = computed(() => route.query.sub as string | undefined)

const selectedFilter = ref('All')
const selectedSubCategory = ref<SubCategory | null>(null)

const filterScrollRef = ref<HTMLElement | null>(null)
let isDragging = false
let dragStartX = 0
let dragScrollLeft = 0
let dragMoved = false

function onFilterDragStart(e: MouseEvent) {
  const el = filterScrollRef.value
  if (!el) return
  isDragging = true
  dragMoved = false
  dragStartX = e.pageX - el.offsetLeft
  dragScrollLeft = el.scrollLeft
}

function onFilterDragMove(e: MouseEvent) {
  const el = filterScrollRef.value
  if (!isDragging || !el) return
  e.preventDefault()
  const x = e.pageX - el.offsetLeft
  const walk = x - dragStartX
  if (Math.abs(walk) > 5) dragMoved = true
  el.scrollLeft = dragScrollLeft - walk
  wrapFilterScroll()
}

function onFilterDragEnd() {
  isDragging = false
}

function onFilterClickCapture(e: MouseEvent) {
  if (dragMoved) {
    e.stopPropagation()
    e.preventDefault()
  }
}

// Keep scrollLeft within the middle copy so the strip appears to loop forever
function wrapFilterScroll() {
  const el = filterScrollRef.value
  if (!el || !filterOverflows.value) return
  const oneSetWidth = el.scrollWidth / FILTER_LOOP_REPEAT
  if (oneSetWidth <= 0) return
  if (el.scrollLeft < oneSetWidth) {
    el.scrollLeft += oneSetWidth
    dragScrollLeft += oneSetWidth
  } else if (el.scrollLeft >= oneSetWidth * 2) {
    el.scrollLeft -= oneSetWidth
    dragScrollLeft -= oneSetWidth
  }
}

function onFilterScroll() {
  if (isDragging) return
  wrapFilterScroll()
}

function getMiddleFilterButton(filter: string) {
  const el = filterScrollRef.value
  if (!el) return null
  const buttons = Array.from(el.querySelectorAll<HTMLButtonElement>('button[data-rep="1"]'))
  return buttons.find(b => b.dataset.filter === filter) || null
}

async function centerSelectedFilter(filter: string) {
  await nextTick()
  const el = filterScrollRef.value
  const btn = getMiddleFilterButton(filter)
  if (!el || !btn) return
  el.scrollLeft = btn.offsetLeft - el.clientWidth / 2 + btn.offsetWidth / 2
}

const {
  data: category,
  loading: categoryLoading,
  error: categoryError
} = useGetProductCategoryBySlug(slug)

// Reactive category slug for product fetching
const currentCategorySlug = computed(() => selectedSubCategory.value?.slug || slug)

// "Request Catalog": the selected sub category's catalog, else the parent's; without one, ask in live chat
const { openChat } = useChatWidget()
// a stored file downloads; a link (e.g. Google Drive) opens in a new tab
const catalogOf = (c?: { catalog_file: string; catalog_file_name: string; catalog_url?: string } | null) =>
  c?.catalog_file ? { url: c.catalog_file, name: c.catalog_file_name, download: true }
    : c?.catalog_url ? { url: c.catalog_url, name: '', download: false } : null
const activeCatalog = computed(() => catalogOf(selectedSubCategory.value) || catalogOf(category.value))
const requestCatalog = () =>
  openChat(t('app.categoryPage.detail.requestCatalogMessage', { name: selectedSubCategory.value?.name || category.value?.name || '' }).trim())

const {
  products,
  pageInfo,
  loading: productsLoading,
  error: productsError,
  loadMore,
  fetchProducts
} = useGetProductsWithCategorySlug(currentCategorySlug)

const subCategories = computed(() => category.value?.sub || [])

const pageTitle = computed(() => {
  return category.value?.meta_title || category.value?.name || t('app.categoryPage.detail.fallbackTitle')
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

// Repeat the filter list so the scroll strip can loop infinitely, but only when one set
// is wider than the strip; otherwise the chips would visibly appear three times.
const FILTER_LOOP_REPEAT = 3
const filterOverflows = ref(false)
const loopedFilters = computed(() => {
  const filters = categoryFilters.value
  const reps = filterOverflows.value ? FILTER_LOOP_REPEAT : 1
  const looped: { filter: string; rep: number; key: string }[] = []
  for (let rep = 0; rep < reps; rep++) {
    filters.forEach(filter => looped.push({ filter, rep: reps === 1 ? 1 : rep, key: `${rep}-${filter}` }))
  }
  return looped
})

// measure one set (rendered unlooped first) against the strip width
const measureFilterOverflow = async () => {
  filterOverflows.value = false
  await nextTick()
  const el = filterScrollRef.value
  if (!el) return
  filterOverflows.value = el.scrollWidth > el.clientWidth + 4
  if (filterOverflows.value) centerSelectedFilter(selectedFilter.value)
}
watch([categoryFilters, categoryLoading], () => { if (!categoryLoading.value) measureFilterOverflow() })
onMounted(() => window.addEventListener('resize', measureFilterOverflow))
onBeforeUnmount(() => window.removeEventListener('resize', measureFilterOverflow))

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

// Auto-select sub-category from URL query parameter
watch([category, subSlug], ([newCategory, newSubSlug]) => {
  if (newCategory && newSubSlug) {
    const subCategory = subCategories.value.find(sub => sub.slug === newSubSlug)
    if (subCategory) {
      selectedSubCategory.value = subCategory
      selectedFilter.value = subCategory.name
    }
  }
}, { immediate: true })

// Center the active filter in the scroll strip once it's rendered
watch([categoryLoading, selectedFilter], ([loading]) => {
  if (!loading) centerSelectedFilter(selectedFilter.value)
}, { immediate: true })

definePageMeta({
  layout: 'page-layout'
})
</script>

<template>
  <div class="bg-gray-100">
    <!-- Header Section with dynamic banner -->
    <!-- Loading State -->
    <div v-if="categoryLoading" class="relative bg-gradient-to-r from-green-600 to-green-800 text-white px-4 pt-28 pb-24 sm:px-8 md:pt-36 md:pb-28">
      <div class="relative max-w-4xl mx-auto">
        <div class="h-12 bg-white/20 rounded w-1/2 mb-4 animate-pulse"></div>
        <div class="h-6 bg-white/20 rounded w-3/4 mb-6 animate-pulse"></div>
        <div class="flex flex-col gap-3 sm:flex-row">
          <div class="h-12 bg-white/20 rounded sm:w-44 animate-pulse"></div>
          <div class="h-12 bg-white/20 rounded sm:w-44 animate-pulse"></div>
        </div>
      </div>
    </div>
    
    <!-- Error State -->
    <div v-else-if="categoryError" class="relative bg-red-50 border border-red-200 text-red-800 px-4 pt-28 pb-16 sm:px-8 md:pt-36">
      <div class="relative max-w-4xl mx-auto text-center">
        <h1 class="text-3xl md:text-4xl font-bold mb-4">{{ $t('app.categoryPage.detail.notFound') }}</h1>
        <p class="text-lg md:text-xl mb-6 break-words">{{ categoryError }}</p>
        <button @click="$router.push('/')" class="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
          {{ $t('app.categoryPage.detail.backHome') }}
        </button>
      </div>
    </div>
    
    <!-- Category Header -->
    <!-- top padding clears the fixed navbar; bottom padding leaves room for the overlapping filter strip -->
    <div v-else-if="category" class="relative overflow-hidden bg-gradient-to-r from-green-600 to-green-800 text-white px-4 pt-28 pb-24 sm:px-8 md:pt-36 md:pb-28">
      <!-- hero uses the category cover; older categories without one keep the list image -->
      <div v-if="category.cover_image || category.banner_image" class="absolute inset-0">
        <img :src="category.cover_image || category.banner_image" alt="" class="w-full h-full object-cover opacity-30"/>
      </div>
      <div class="relative max-w-4xl mx-auto">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 break-words">{{ category.name }}</h1>
        <div
          class="text-base sm:text-lg md:text-xl mb-6 text-green-100 break-words [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-4 [&_a]:underline [&_a]:text-green-200"
          v-html="category.description"
        ></div>
        <div class="flex flex-col gap-3 sm:flex-row">
          <a
            href="#products"
            class="inline-flex items-center justify-center bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            {{ $t('app.categoryPage.detail.explore') }}
          </a>
          <a
            v-if="activeCatalog"
            :href="activeCatalog.url"
            target="_blank"
            rel="noopener"
            :download="activeCatalog.download ? activeCatalog.name : undefined"
            :title="activeCatalog.name || undefined"
            class="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
          >
            <Download class="size-5 shrink-0" />
            {{ $t('app.categoryPage.detail.requestCatalog') }}
          </a>
          <button
            v-else
            type="button"
            class="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            @click="requestCatalog"
          >
            <MessageCircle class="size-5 shrink-0" />
            {{ $t('app.categoryPage.detail.requestCatalog') }}
          </button>
        </div>
      </div>
    </div>

   <div class="relative app-container px-4 md:px-6">
     <!-- Category Filter Navigation: overlaps the bottom of the hero -->
    <div class="relative z-10 -mt-14 md:-mt-16 rounded-xl bg-white py-3 px-2 shadow-sm">
      <!-- Loading State for Filters -->
      <div v-if="categoryLoading" class="flex gap-2 justify-start overflow-hidden px-2">
        <div v-for="n in 6" :key="n" class="h-9 bg-gray-200 rounded-full w-24 shrink-0 animate-pulse"></div>
      </div>
      <!-- Actual Filters -->
      <div
        v-else
        ref="filterScrollRef"
        class="flex gap-2 overflow-x-auto scrollbar-hide px-2 select-none"
        :class="filterOverflows ? 'justify-start cursor-grab active:cursor-grabbing' : 'justify-center flex-wrap'"
        @mousedown="onFilterDragStart"
        @mousemove="onFilterDragMove"
        @mouseup="onFilterDragEnd"
        @mouseleave="onFilterDragEnd"
        @click.capture="onFilterClickCapture"
        @scroll="onFilterScroll"
      >
        <button
          v-for="item in loopedFilters"
          :key="item.key"
          :data-rep="item.rep"
          :data-filter="item.filter"
          @click="handleFilterClick(item.filter)"
          :class="[
            'px-4 py-2 rounded-full text-sm md:text-base font-medium capitalize transition-colors whitespace-nowrap',
            selectedFilter === item.filter
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          {{ item.filter === 'All' ? $t('app.categoryPage.detail.all') : item.filter }}
        </button>
      </div>
    </div>


    <!-- Products Section -->
    <div id="products" class="mb-12 pt-10 md:pt-12 max-w-6xl mx-auto scroll-mt-24">
      <h2 class="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center capitalize">{{ selectedSubCategory?.name || $t('app.categoryPage.detail.products') }}</h2>
      
      <!-- Initial Loading State (Skeleton) -->
      <div v-if="productsLoading && products.length === 0" class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        <div v-for="n in 8" :key="n" class="bg-white border rounded-lg overflow-hidden animate-pulse">
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
      
      <!-- Loading More State -->
      <div v-else-if="productsLoading && products.length > 0" class="text-center py-4">
        <div class="inline-flex items-center space-x-2 text-green-600">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ $t('app.categoryPage.detail.loadingMore') }}</span>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="productsError" class="text-center py-12">
        <p class="text-red-600 mb-4">{{ productsError }}</p>
        <button @click="loadMore" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
          {{ $t('app.categoryPage.detail.tryAgain') }}
        </button>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="!productsLoading && !productsError && products.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
        <div class="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </div>
        <p class="text-xl md:text-2xl font-semibold text-gray-800 mb-3">{{ $t('app.categoryPage.detail.emptyTitle') }}</p>
        <p class="text-gray-600 mb-6 max-w-md">{{ $t('app.categoryPage.detail.emptyDescription') }}</p>
        <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <NuxtLink to="/product" class="inline-flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
            {{ $t('app.categoryPage.detail.browseAll') }}
          </NuxtLink>
          <NuxtLink to="/kontak" class="inline-flex items-center justify-center bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">
            {{ $t('app.categoryPage.detail.contactSales') }}
          </NuxtLink>
        </div>
      </div>
      
      <!-- Products Grid -->
      <!-- 2 columns on phones, 3 on laptops, 4 on wide screens -->
      <div v-else class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        <NuxtLink
          v-for="product in products"
          :key="product.id"
          :to="`/product/${product.slug}`"
          class="flex min-w-0 flex-col bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
        >
          <div class="aspect-square bg-gray-100 p-2 sm:p-4">
            <img :src="product.image" :alt="product.name" loading="lazy" class="size-full object-cover rounded-md"/>
          </div>
          <div class="flex flex-1 flex-col p-3 sm:p-4 bg-gray-100">
            <h3 class="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">{{ product.name }}</h3>
            <p class="hidden sm:block text-gray-600 text-sm mb-3 line-clamp-3" v-html="product.description?.substring(0, 200) + (product.description?.length > 200 ? '...' : '')"></p>
            <div class="mt-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span class="text-base sm:text-xl font-bold text-green-600" :class="product.additionals?.[0]?.price ? '' : 'invisible'">Rp {{ (product.additionals?.[0]?.price || 0).toLocaleString('id-ID') }}</span>
              <button
                @click.prevent
                class="w-full sm:w-auto bg-green-600 text-white px-3 py-2 rounded-lg text-xs sm:text-sm hover:bg-green-700 transition-colors"
              >
                {{ $t('app.categoryPage.detail.addToQuote') }}
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
          {{ productsLoading ? $t('app.categoryPage.detail.loading') : $t('app.categoryPage.detail.loadMore') }}
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
          <h2 class="text-3xl font-bold mb-4">{{ $t('app.categoryPage.detail.subTitle', { name: selectedSubCategory.name }) }}</h2>
          <div 
            class="text-gray-700 mb-6 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-4 [&_a]:underline [&_a]:text-green-600"
            v-html="selectedSubCategory.description || `<p>${$t('app.categoryPage.detail.subFallback', { name: selectedSubCategory.name.toLowerCase() })}</p>`"
          ></div>
          <a href="#" class="text-green-600 font-semibold hover:underline">{{ $t('app.categoryPage.detail.sourcing') }}</a>
          <div class="mt-4">
            <div class="bg-green-100 text-green-800 px-4 py-2 rounded-lg inline-block font-semibold">
              {{ $t('app.categoryPage.detail.sustainability') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

