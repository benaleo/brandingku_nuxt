<script setup lang="ts">
import SkeletonProductGrid from "~/components/skeletons/SkeletonProductGrid.vue";
import {useRoute} from 'vue-router'
import {computed, ref, watch} from 'vue'
import {useGetProductCategoryBySlug, type SubCategory} from '~/services/landing-page.service'
import {Check, ChevronDown, Download, MessageCircle, SlidersHorizontal, X} from 'lucide-vue-next'
import {Dialog, DialogContent, DialogDescription, DialogTitle} from '~/components/ui/dialog'

const route = useRoute()
const { t } = useI18n()
const slug = route.params.slug as string
const subSlug = computed(() => route.query.sub as string | undefined)

const selectedFilter = ref('All')
const selectedSubCategory = ref<SubCategory | null>(null)
const pickerOpen = ref(false)

const {
  data: category,
  loading: categoryLoading,
  error: categoryError
} = useGetProductCategoryBySlug(slug)


// "Request Catalog": the selected sub category's catalog, else the parent's; without one, ask in live chat
const { openChat } = useChatWidget()
// a stored file downloads; a link (e.g. Google Drive) opens in a new tab
const catalogOf = (c?: { catalog_file: string; catalog_file_name: string; catalog_url?: string } | null) =>
  c?.catalog_file ? { url: c.catalog_file, name: c.catalog_file_name, download: true }
    : c?.catalog_url ? { url: c.catalog_url, name: '', download: false } : null
const activeCatalog = computed(() => catalogOf(selectedSubCategory.value) || catalogOf(category.value))
const requestCatalog = () =>
  openChat(t('app.categoryPage.detail.requestCatalogMessage', { name: selectedSubCategory.value?.name || category.value?.name || '' }).trim())

// products of the chosen sub category, else of the whole category (its sub categories included)
const activeCategoryId = computed(() => selectedSubCategory.value?.id || category.value?.id || null)

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
      <div v-if="categoryLoading" class="px-2">
        <div class="h-11 w-full animate-pulse rounded-lg bg-gray-200"></div>
      </div>
      <!-- the chosen sub category; the list opens in a popup -->
      <div v-else class="flex items-center gap-2 px-2">
        <button
          type="button"
          class="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg border bg-white px-4 py-2.5 text-left text-sm font-medium hover:border-green-600"
          :aria-label="$t('app.categoryPage.detail.chooseCategory')"
          @click="pickerOpen = true"
        >
          <span class="flex min-w-0 items-center gap-2">
            <SlidersHorizontal class="size-4 shrink-0 text-green-700" />
            <span class="truncate capitalize">{{ selectedSubCategory?.name || $t('app.categoryPage.detail.chooseCategory') }}</span>
          </span>
          <ChevronDown class="size-4 shrink-0 text-gray-500" />
        </button>
        <button
          v-if="selectedSubCategory"
          type="button"
          class="flex shrink-0 items-center gap-1 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
          @click="handleFilterClick('All')"
        >
          <X class="size-4" /> {{ $t('app.categoryPage.detail.resetFilter') }}
        </button>
      </div>
    </div>

    <Dialog v-model:open="pickerOpen">
      <DialogContent class="max-h-[85dvh] overflow-y-auto sm:max-w-md">
        <DialogTitle>{{ $t('app.categoryPage.detail.chooseCategory') }}</DialogTitle>
        <DialogDescription class="sr-only">{{ category?.name }}</DialogDescription>
        <ul class="space-y-1">
          <li v-for="filter in categoryFilters" :key="filter">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm capitalize transition-colors"
              :class="selectedFilter === filter ? 'bg-green-50 font-semibold text-green-700' : 'hover:bg-gray-100'"
              :aria-pressed="selectedFilter === filter"
              @click="handleFilterClick(filter); pickerOpen = false"
            >
              <span>{{ filter === 'All' ? $t('app.categoryPage.detail.all') : filter }}</span>
              <Check v-if="selectedFilter === filter" class="size-4 shrink-0" />
            </button>
          </li>
        </ul>
        <button
          v-if="selectedSubCategory"
          type="button"
          class="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
          @click="handleFilterClick('All'); pickerOpen = false"
        >
          {{ $t('app.categoryPage.detail.resetFilter') }}
        </button>
      </DialogContent>
    </Dialog>


    <!-- the same product list as /product, kept to this category or the chosen sub category -->
    <div id="products" class="scroll-mt-24 pt-4">
      <ElementsProductBrowser
        v-if="activeCategoryId"
        :key="category?.id"
        :category-id="activeCategoryId"
        :title="selectedSubCategory?.name || $t('app.categoryPage.detail.products')"
      />
      <!-- the category is still loading: the list's heading and cards as placeholders -->
      <section v-else-if="categoryLoading" class="pb-16 pt-6 md:pt-4" aria-hidden="true">
        <Skeleton class="h-8 w-48" />
        <Skeleton class="mt-2 h-4 w-32" />
        <div class="mt-4 flex gap-2">
          <Skeleton class="h-10 flex-1 sm:max-w-xs" />
          <Skeleton class="h-10 w-24" />
        </div>
        <SkeletonProductGrid class="mt-6" />
      </section>
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

