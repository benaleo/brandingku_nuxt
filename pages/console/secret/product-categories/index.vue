<template>
  <div>
    <AppBreadcrumb/>
    <div class="mt-6">
      <div v-if="loading" class="text-center py-4">
        Loading products...
      </div>
      <div v-else-if="error" class="text-center py-4 text-red-500">
        {{ error }}
      </div>
      <div v-else-if="hasProducts">
        <AppTableHeader :pageTitle="pageTitle" :create-path="'/console/secret/product-categories/add'"/>
        <DatatablesDataTable
            :columns="productCategoryColumns"
            :data="productList || []"
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
import {computed} from 'vue'
import {productCategoryColumns} from "~/components/datatables/productCategoryColumns";
import {useProductCategoryService} from "~/services/product-category.service";
import AppTableHeader from "~/components/elements/AppTableHeader.vue";

const {
  datas,
  loading,
  error,
  pagination,
  changePage,
  changeLimit
} = useProductCategoryService()

const hasProducts = computed(() => {
  return Array.isArray(datas.value) && datas.value.length > 0
})

const productList = computed(() => {
  return datas.value || []
})

const paginationData = computed(() => ({
  page: pagination.value.page,
  limit: pagination.value.limit,
  total: pagination.value.total
}))

const onPageChange = (page: number) => {
  changePage(page)
}

const onLimitChange = (limit: number) => {
  changeLimit(limit)
}

const pageTitle = 'Produk Kategori'

useHead({
  title: pageTitle,
})

definePageMeta({
  layout: 'console-secret'
})
</script>