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
// variant is taken from additional name
const selectedVariantName = ref<string>('')

// compute selected additional by name
const selectedAdditional = computed(() => {
  const adds = detail.value?.additionals || []
  return adds.find(a => a.name === selectedVariantName.value)
})

// helpers
const formatIDR = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0)

const displayedPrice = computed(() => {
  const a = selectedAdditional.value
  if (!a) return detail.value ? detail.value.price : 0
  const base = Number(a.price) || 0
  const disc = Number(a.discount) || 0
  let final = base
  if (disc > 0) {
    final = (String(a.discount_type).toUpperCase() === 'PERCENTAGE')
      ? base - (base * disc) / 100
      : base - disc
  }
  return Math.max(0, Math.floor(final))
})

const displayedOriginal = computed(() => {
  const a = selectedAdditional.value
  if (!a) return detail.value?.originalPrice || null
  const base = Number(a.price) || 0
  const disc = Number(a.discount) || 0
  if (disc <= 0) return null
  const final = (String(a.discount_type).toUpperCase() === 'PERCENTAGE')
    ? base - (base * disc) / 100
    : base - disc
  return final < base ? Math.floor(base) : null
})

const displayedStock = computed(() => selectedAdditional.value ? Number(selectedAdditional.value.stock) || 0 : (detail.value?.inStock ? 1 : 0))
const displayedMoq = computed(() => selectedAdditional.value ? Number(selectedAdditional.value.moq) || 0 : null)
const displayedDiscountInfo = computed(() => {
  const a = selectedAdditional.value
  if (!a) return null
  const disc = Number(a.discount) || 0
  if (disc <= 0) return null
  const type = String(a.discount_type).toUpperCase()
  return type === 'PERCENTAGE' ? `${disc}%` : formatIDR(disc)
})

// derive attributes/colors for the selected variant
const variantAttributes = computed<{ key: string; value: string }[] | null>(() => {
  const a = selectedAdditional.value
  if (!a || !a.attributes) return null
  try {
    const parsed = JSON.parse(a.attributes)
    if (!Array.isArray(parsed)) return null
    return parsed
      .filter((it: any) => it && typeof it.key === 'string' && typeof it.value === 'string')
      .map((it: any) => ({ key: it.key, value: it.value }))
  } catch {
    return null
  }
})

const variantColors = computed<string[] | null>(() => {
  const attrs = variantAttributes.value
  if (!attrs) return null
  const colorValues = attrs
    .filter(kv => /color/i.test(kv.key))
    .flatMap(kv => kv.value.split(',').map(s => s.trim()).filter(Boolean))
  const unique = Array.from(new Set(colorValues))
  return unique.length ? unique : null
})

watch(detail, (v) => {
  if (!v) return
  if (!selectedColor.value && v.colors?.length) selectedColor.value = v.colors[0]
  // default variant: first additional name
  if (!selectedVariantName.value && (v.additionals?.length || 0) > 0) {
    selectedVariantName.value = v.additionals![0].name
  }
}, { immediate: true })

// when variant changes, adjust selectedColor to first variant color if available
watch(selectedVariantName, () => {
  if (variantColors.value && variantColors.value.length) {
    selectedColor.value = variantColors.value[0]
  }
})

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
  <div class="container md:pt-28 px-4 py-8 md:py-12">
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
            <span class="text-3xl font-bold">{{ formatIDR(displayedPrice) }}</span>
            <span v-if="displayedOriginal" class="text-lg text-gray-500 line-through">
              {{ formatIDR(displayedOriginal as number) }}
            </span>
          </div>

          <!-- Color (depends on selected variant) -->
          <div v-if="(variantColors && variantColors.length) || (detail.colors?.length)" class="mt-8">
            <h3 class="text-sm font-medium mb-2">Color</h3>
            <div class="flex gap-2 flex-wrap">
              <button v-for="color in (variantColors && variantColors.length ? variantColors : detail.colors)" :key="color" @click="selectedColor = color"
                class="px-3 py-1.5 border rounded-full text-sm transition-all"
                :class="{ 'border-primary bg-primary/10 text-primary': color === selectedColor, 'border-gray-200 hover:border-gray-300': color !== selectedColor }">
                {{ color }}
              </button>
            </div>
          </div>

          <!-- Variant (from additional name) -->
          <div v-if="detail.additionals?.length" class="mt-6">
            <h3 class="text-sm font-medium mb-2">Variant</h3>
            <Select v-model="selectedVariantName">
              <SelectTrigger class="w-[220px]">
                <SelectValue placeholder="Select a variant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="a in detail.additionals" :key="a.id" :value="a.name">
                  {{ a.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <div class="mt-3 text-sm text-gray-700 space-y-1">
              <div><span class="text-gray-500">Stock:</span> <span class="font-medium">{{ displayedStock }}</span></div>
              <div v-if="displayedMoq != null"><span class="text-gray-500">MOQ:</span> <span class="font-medium">{{ displayedMoq }}</span></div>
              <div v-if="displayedDiscountInfo"><span class="text-gray-500">Discount:</span> <span class="font-medium">{{ displayedDiscountInfo }}</span></div>
            </div>
          </div>

          <!-- Add to Cart -->
          <div class="mt-8 flex items-center gap-6">
            <Button class="flex-1">Add to Cart</Button>
          </div>

          <!-- Stock Status -->
          <div class="mt-6 text-sm text-gray-500">
            <span v-if="displayedStock > 0">In stock and ready to ship</span>
            <span v-else>Out of stock</span>
          </div>

          <!-- Description -->
          <div v-if="detail.description" class="mt-8">
            <h3 class="font-medium mb-3">Description</h3>
            <div v-html="detail.description" class="prose prose-stone prose-a:text-primary prose-a:no-underline prose-a:hover:underline"></div>
          </div>

          <!-- Details (Specifications depend on selected variant) -->
          <div v-if="(variantAttributes && variantAttributes.length) || detail.details?.length" class="mt-8 pt-6 border-t">
            <h3 class="font-medium mb-3">Specifications</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <div v-for="(kv, idx) in (variantAttributes && variantAttributes.length ? variantAttributes : detail.details)" :key="idx" class="flex justify-between border-b py-2">
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
