<template>
  <div>
    <AppBreadcrumb/>
    <AppTableHeader :pageTitle="pageTitle" :create-path="'/console/secret/product-categories/add'"/>
    <div class="mt-6">
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
import {computed} from 'vue'
import {productCategoryColumns} from "~/components/datatables/productCategoryColumns";
import {useProductCategoryService} from "~/services/product-category.service";
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import {toast} from 'vue-sonner'

const pageTitle = 'Produk Kategori'

const {
  datas,
  loading,
  error,
  pagination,
  changePage,
  changeLimit,
  deleteProductCategoryById
} = useProductCategoryService(true)

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
    window.location.href = '/console/secret/product-categories'
    toast.success('Berhasil menghapus data')
  } catch (error) {
    console.error('Error deleting product category:', error)
    toast.error('Gagal menghapus data')
  }
}

useHead({
  title: pageTitle,
})

definePageMeta({
  layout: 'console-secret'
})
</script>