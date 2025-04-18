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
            :meta="{ handleDelete, handleImageUpdate }"
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
  deleteProductCategoryById,
  updateProductCategoryImage,
  reFetch
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

const handleImageUpdate = async (id: string, file: File) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    await updateProductCategoryImage(id, formData)
    
    toast.success('Berhasil mengupdate gambar')
    await reFetch()
  } catch (error) {
    console.error('Error updating product category image:', error)
    toast.error('Gagal mengupdate gambar')
  }
}

useHead({
  title: pageTitle,
})

definePageMeta({
  layout: 'console-secret'
})
</script>