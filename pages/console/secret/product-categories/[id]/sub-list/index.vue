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
      <div v-if="loading" class="text-center py-4">Loading child categories...</div>
      <div v-else-if="error" class="text-center py-4 text-red-500">{{ error }}</div>
      <div v-if="!loading">
        <DatatablesDataTable
          :columns="productCategoryChildColumns"
          :data="filteredChildren || []"
          :meta="{ handleDelete }"
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
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductCategoryService } from '~/services/product-category.service'

const route = useRoute()
const parentId = Number(route.params.id)
const basePath = computed(() => `/console/secret/product-categories/${parentId}/sub-list`)
const pageTitle = 'Child Categories'

const { getChildCategoriesByParentId, deleteProductCategoryById } = useProductCategoryService()

const loading = ref(false)
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
})

definePageMeta({
  layout: 'console-secret',
})
</script>
