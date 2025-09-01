<script setup lang="ts">
// UI components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'

// Data/composables
import { useProductList } from '~/composables/useProductList'
import { useProductCategoryService } from '~/services/product-category.service'
import { useGql } from '~/composables/useGql'

const router = useRouter()
const config = useRuntimeConfig()
const STORAGE_URL = config.public.STORAGE_URL

// Products with name filter
const { products, filteredByName, keyword, setKeyword } = useProductList()

// Categories: fetch all (parents + children)
const { gqlFetch } = useGql()
const categoriesAll = ref<any[]>([])
const categoriesLoading = ref(false)
const categoriesError = ref<string | null>(null)

const fetchAllCategories = async () => {
  categoriesLoading.value = true
  categoriesError.value = null
  try {
    const query = `
      query getProductCategories($only_parent: Boolean) {
        getProductCategories(only_parent: $only_parent) {
          id
          name
          slug
          description
          image
          is_landing_page
          is_active
          created_at
          updated_at
          parent_id
        }
      }
    `
    const res = await gqlFetch<{ getProductCategories: any[] }>(query, { only_parent: false }, { auth: true })
    categoriesAll.value = res?.getProductCategories || []
  } catch (e: any) {
    categoriesError.value = e?.message || 'Failed to load categories'
  } finally {
    categoriesLoading.value = false
  }
}

onMounted(() => { fetchAllCategories() })

const parentCategories = computed(() => (categoriesAll.value || []).filter((c: any) => c?.parent_id == null))
const childrenMap = computed<Record<number, any[]>>(() => {
  const map: Record<number, any[]> = {}
  for (const c of categoriesAll.value || []) {
    if (c?.parent_id != null) {
      const pid = Number(c.parent_id)
      if (!map[pid]) map[pid] = []
      map[pid].push(c)
    }
  }
  return map
})

// Selection: either a specific child category or a parent (show all its children + itself)
const selectedCategoryId = ref<number | null>(null)
const selectedParentId = ref<number | null>(null)

// Compute filtered products by category, on top of name filtering
const filteredProducts = computed(() => {
  const list = filteredByName.value as any[]
  // Child category selected
  if (selectedCategoryId.value != null) {
    return list.filter(p => Number(p?.category?.id) === Number(selectedCategoryId.value))
  }
  // Parent selected: include parent + its children
  if (selectedParentId.value != null) {
    const pid = Number(selectedParentId.value)
    const children = childrenMap.value[pid] || []
    const allowed = new Set<number>([pid, ...children.map((c: any) => Number(c.id))])
    return list.filter(p => allowed.has(Number(p?.category?.id)))
  }
  // All
  return list
})

// Helper: min price from additionals
const productMinPrice = (p : any) => {
  const adds = Array.isArray(p?.additionals) ? p.additionals : []
  const prices = adds.map((a : any) => Number(a?.price) || 0)
  if (!prices.length) return 0
  return Math.min(...prices)
}

const viewProductDetail = (slug : string) => {
  router.push(`/product/${slug}`)
}

const sortOptions = [
  { value: 'popular', label: 'Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' }
]

const pageTitle = computed(() => `Brandingku Products`)

useHead({ title: pageTitle })

definePageMeta({ layout: 'page-layout' })

</script>

<template>
  <!-- Header -->
  <HeaderProduct :title="pageTitle" />

  <!-- Content -->
  <main class="app-container my-12 flex gap-4">
    <div class="min-w-48 bg-slate-200 h-fit rounded-md py-4 px-2 mt-18 sticky top-30">
      <ul class="space-y-2">
        <li>
          <button
            class="block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            :class="{ 'bg-gray-100': selectedParentId === null && selectedCategoryId === null }"
            @click="selectedParentId = null; selectedCategoryId = null"
          >
            All
          </button>
        </li>
        <li v-for="parent in parentCategories" :key="parent.id" class="relative">
          <button
            class="block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            :class="{ 'bg-gray-100': selectedParentId === Number(parent.id) && selectedCategoryId === null }"
            @click="selectedParentId = Number(parent.id); selectedCategoryId = null"
          >
            {{ parent.name }}
          </button>
          <ul v-if="(childrenMap[parent.id] || []).length" class="mt-1 ml-4 space-y-1">
            <li v-for="child in childrenMap[parent.id]" :key="child.id">
              <button
                class="block w-full px-3 py-1.5 text-left text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded"
                :class="{ 'bg-gray-100': selectedCategoryId === Number(child.id) }"
                @click="selectedCategoryId = Number(child.id); selectedParentId = null"
              >
                {{ child.name }}
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    
    <div class="">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 class="text-3xl font-bold">Daftar Produk</h1>
        <div class="flex items-center gap-4">
          <Input class="w-[260px]" placeholder="Cari produk..." v-model="keyword" />
          <span class="text-sm text-gray-500">Sort by:</span>
          <Select>
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Popular" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="option in sortOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <Card v-for="product in filteredProducts" :key="product.id" class="group overflow-hidden">
        <div class="relative aspect-square overflow-hidden">
          <img :src="STORAGE_URL + product.image" :alt="product.name"
            class="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" />
          <div
            class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button variant="outline"
              class="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all"
              @click="viewProductDetail(product.slug)">
              Quick View
            </Button>
          </div>
        </div>
        <CardContent class="p-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-medium">{{ product.name }}</h3>
              <p class="text-sm text-gray-500">{{ product.category?.name }}</p>
            </div>
          </div>
          <div class="mt-4 flex justify-between items-center">
            <span class="font-bold">Rp. {{ productMinPrice(product) }} <span class="text-sm text-gray-500">/pcs</span></span>
            <Button variant="outline" size="sm">Add to Cart</Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="mt-12 flex justify-center">
      <div class="flex gap-2">
        <Button variant="outline">1</Button>
        <Button variant="outline">2</Button>
        <Button variant="outline">3</Button>
        <Button variant="outline">Next</Button>
      </div>
    </div>
    </div>
  </main>

  <!-- footer -->
  <ElementsFooter />
</template>