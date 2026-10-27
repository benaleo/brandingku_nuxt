<script setup lang="ts">
import { Images, MessageCircle } from 'lucide-vue-next'

type PortfolioItem = {
  id: number
  category: string
  title: string
  subtitle?: string | null
  client?: string | null
  galleries: { id: number; file: string; orders: number }[]
}
type PortfolioPage = {
  items: PortfolioItem[]
  page_info: { current_page: number; has_next_page: boolean; total_items: number }
}

const { t } = useI18n()
const { gqlFetch } = useGql()
const { openChat } = useChatWidget()
const STORAGE_URL = useRuntimeConfig().public.STORAGE_URL

const PAGE_SIZE = 12
const PORTFOLIOS_QUERY = `
  query publicPortfolios($pagination: PaginationInput) {
    getPortfolios(pagination: $pagination, is_active: true, sort: { column: CREATED_AT, direction: DESC }) {
      items { id category title subtitle client galleries { id file orders } }
      page_info { current_page has_next_page total_items }
    }
  }
`
const fetchPage = async (page: number) => {
  const res = await gqlFetch<{ getPortfolios: PortfolioPage }>(PORTFOLIOS_QUERY, {
    pagination: { page, limit: PAGE_SIZE },
  })
  return res.getPortfolios
}

// the first page renders server-side so the projects are visible to crawlers
const { data: firstPage, error: loadError, status, refresh } = await useAsyncData('public-portfolios', () => fetchPage(1))

// later pages are appended in the browser
const morePages = ref<PortfolioItem[]>([])
const lastPage = ref(1)
const hasNext = ref(false)
const loadingMore = ref(false)
watch(firstPage, (page) => {
  morePages.value = []
  lastPage.value = 1
  hasNext.value = Boolean(page?.page_info?.has_next_page)
}, { immediate: true })

const items = computed(() => [...(firstPage.value?.items || []), ...morePages.value])

const loadMore = async () => {
  if (loadingMore.value || !hasNext.value) return
  loadingMore.value = true
  try {
    const page = await fetchPage(lastPage.value + 1)
    morePages.value.push(...(page?.items || []))
    lastPage.value += 1
    hasNext.value = Boolean(page?.page_info?.has_next_page)
  } catch {
    hasNext.value = false
  } finally {
    loadingMore.value = false
  }
}

// category is free text on the portfolio ("Parent / Child"), so the chips come from the loaded items
const activeCategory = ref<string | null>(null)
const categories = computed(() => [...new Set(items.value.map((p) => p.category).filter(Boolean))])
const visibleItems = computed(() =>
  activeCategory.value ? items.value.filter((p) => p.category === activeCategory.value) : items.value
)

const imageUrl = (file: string) => (file.startsWith('http') ? file : `${STORAGE_URL}${file}`)
const coverOf = (p: PortfolioItem) => (p.galleries?.[0]?.file ? imageUrl(p.galleries[0].file) : '')

// project viewer
const viewerOpen = ref(false)
const selected = ref<PortfolioItem | null>(null)
const openViewer = (p: PortfolioItem) => {
  selected.value = p
  viewerOpen.value = true
}
const selectedImages = computed(() => (selected.value?.galleries || []).map((g) => imageUrl(g.file)))
const selectedMeta = computed(() => {
  const p = selected.value
  if (!p) return ''
  return [p.category, p.client ? t('app.portfolioPage.client', { name: p.client }) : ''].filter(Boolean).join(' · ')
})
const askSimilar = () => {
  const title = selected.value?.title || ''
  viewerOpen.value = false
  openChat(t('app.portfolioPage.similarTopic', { title }))
}

useHead(() => ({
  title: t('app.portfolioPage.metaTitle'),
  meta: [{ name: 'description', content: t('app.portfolioPage.metaDescription') }],
}))
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-slate-700">
    <!-- Header: top padding clears the fixed navbar -->
    <div class="text-center px-4 pt-28 pb-8 md:pt-36 md:pb-12">
      <span class="text-green-600 text-xs md:text-sm font-semibold tracking-wide">{{ $t('app.portfolioPage.eyebrow') }}</span>
      <h1 class="mt-2 text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800">{{ $t('app.portfolioPage.title') }}</h1>
      <p class="mt-3 text-sm md:text-base text-gray-500 max-w-xl mx-auto">{{ $t('app.portfolioPage.subtitle') }}</p>
    </div>

    <div class="app-container px-4 md:px-6 pb-12 md:pb-16">
      <!-- Category filter -->
      <div
        v-if="categories.length > 1"
        class="mb-6 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center"
        role="group"
        :aria-label="$t('app.portfolioPage.filterLabel')"
      >
        <button
          v-for="cat in [null, ...categories]"
          :key="cat ?? 'all'"
          type="button"
          class="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors"
          :class="activeCategory === cat ? 'bg-green-600 text-white' : 'bg-white text-gray-700 ring-1 ring-black/5 hover:bg-gray-100'"
          :aria-pressed="activeCategory === cat"
          @click="activeCategory = cat"
        >
          {{ cat ?? $t('app.portfolioPage.all') }}
        </button>
      </div>

      <!-- Loading: skeleton cards in the same grid -->
      <div v-if="status === 'pending' && !items.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div v-for="n in 6" :key="n" class="overflow-hidden rounded-xl bg-white animate-pulse">
          <div class="aspect-[4/3] bg-gray-200"></div>
          <div class="p-4 space-y-2">
            <div class="h-3 w-1/3 rounded bg-gray-200"></div>
            <div class="h-5 w-2/3 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="loadError && !items.length" class="py-12 text-center">
        <p class="mb-4 text-red-500">{{ $t('app.portfolioPage.loadFailed') }}</p>
        <button type="button" class="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700" @click="refresh()">
          {{ $t('app.portfolioPage.retry') }}
        </button>
      </div>

      <!-- Empty -->
      <div v-else-if="!items.length" class="mx-auto max-w-xl rounded-2xl border border-dashed bg-white px-6 py-14 text-center">
        <Images class="mx-auto size-10 text-gray-400" />
        <p class="mt-4 text-xl font-semibold text-slate-800">{{ $t('app.portfolioPage.emptyTitle') }}</p>
        <p class="mt-2 text-gray-500">{{ $t('app.portfolioPage.emptyText') }}</p>
        <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <NuxtLink to="/product" class="inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700">
            {{ $t('app.portfolioPage.browseProducts') }}
          </NuxtLink>
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-800 hover:bg-gray-200"
            @click="openChat($t('app.portfolioPage.generalTopic'))"
          >
            <MessageCircle class="size-5" />
            {{ $t('app.portfolioPage.chatAdmin') }}
          </button>
        </div>
      </div>

      <!-- Projects: 1 column on phones, 2 on tablets, 3 on desktop -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <button
          v-for="p in visibleItems"
          :key="p.id"
          type="button"
          class="group flex flex-col overflow-hidden rounded-xl bg-white text-left shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
          @click="openViewer(p)"
        >
          <div class="relative aspect-[4/3] overflow-hidden bg-slate-800">
            <img
              v-if="coverOf(p)"
              :src="coverOf(p)"
              :alt="$t('app.portfolioPage.imageAlt', { title: p.title, n: 1 })"
              loading="lazy"
              class="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            >
            <div v-else class="flex size-full items-center justify-center text-4xl font-bold uppercase text-white/70">
              {{ p.title.charAt(0) }}
            </div>
            <span
              v-if="p.galleries.length > 1"
              class="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white"
            >
              <Images class="size-3.5" />
              {{ $t('app.portfolioPage.photos', { count: p.galleries.length }, p.galleries.length) }}
            </span>
          </div>
          <div class="flex flex-1 flex-col p-4">
            <p v-if="p.category" class="truncate text-xs font-medium uppercase tracking-wide text-green-700">{{ p.category }}</p>
            <h2 class="mt-1 line-clamp-2 text-lg font-semibold text-slate-800 group-hover:text-green-700">{{ p.title }}</h2>
            <p v-if="p.subtitle" class="mt-1 line-clamp-2 text-sm text-gray-500">{{ p.subtitle }}</p>
            <p v-if="p.client" class="mt-auto pt-3 text-sm text-gray-600">{{ $t('app.portfolioPage.client', { name: p.client }) }}</p>
          </div>
        </button>
      </div>

      <div v-if="hasNext" class="mt-8 text-center">
        <button
          type="button"
          class="rounded-lg bg-white px-8 py-3 font-semibold text-gray-700 ring-1 ring-black/10 hover:bg-gray-100 disabled:opacity-50"
          :disabled="loadingMore"
          @click="loadMore"
        >
          {{ loadingMore ? $t('app.portfolioPage.loading') : $t('app.portfolioPage.loadMore') }}
        </button>
      </div>
    </div>

    <!-- CTA -->
    <div v-if="items.length" class="bg-green-700 px-4 py-12 text-center text-white md:py-16">
      <h2 class="text-2xl font-bold md:text-3xl">{{ $t('app.portfolioPage.ctaTitle') }}</h2>
      <p class="mx-auto mt-3 max-w-xl text-green-100">{{ $t('app.portfolioPage.ctaText') }}</p>
      <button
        type="button"
        class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-green-700 hover:bg-green-50 sm:w-auto"
        @click="openChat($t('app.portfolioPage.generalTopic'))"
      >
        <MessageCircle class="size-5" />
        {{ $t('app.portfolioPage.chatAdmin') }}
      </button>
    </div>

    <!-- Project viewer -->
    <ElementsInsetSheet v-model:open="viewerOpen" wide :title="selected?.title || ''" :description="selectedMeta">
      <AtomsProductThumbnail
        v-if="selectedImages.length"
        :images="selectedImages"
        :image-alt="(n: number) => $t('app.portfolioPage.imageAlt', { title: selected?.title || '', n })"
      />
      <p v-if="selected?.subtitle" class="mt-4 text-gray-600">{{ selected.subtitle }}</p>
      <template #footer>
        <button
          type="button"
          class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
          @click="askSimilar"
        >
          <MessageCircle class="size-5" />
          {{ $t('app.portfolioPage.askSimilar') }}
        </button>
      </template>
    </ElementsInsetSheet>
  </div>
</template>
