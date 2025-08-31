<template>
  <div>
    <!-- Breadcrumb -->
    <AppBreadcrumb/>

    <!-- Table Header -->
    <AppTableHeader :pageTitle="pageTitle" :create-path="'/console/secret/product-categories/add'"/>

    <!-- Filter -->
    <AppFilterTable v-model="keyword">
      <div class="flex-1">
      </div>
    </AppFilterTable>

    <!-- Data Table -->
    <div class="mt-2">
      <div v-if="loading" class="text-center py-4">
        Loading products...
      </div>
      <div v-else-if="error" class="text-center py-4 text-red-500">
        {{ error }}
      </div>
      <div v-if="!loading">
        <DatatablesDataTable
            :columns="productCategoryColumns"
            :data="productList || []"
            :pagination="pagination"
            :meta="{ handleDelete }"
            @page-change="onPageChange"
            @limit-change="onLimitChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppBreadcrumb from "~/components/elements/AppBreadcrumb.vue"
import {computed, ref, watch} from 'vue'
import {productCategoryColumns} from "~/components/datatables/productCategoryColumns";
import {useProductCategoryService} from "~/services/product-category.service";
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import {toast} from 'vue-sonner'
import AppFilterTable from "~/components/elements/AppFilterTable.vue";

const pageTitle = 'Produk Kategori'
const keyword = ref<string>('')
const isFetch = ref<boolean>(false)

const {
  datas,
  loading,
  error,
  pagination,
  changePage,
  changeLimit,
  deleteProductCategoryById,
  updateProductCategoryImage,
  setParams,
  reFetch
} = useProductCategoryService()

const productList = computed(() => {
  return datas.value || []
})

const onPageChange = (page: number) => {
  changePage(page)
}

const onLimitChange = (limit: number) => {
  changeLimit(limit)
}

const handleDelete = async (id: string) => {
  try {
    await deleteProductCategoryById(id)
    // Refresh the current page
    reFetch()
    toast.success('Berhasil menghapus data')
  } catch (error) {
    console.error('Error deleting product category:', error)
    toast.error('Gagal menghapus data')
  }
}

// Watch keyword to trigger search with minimum 3 characters
watch(keyword, (newValue: string) => {
  console.log('index.vue keyword changed:', newValue)
  if (newValue && newValue.length >= 3) {
    isFetch.value = true
    // If 3 or more characters, set keyword param
    setParams({keyword: newValue})
    reFetch()
  } else {
    // If less than 3 characters, clear keyword param
    if (isFetch.value) {
      setParams({keyword: undefined})
      reFetch()
      isFetch.value = false
    }
  }
})

useHead({
  title: pageTitle,
})

definePageMeta({
  layout: 'console-secret'
})
</script>