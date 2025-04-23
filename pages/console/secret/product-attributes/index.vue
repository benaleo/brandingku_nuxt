<template>
  <div>
    <AppBreadcrumb/>
    <AppTableHeader :pageTitle="pageTitle" :create-path="'/console/secret/product-attributes/add'"/>
    <div class="mt-6">
      <div v-if="loading" class="text-center py-4">
        Loading products...
      </div>
      <div v-else-if="error" class="text-center py-4 text-red-500">
        {{ error }}
      </div>
      <div v-if="!loading">
        <DatatablesDataTable
            :columns="productAttributeColumns"
            :data="dataList || []"
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
import {productAttributeColumns} from "~/components/datatables/productAttributeColumns";
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import {toast} from 'vue-sonner'
import {useProductAttributeService} from '@/services/product-attribute.service';

const pageTitle = 'Produk Attribute'

const {
  datas,
  loading,
  error,
  pagination,
  changePage,
  changeLimit,
  deleteProductAttributeById
} = useProductAttributeService(true)

const dataList = computed(() => {
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
    await deleteProductAttributeById(id)
    // Refresh the current page
    window.location.href = '/console/secret/product-attributes'
    toast.success('Berhasil menghapus data')
  } catch (error) {
    console.error('Error deleting product attribute:', error)
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