<template>
  <div>
    <!-- Breadcrumb -->
    <AppBreadcrumb/>

    <!-- Table Header -->
    <AppTableHeader :pageTitle="pageTitle" :create-path="'/console/secret/products/add'"/>

    <!-- Filter -->
    <AppFilterTable v-model="keyword">
      <div class="flex-1">
        <!-- <FieldXSelectSimple label="Kategori" name="category" :options="categoryOptions" placeholder="Pilih Kategori" v-model="selectedCategory"/> -->
      </div>
    </AppFilterTable>


    <!-- Table -->
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
            :data="dataList || []"
            :meta="{ handleDelete, handleProductGalleries }"
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
import {computed, ref, watch} from 'vue'
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import {toast} from "vue-sonner";
import AppFilterTable from "~/components/elements/AppFilterTable.vue";
import FieldXSelectSimple from "~/components/forms/fields/FieldXSelectSimple.vue";

const {
  datas,
  loading,
  error,
  pagination,
  changePage,
  changeLimit,
  reFetch,
  setParams,
  params,
  deleteProductById,
  updateProductGalleries,
} = useProductService(true)

const hasProducts = computed(() => {
  return Array.isArray(datas.value) && datas.value.length > 0
})

const dataList = computed(() => {
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

// Filter options
const selectedCategory = ref<string | number | undefined>()
const keyword = ref<string>('')
const isFetch = ref<boolean>(false)

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

// Watch selectedCategory and trigger server-side filter
watch(selectedCategory, (val: any) => {
  console.log('selectedCategory changed:', val)
  if (val === 'all' || val === undefined || val === '') {
    setParams({category: undefined}) // Remove category param to show all
  } else {
    setParams({category: val})
  }
  reFetch()
})

const handleDelete = async (id: string) => {
  try {
    await deleteProductById(id)
    // Refresh the current page
    reFetch()
    toast.success('Berhasil menghapus data')
  } catch (error) {
    console.error('Error deleting product category:', error)
    toast.error('Gagal menghapus data')
  }
}

const handleProductGalleries = async (id: string, fileUrl: string[], removeIds: string[]) => {
  try {
    await updateProductGalleries(id, {
      newFileUrl: fileUrl,
      removeIds: removeIds
    })

    console.log("payload", {
      newFileUrl: fileUrl,
      removeIds: removeIds
    })

    toast.success('Berhasil mengupdate gambar')
    await reFetch()
  } catch (error) {
    console.error('Error updating product image:', error)
    toast.error('Gagal mengupdate gambar')
  }
}

const pageTitle = 'Produk';

useHead({
  title: pageTitle,
})

definePageMeta({
  layout: 'console-secret'
})
</script>