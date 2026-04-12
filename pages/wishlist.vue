<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const router = useRouter()
const config = useRuntimeConfig()
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
  await deleteWishlist(productId)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-green-50 via-white to-white">
    <div class="app-container px-4 md:px-6 pt-28 pb-16">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-8">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-slate-900">Wishlist</h1>
          <p class="text-slate-600 mt-1">Produk favorit kamu, tersimpan rapi.</p>
        </div>
        <div class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border shadow-sm">
          <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg class="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </div>
          <span class="text-sm text-slate-700">{{ normalizedItems.length }} item</span>
        </div>
      </div>

      <div v-if="error" class="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">
        {{ error }}
      </div>

      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="n in 8" :key="n" class="bg-white border rounded-xl overflow-hidden animate-pulse">
          <div class="w-full aspect-square bg-gray-200"></div>
          <div class="p-4 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            <div class="h-9 bg-gray-200 rounded w-full mt-4"></div>
          </div>
        </div>
      </div>

      <div v-else-if="normalizedItems.length === 0" class="bg-white border rounded-xl p-10 text-center shadow-sm">
        <div class="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        </div>
        <p class="text-xl font-semibold text-slate-900">Wishlist kamu masih kosong</p>
        <p class="text-slate-600 mt-2">Yuk cari produk dan tambahkan ke wishlist.</p>
        <div class="mt-6">
          <Button class="bg-green-600 hover:bg-green-700" @click="router.push('/product')">Cari Produk</Button>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card
          v-for="it in normalizedItems"
          :key="it.product.id"
          class="group overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-lg transition-shadow"
        >
          <div class="relative aspect-square overflow-hidden bg-gray-100">
            <NuxtLink :to="`/product/${it.product.slug}`" class="block">
              <img
                :src="imageSrc(it.product.image)"
                :alt="it.product.name"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </NuxtLink>

            <button
              type="button"
              class="absolute top-3 right-3 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur border shadow-sm hover:bg-white"
              @click="handleRemove(it.product.id)"
              aria-label="Remove from wishlist"
            >
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <CardContent class="p-4">
            <NuxtLink :to="`/product/${it.product.slug}`" class="block">
              <p class="text-xs text-green-700 font-medium tracking-wide uppercase">
                {{ it.product.category?.name || 'Produk' }}
              </p>
              <h3 class="mt-1 font-semibold text-slate-900 line-clamp-2 group-hover:text-green-700 transition-colors">
                {{ it.product.name }}
              </h3>
            </NuxtLink>

            <div class="mt-4">
              <Button
                variant="outline"
                class="w-full border-green-200 text-green-700 hover:bg-green-50"
                @click="router.push(`/product/${it.product.slug}`)"
              >
                Lihat Detail
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
