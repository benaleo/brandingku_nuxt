<template>
  <div>
    <AppBreadcrumb />
    <AppTableHeader :pageTitle="pageTitle" :create-path="''" />
    <div class="max-w-3xl">
      <ProductCategoryForm v-if="!loading && detail" :isChild="true" :parentId="parentId" :hideSubCategories="true" :detail="detail" />
      <div v-else-if="loading" class="text-center py-4">Loading...</div>
      <div v-else class="text-center py-4 text-red-500">Failed to load detail</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '~/assets/css/tailwind.css' // Ensure Tailwind CSS is loaded
import AppBreadcrumb from '~/components/elements/AppBreadcrumb.vue'
import AppTableHeader from '~/components/elements/AppTableHeader.vue'
import ProductCategoryForm from '~/components/forms/ProductCategoryForm.vue'
import { useProductCategoryService } from '~/services/product-category.service'
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'


const route = useRoute()
const parentId = computed(() => Number(route.params.id))
const childId = computed(() => Number(route.params.childId))

const { getProductCategoryDetail } = useProductCategoryService({ autoFetchParents: false })
const detail = ref()
const loading = ref(false)

const pageTitle = computed(() => {
  return 'Edit Sub Kategori'
})

const loadDetail = async () => {
  loading.value = true
  try {
    detail.value = await getProductCategoryDetail(childId.value)
  } catch (e) {
    console.error('Failed to load child category detail', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadDetail)

useHead({
  title: pageTitle,
  meta: [
    { name: 'description', content: pageTitle }
  ]
})

definePageMeta({ layout: 'console-secret' })
</script>
