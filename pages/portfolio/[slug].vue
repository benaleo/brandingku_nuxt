<script setup lang="ts">
import { ChevronRight, MessageCircle } from 'lucide-vue-next'

type PortfolioDetail = {
  id: number
  slug: string
  category: string
  title: string
  subtitle?: string | null
  client?: string | null
  product_id?: number | null
  galleries: { id: number; file: string; orders: number }[]
}

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const { t } = useI18n()
const { gqlFetch } = useGql()
const { openChat } = useChatWidget()
const STORAGE_URL = useRuntimeConfig().public.STORAGE_URL

// rendered server-side so the project is visible to crawlers; null when missing or inactive
const { data: portfolio, status } = await useAsyncData(
  () => `public-portfolio-${slug.value}`,
  async () => {
    if (!slug.value) return null
    const res = await gqlFetch<{ getPublicPortfolio: PortfolioDetail | null }>(
      `query publicPortfolio($slug: String!) {
        getPublicPortfolio(slug: $slug) { id slug category title subtitle client product_id galleries { id file orders } }
      }`,
      { slug: slug.value },
    )
    return res.getPublicPortfolio
  },
  { watch: [slug] },
)

const images = computed(() =>
  (portfolio.value?.galleries || []).map((g) => (g.file.startsWith('http') ? g.file : `${STORAGE_URL}${g.file}`)),
)

const askSimilar = () => openChat(t('app.portfolioPage.similarTopic', { title: portfolio.value?.title || '' }))

useHead(() => ({
  title: portfolio.value ? t('app.portfolioDetail.metaTitle', { title: portfolio.value.title }) : t('app.portfolioPage.metaTitle'),
  meta: [{ name: 'description', content: portfolio.value?.subtitle || t('app.portfolioPage.metaDescription') }],
}))
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-slate-700">
    <div class="app-container px-4 pt-28 pb-6 md:px-6 md:pt-32">
      <!-- Not found -->
      <div v-if="status !== 'pending' && !portfolio" class="mx-auto max-w-md py-16 text-center">
        <h1 class="text-2xl font-bold text-slate-800">{{ $t('app.portfolioDetail.notFound') }}</h1>
        <p class="mt-2 text-gray-500">{{ $t('app.portfolioDetail.notFoundText') }}</p>
        <NuxtLink to="/portfolio" class="mt-6 inline-flex rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700">
          {{ $t('app.portfolioDetail.backToList') }}
        </NuxtLink>
      </div>

      <template v-else-if="portfolio">
        <nav class="flex items-center gap-1 text-sm text-gray-500" aria-label="Breadcrumb">
          <NuxtLink to="/portfolio" class="hover:text-green-700">{{ $t('app.portfolioDetail.breadcrumb') }}</NuxtLink>
          <ChevronRight class="size-4 shrink-0" />
          <span class="truncate text-slate-800">{{ portfolio.title }}</span>
        </nav>

        <div class="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <!-- gallery bleeds to the screen edge on phones -->
          <div class="-mx-4 sm:mx-0">
            <AtomsProductThumbnail
              v-if="images.length"
              :images="images"
              :image-alt="(n: number) => $t('app.portfolioPage.imageAlt', { title: portfolio?.title || '', n })"
              class="lg:sticky lg:top-24"
            />
            <div v-else class="flex aspect-square items-center justify-center bg-slate-800 text-6xl font-bold uppercase text-white/30 sm:rounded-xl">
              {{ portfolio.title.charAt(0) }}
            </div>
          </div>

          <div>
            <span v-if="portfolio.category" class="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-800">
              {{ portfolio.category }}
            </span>
            <h1 class="mt-3 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">{{ portfolio.title }}</h1>
            <p v-if="portfolio.subtitle" class="mt-3 text-lg text-gray-600">{{ portfolio.subtitle }}</p>

            <dl class="mt-6 divide-y rounded-xl border bg-white">
              <div v-if="portfolio.client" class="flex justify-between gap-4 px-4 py-3">
                <dt class="text-gray-500">{{ $t('app.portfolioDetail.client') }}</dt>
                <dd class="text-right font-medium text-slate-800">{{ portfolio.client }}</dd>
              </div>
              <div v-if="portfolio.category" class="flex justify-between gap-4 px-4 py-3">
                <dt class="text-gray-500">{{ $t('app.portfolioDetail.category') }}</dt>
                <dd class="text-right font-medium text-slate-800">{{ portfolio.category }}</dd>
              </div>
            </dl>

            <div class="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
                @click="askSimilar"
              >
                <MessageCircle class="size-5" />
                {{ $t('app.portfolioPage.askSimilar') }}
              </button>
              <NuxtLink to="/portfolio" class="inline-flex items-center justify-center rounded-lg border px-6 py-3 font-semibold text-slate-700 hover:bg-white">
                {{ $t('app.portfolioDetail.backToList') }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <ElementsPortfolioCarousel :product-id="portfolio.product_id" :exclude-id="portfolio.id" />
      </template>
    </div>
  </div>
</template>
