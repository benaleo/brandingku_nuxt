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
      <div v-if="error" class="text-center py-4 text-red-500">
        {{ error }}
      </div>
      <div v-else>
        <DatatablesDataTable
            :columns="productColumns"
            :data="dataList"
            :loading="loading"
            :meta="tableMeta"
            :pagination="paginationData"
            @page-change="onPageChange"
            @limit-change="onLimitChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppBreadcrumb from "~/components/elements/AppBreadcrumb.vue"
import {productColumns} from '~/components/datatables/productColumns'
import {useProductService} from '~/services/product.service'
import {computed, ref, watch} from 'vue'
import {refDebounced} from '@vueuse/core'
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import {toast} from "vue-sonner";
import AppFilterTable from "~/components/elements/AppFilterTable.vue";
import type { ProductGallery } from "~/types/products.type";

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
} = useProductService(true)

// Filter options
const selectedCategory = ref<string | number | undefined>()
const keyword = ref<string>('')
const debouncedKeyword = refDebounced(keyword, 200)

// keyword filtering is client-side on the loaded page, so typing never triggers a refetch
const dataList = computed(() => {
  const list = datas.value || []
  const kw = debouncedKeyword.value.trim().toLowerCase()
  if (!kw) return list
  return list.filter((x: any) =>
    (x.name || '').toLowerCase().includes(kw) || (x.slug || '').toLowerCase().includes(kw)
  )
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

// Watch selectedCategory and trigger server-side filter (setParams already refetches via the service watcher)
watch(selectedCategory, (val: any) => {
  if (val === 'all' || val === undefined || val === '') {
    setParams({category: undefined})
  } else {
    setParams({category: val})
  }
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

const handleProductGalleries = async (id: string, createdGalleries: ProductGallery[], removeIds: string[]) => {
  try {
    const removed = new Set(removeIds.map(String))
    datas.value = (datas.value || []).map((product: any) => {
      if (String(product.id) !== String(id)) return product

      const existingGalleries = (product.galleries || []).filter((gallery: ProductGallery) => !removed.has(String(gallery.id)))
      const galleries = [...existingGalleries, ...createdGalleries].sort((a, b) => Number(a.orders) - Number(b.orders))
      const image = product.image || galleries[0]?.image || ''

      return {
        ...product,
        image,
        galleries,
      }
    })
  } catch (error) {
    console.error('Error updating product image:', error)
    toast.error('Gagal mengupdate gambar')
  }
}

// stable reference so typing in the search box doesn't re-render every table row
const tableMeta = { handleDelete, handleProductGalleries }

const pageTitle = 'Produk';

useHead({
  title: pageTitle,
})

definePageMeta({
  layout: 'console-secret'
})
</script>
