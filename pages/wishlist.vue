<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const router = useRouter()
const { t } = useI18n()
const config = useRuntimeConfig()

useHead(() => ({ title: t('app.wishlistPage.metaTitle') }))
const STORAGE_URL = config.public.STORAGE_URL

const { token, items, loading, error, fetchWishlists, deleteWishlist } = useWishlist()

const ensureLoggedIn = () => {
  if (!token.value) {
    router.push('/console/auth')
    return false
  }
  return true
}

onMounted(async () => {
  if (!ensureLoggedIn()) return
  await fetchWishlists()
})

watch(token, async (val) => {
  if (!val) {
    router.push('/console/auth')
    return
  }
  await fetchWishlists()
})

const normalizedItems = computed(() => {
  return (items.value || []).filter((it) => it?.product?.id)
})

const imageSrc = (image: string | null) => {
  if (!image) return '/images/no-image.jpg'
  if (image.startsWith('http') || image.startsWith('data:')) return image
  return `${STORAGE_URL}${image}`
}

const handleRemove = async (productId: number) => {
  if (!ensureLoggedIn()) return
  try {
    // the item disappears at once; it comes back if the request fails
    await deleteWishlist(productId)
  } catch {
    toast.error(t('app.wishlistPage.removeFailed'))
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-green-50 via-white to-white">
    <div class="app-container px-4 md:px-6 pt-28 pb-16">
      <div class="mb-6 flex items-end justify-between gap-3">
        <div class="min-w-0">
          <h1 class="text-2xl md:text-3xl font-bold text-slate-900">{{ $t('app.wishlistPage.title') }}</h1>
          <p class="mt-1 text-sm text-slate-600 md:text-base">{{ $t('app.wishlistPage.subtitle') }}</p>
        </div>
        <span class="shrink-0 rounded-full border bg-white px-3 py-1 text-sm text-slate-700 shadow-sm">
          {{ $t('app.wishlistPage.count', { count: normalizedItems.length }, normalizedItems.length) }}
        </span>
      </div>

      <div v-if="error" class="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">
        {{ error }}
      </div>

      <!-- list rows on phones, compact cards from sm up -->
      <ul v-if="loading" class="flex flex-col gap-2 sm:grid sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        <li v-for="n in 6" :key="n" class="flex items-center gap-3 rounded-xl border bg-white p-2 animate-pulse sm:flex-col sm:items-stretch sm:gap-0 sm:p-0 sm:overflow-hidden">
          <div class="size-16 shrink-0 rounded-lg bg-gray-200 sm:aspect-square sm:size-auto sm:w-full sm:rounded-none"></div>
          <div class="flex-1 space-y-2 sm:p-3">
            <div class="h-3 w-1/2 rounded bg-gray-200"></div>
            <div class="h-4 w-3/4 rounded bg-gray-200"></div>
          </div>
        </li>
      </ul>

      <div v-else-if="normalizedItems.length === 0" class="mx-auto max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
        <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-green-100">
          <svg class="size-7 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        </div>
        <p class="text-lg font-semibold text-slate-900">{{ $t('app.wishlistPage.emptyTitle') }}</p>
        <p class="mt-2 text-sm text-slate-600">{{ $t('app.wishlistPage.emptyText') }}</p>
        <div class="mt-6">
          <Button class="bg-green-600 hover:bg-green-700" @click="router.push('/product')">{{ $t('app.wishlistPage.browse') }}</Button>
        </div>
      </div>

      <ul v-else class="flex flex-col gap-2 sm:grid sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        <li v-for="it in normalizedItems" :key="it.product.id" class="relative">
          <!-- the whole card opens the product; delete sits outside the link -->
          <NuxtLink
            :to="`/product/${it.product.slug}`"
            class="group flex items-center gap-3 rounded-xl border bg-white p-2 pr-14 shadow-sm transition hover:border-green-200 hover:shadow-md sm:h-full sm:flex-col sm:items-stretch sm:gap-0 sm:overflow-hidden sm:p-0"
          >
            <div class="size-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:aspect-square sm:size-auto sm:w-full sm:rounded-none">
              <img
                :src="imageSrc(it.product.image)"
                :alt="it.product.name"
                loading="lazy"
                class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div class="min-w-0 flex-1 sm:p-3">
              <p class="truncate text-[11px] font-medium uppercase tracking-wide text-green-700">
                {{ it.product.category?.name || $t('app.wishlistPage.productFallback') }}
              </p>
              <h3 class="truncate text-sm font-semibold text-slate-900 group-hover:text-green-700 sm:mt-0.5 sm:line-clamp-2 sm:whitespace-normal">
                {{ it.product.name }}
              </h3>
            </div>
          </NuxtLink>
          <button
            type="button"
            class="absolute right-2 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-red-600 hover:bg-red-50 sm:top-2 sm:size-8 sm:translate-y-0 sm:border sm:bg-white/90 sm:shadow-sm sm:backdrop-blur"
            :aria-label="$t('app.wishlistPage.remove')"
            @click="handleRemove(it.product.id)"
          >
            <Trash2 class="size-4" />
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
