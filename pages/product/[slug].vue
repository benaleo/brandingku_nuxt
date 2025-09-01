<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProductDetail } from '~/composables/useProductDetail'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const { data: detail, loading, error, refetch, setSlug } = useProductDetail(slug.value)
const config = useRuntimeConfig()
const STORAGE_URL = config.public.STORAGE_URL

const selectedColor = ref<string>('')
const selectedSize = ref<string>('')

watch(detail, (v) => {
  if (!v) return
  if (!selectedColor.value && v.colors?.length) selectedColor.value = v.colors[0]
  if (!selectedSize.value && v.sizes?.length) selectedSize.value = v.sizes[0]
}, { immediate: true })

useHead(() => ({
  title: detail.value?.name ? `${detail.value.name} - Brandingku` : 'Product - Brandingku'
}))

// Handle same-route param changes
watch(slug, (val) => {
  setSlug(val)
  refetch()
})
</script>

<template>
  <div class="container px-4 py-8 md:py-12">
    <div v-if="loading" class="flex justify-center">Loading...</div>
    <div v-else-if="error" class="flex justify-center text-red-500">{{ error }}</div>

    <div v-else-if="detail" class="space-y-8">
      <!-- Breadcrumb -->
      <div class="text-sm text-gray-500">
        <NuxtLink to="/" class="hover:text-primary">Home</NuxtLink>
        <span class="mx-1">/</span>
        <span class="hover:text-primary">{{ detail.category || 'Product' }}</span>
        <span class="mx-1">/</span>
        <span class="text-primary">{{ detail.name }}</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <!-- Gallery -->
        <div>
          <AtomsProductThumbnail :images="detail.images.map((img: string) => `${STORAGE_URL}${img}`)" :class="'sticky top-20'" />
        </div>

        <!-- Info -->
        <div>
          <h1 class="text-2xl md:text-3xl font-bold tracking-tight">{{ detail.name }}</h1>
          <p v-if="detail.category" class="text-gray-500 mt-1">{{ detail.category }}</p>

          <!-- Price -->
          <div class="mt-6 flex items-center gap-3">
            <span class="text-3xl font-bold">${{ detail.price.toFixed(2) }}</span>
            <span v-if="detail.originalPrice" class="text-lg text-gray-500 line-through">
              ${{ detail.originalPrice.toFixed(2) }}
            </span>
          </div>

          <!-- Color -->
          <div v-if="detail.colors?.length" class="mt-8">
            <h3 class="text-sm font-medium mb-2">Color</h3>
            <div class="flex gap-2 flex-wrap">
              <button v-for="color in detail.colors" :key="color" @click="selectedColor = color"
                class="px-3 py-1.5 border rounded-full text-sm transition-all"
                :class="{ 'border-primary bg-primary/10 text-primary': color === selectedColor, 'border-gray-200 hover:border-gray-300': color !== selectedColor }">
                {{ color }}
              </button>
            </div>
          </div>

          <!-- Size -->
          <div v-if="detail.sizes?.length" class="mt-6">
            <h3 class="text-sm font-medium mb-2">Size</h3>
            <Select v-model="selectedSize">
              <SelectTrigger class="w-[180px]">
                <SelectValue placeholder="Select a size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="size in detail.sizes" :key="size" :value="size">
                  {{ size }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Add to Cart -->
          <div class="mt-8 flex items-center gap-6">
            <Button class="flex-1">Add to Cart</Button>
          </div>

          <!-- Stock Status -->
          <div class="mt-6 text-sm text-gray-500">
            <span v-if="detail.inStock">In stock and ready to ship</span>
            <span v-else>Out of stock</span>
          </div>

          <!-- Details -->
          <div v-if="detail.details?.length" class="mt-8 pt-6 border-t">
            <h3 class="font-medium mb-3">Specifications</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <div v-for="(kv, idx) in detail.details" :key="idx" class="flex justify-between border-b py-2">
                <span class="text-gray-500">{{ kv.key }}</span>
                <span class="font-medium">{{ kv.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
