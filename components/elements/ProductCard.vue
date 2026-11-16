<script setup lang="ts">
// Catalogue card of a product: picture, category, name and starting price. A plain link, so
// it also gives crawlers an internal link when rendered on the server.
const props = defineProps<{
  product: {
    id: string | number
    slug: string
    name: string
    image?: string | null
    category?: { name?: string | null } | null
    additionals?: { price: number; is_active?: boolean }[] | null
  }
}>()

const STORAGE_URL = useRuntimeConfig().public.STORAGE_URL
const mediaUrl = useMediaUrl()
const broken = ref(false)

const minPrice = computed(() => {
  const prices = (props.product.additionals || [])
    .filter((a) => a?.is_active !== false)
    .map((a) => Number(a?.price) || 0)
    .filter((n) => n > 0)
  return prices.length ? Math.min(...prices) : 0
})
const formatPrice = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
</script>

<template>
  <article class="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-lg">
    <NuxtLink :to="`/product/${product.slug}`" class="flex flex-1 flex-col">
      <div class="relative aspect-square overflow-hidden bg-gray-50">
        <img
          v-if="product.image && !broken"
          :src="mediaUrl(product.image)"
          :alt="product.name"
          loading="lazy"
          class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          @error="broken = true"
        />
        <div v-else class="flex h-full w-full items-center justify-center text-4xl font-bold uppercase text-green-700/40">
          {{ product.name?.charAt(0) }}
        </div>
      </div>
      <div class="flex flex-1 flex-col p-3 sm:p-4">
        <p v-if="product.category?.name" class="truncate text-[11px] font-medium uppercase tracking-wide text-green-700 sm:text-xs">
          {{ product.category.name }}
        </p>
        <h3 class="mt-0.5 line-clamp-2 text-sm font-semibold text-gray-900 sm:text-base">{{ product.name }}</h3>
        <div class="mt-auto pt-2">
          <template v-if="minPrice > 0">
            <span class="block text-[11px] text-gray-500">{{ $t('app.productPage.startingFrom') }}</span>
            <span class="text-sm font-bold text-gray-900 sm:text-base">{{ formatPrice(minPrice) }}</span>
            <span class="text-xs text-gray-500">{{ $t('app.productPage.perPcs') }}</span>
          </template>
          <span v-else class="text-sm font-bold text-green-600">{{ $t('app.productPage.askNow') }}</span>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>
