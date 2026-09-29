<template>
  <div>
    <!-- Breadcrumb -->
    <AppBreadcrumb />

    <!-- Header -->
    <AppTableHeader :pageTitle="pageTitle" :create-path="`${basePath}/add`" />

    <!-- Filter -->
    <AppFilterTable v-model="keyword">
      <div class="flex-1"></div>
    </AppFilterTable>

    <!-- Data Table -->
    <div class="mt-2">
      <div v-if="error" class="text-center py-4 text-red-500">{{ error }}</div>
      <div v-else>
        <DatatablesDataTable
          :columns="productCategoryChildColumns"
          :data="pagedChildren"
          :loading="loading"
          :meta="{ handleDelete }"
          :pagination="pagination"
          @page-change="onPageChange"
          @limit-change="onLimitChange"
        />
      </div>
    </div>
  </div>
  </template>

<script setup lang="ts">
import AppBreadcrumb from '~/components/elements/AppBreadcrumb.vue'
import AppTableHeader from '~/components/elements/AppTableHeader.vue'
import AppFilterTable from '~/components/elements/AppFilterTable.vue'
import { productCategoryChildColumns } from '~/components/datatables/productCategoryChildColumns'
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProductCategoryService } from '~/services/product-category.service'

const route = useRoute()
const parentId = Number(route.params.id)
const basePath = computed(() => `/console/secret/product-categories/${parentId}/sub-list`)
const pageTitle = 'Sub Kategori'

const { getChildCategoriesByParentId, deleteProductCategoryById } = useProductCategoryService()

const loading = ref(true)
const error = ref<string | null>(null)
const keyword = ref('')
const children = ref<any[]>([])

const fetchChildren = async () => {
  loading.value = true
  error.value = null
  try {
    children.value = await getChildCategoriesByParentId(parentId, false)
  } catch (e: any) {
    console.error('[child-list] fetch error:', e)
    error.value = e?.message || 'Failed to load child categories'
  } finally {
    loading.value = false
  }
}

const filteredChildren = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return children.value
  return children.value.filter((x: any) =>
    (x.name || '').toLowerCase().includes(kw) || (x.slug || '').toLowerCase().includes(kw)
  )
})

// Backend returns all children at once, so pagination is done client-side here.
const page = ref(0)
const limit = ref(10)

const pagination = computed(() => ({
  page: page.value,
  limit: limit.value,
  total: filteredChildren.value.length,
}))

const pagedChildren = computed(() => {
  const start = page.value * limit.value
  return filteredChildren.value.slice(start, start + limit.value)
})

const onPageChange = (newPage: number) => {
  page.value = newPage
}

const onLimitChange = (newLimit: number) => {
  limit.value = newLimit
  page.value = 0
}

watch(keyword, () => {
  page.value = 0
})

const handleDelete = async (id: string) => {
  try {
    await deleteProductCategoryById(id)
    await fetchChildren()
  } catch (e) {
    console.error('[child-list] delete error:', e)
  }
}

onMounted(fetchChildren)

useHead({
  title: pageTitle,
  meta: [
    { name: 'description', content: pageTitle }
  ]
})

definePageMeta({
  layout: 'console-secret',
})
</script>
