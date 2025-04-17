<template>
  <div>
    <AppBreadcrumb/>
    <h1 class="text-2xl font-bold mt-4">Produk</h1>

    <div class="mt-6">
      <div v-if="loading" class="text-center py-4">
        Loading products...
      </div>
      <div v-else-if="error" class="text-center py-4 text-red-500">
        {{ error }}
      </div>
      <div v-else-if="hasProducts">
        <DatatablesDataTable
            :columns="productColumns"
            :data="productList"
            :pagination="paginationData"
            @page-change="onPageChange"
            @limit-change="onLimitChange"
        />
      </div>
      <div v-else class="text-center py-4">
        No products found
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppBreadcrumb from "~/components/elements/AppBreadcrumb.vue"
import {productColumns} from '~/components/datatables/productColumns'
import {useProductService} from '~/services/product.service'
import {computed} from 'vue'

const {
  products,
  loading,
  error,
  pagination,
  changePage,
  changeLimit
} = useProductService()

const hasProducts = computed(() => {
  return Array.isArray(products.value) && products.value.length > 0
})

const productList = computed(() => {
  return products.value || []
})

const paginationData = computed(() => ({
  page: pagination.value.page,
  limit: pagination.value.limit,
  total: pagination.value.total
}))

const onPageChange = (page) => {
  changePage(page)
}

const onLimitChange = (limit) => {
  changeLimit(limit)
}

definePageMeta({
  layout: 'console-secret'
})
</script>