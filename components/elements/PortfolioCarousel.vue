<script setup lang="ts">
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'

type PortfolioCard = {
  id: number
  slug: string
  category: string
  title: string
  subtitle?: string | null
  galleries: { file: string }[]
}

// productId: show portfolios that showcase this product, falling back to the latest ones;
// excludeId: leave out the portfolio currently on screen
const props = defineProps<{ productId?: number | null; excludeId?: number }>()

const { gqlFetch } = useGql()
const STORAGE_URL = useRuntimeConfig().public.STORAGE_URL

const LIMIT = 10
const QUERY = `
  query portfolioCarousel($pagination: PaginationInput, $product_id: Int) {
    getPortfolios(pagination: $pagination, is_active: true, product_id: $product_id, sort: { column: CREATED_AT, direction: DESC }) {
      items { id slug category title subtitle galleries { file } }
    }
  }
`

const items = ref<PortfolioCard[]>([])
const mode = ref<'product' | 'latest'>('latest')

const fetchCards = async (productId?: number | null) => {
  const res = await gqlFetch<{ getPortfolios: { items: PortfolioCard[] } }>(QUERY, {
    pagination: { page: 1, limit: LIMIT + 1 },
    ...(productId ? { product_id: productId } : {}),
  })
  return (res?.getPortfolios?.items || []).filter((p) => p.id !== props.excludeId).slice(0, LIMIT)
}

const load = async () => {
  try {
    const linked = props.productId ? await fetchCards(props.productId) : []
    if (linked.length) {
      mode.value = 'product'
      items.value = linked
      return
    }
    mode.value = 'latest'
    items.value = await fetchCards()
  } catch {
    items.value = []
  }
}

onMounted(load)
watch(() => [props.productId, props.excludeId], load)

const coverOf = (p: PortfolioCard) => {
  const file = p.galleries?.[0]?.file
  if (!file) return ''
  return file.startsWith('http') ? file : `${STORAGE_URL}${file}`
}

// header arrows drive the carousel through its exposed api
const carousel = ref<{ scrollPrev: () => void; scrollNext: () => void; canScrollPrev: boolean; canScrollNext: boolean } | null>(null)
</script>

<template>
  <section v-if="items.length" class="py-10 md:py-14">
    <div class="mb-6 flex items-end justify-between gap-4">
      <div class="min-w-0">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-green-600">{{ $t('app.portfolioCarousel.eyebrow') }}</p>
        <h2 class="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
          {{ mode === 'product' ? $t('app.portfolioCarousel.titleProduct') : $t('app.portfolioCarousel.titleLatest') }}
        </h2>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <NuxtLink to="/portfolio" class="mr-1 text-sm font-semibold text-green-700 hover:underline">
          {{ $t('app.portfolioCarousel.seeAll') }}
        </NuxtLink>
        <button
          type="button"
          class="hidden size-10 items-center justify-center rounded-full border bg-white text-slate-700 transition hover:border-green-600 hover:text-green-700 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-slate-700 sm:inline-flex"
          :aria-label="$t('app.portfolioCarousel.prev')"
          :disabled="!carousel?.canScrollPrev"
          @click="carousel?.scrollPrev()"
        >
          <ChevronLeft class="size-5" />
        </button>
        <button
          type="button"
          class="hidden size-10 items-center justify-center rounded-full border bg-white text-slate-700 transition hover:border-green-600 hover:text-green-700 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-slate-700 sm:inline-flex"
          :aria-label="$t('app.portfolioCarousel.next')"
          :disabled="!carousel?.canScrollNext"
          @click="carousel?.scrollNext()"
        >
          <ChevronRight class="size-5" />
        </button>
      </div>
    </div>

    <Carousel ref="carousel" :opts="{ align: 'start' }" class="w-full">
      <CarouselContent class="-ml-4">
        <!-- a peek of the next card on phones hints that the row scrolls -->
        <CarouselItem v-for="p in items" :key="p.id" class="basis-[82%] pl-4 sm:basis-1/2 lg:basis-1/3">
          <NuxtLink
            :to="`/portfolio/${p.slug}`"
            class="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-slate-900 shadow-sm outline-none ring-1 ring-black/10 transition-shadow duration-500 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
          >
            <img
              v-if="coverOf(p)"
              :src="coverOf(p)"
              :alt="p.title"
              loading="lazy"
              class="absolute inset-0 size-full object-cover transition duration-700 ease-out group-hover:scale-105 group-hover:brightness-[0.45] group-focus-visible:brightness-[0.45] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            >
            <div v-else class="absolute inset-0 flex items-center justify-center text-5xl font-bold uppercase text-white/30">
              {{ p.title.charAt(0) }}
            </div>

            <!-- keeps the caption legible; always on for touch, revealed on hover elsewhere -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 group-focus-visible:opacity-100"
            />

            <span
              v-if="p.category"
              class="absolute left-4 top-4 max-w-[80%] truncate rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-800 backdrop-blur"
            >
              {{ p.category }}
            </span>

            <div
              class="absolute inset-x-0 bottom-0 p-5 text-white transition duration-500 ease-out motion-reduce:transition-none [@media(hover:hover)]:translate-y-4 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
            >
              <h3 class="text-lg font-semibold leading-snug md:text-xl">{{ p.title }}</h3>
              <p v-if="p.subtitle" class="mt-1 line-clamp-2 text-sm text-white/80">{{ p.subtitle }}</p>
              <span class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-green-300">
                {{ $t('app.portfolioCarousel.viewProject') }}
                <ArrowRight class="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </NuxtLink>
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  </section>
</template>
