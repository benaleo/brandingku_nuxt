<template>
  <div>
    <!-- Breadcrumb -->
    <AppBreadcrumb/>

    <!-- Table Header -->
    <AppTableHeader :pageTitle="pageTitle" :create-path="'/console/secret/product-attributes/add'"/>

    <!-- Filter -->
    <AppFilterTable v-model="keyword">
      <div class="flex-1">
        <FieldXSelectSimple label="Kategori" name="category" :options="categoryOptions" placeholder="Pilih Kategori" v-model="selectedCategory"/>
      </div>
    </AppFilterTable>

    <!-- Table -->
    <div class="mt-2">
      <div v-if="loading" class="text-center py-4">
        Loading products...
      </div>
      <div v-else-if="error" class="text-center py-4 text-red-500">
        {{ error }}
      </div>
      <div v-if="!loading">
        <DatatablesDataTable :columns="productAttributeColumns" :data="dataList || []" :pagination="pagination"
                             :meta="{ handleDelete }" @page-change="onPageChange" @limit-change="onLimitChange"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {OptionType} from '~/types/options.type'
import {computed, ref, watch} from 'vue'
import AppBreadcrumb from "~/components/elements/AppBreadcrumb.vue"
import {productAttributeColumns} from "~/components/datatables/productAttributeColumns";
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import {toast} from 'vue-sonner'
import {useProductAttributeService} from '@/services/product-attribute.service';
import FieldXSelectSimple from "~/components/forms/fields/FieldXSelectSimple.vue";
// Import useOptionsService and fetch all product attributes for category options
import {useOptionsService} from '@/services/options.service';
import FieldXSearch from '~/components/forms/fields/FieldXSearch.vue';
import AppFilterTable from "~/components/elements/AppFilterTable.vue";

const pageTitle = 'Produk Attribute'

const {
  datas,
  loading,
  error,
  pagination,
  changePage,
  changeLimit,
  deleteProductAttributeById,
  setParams,
  refetch
} = useProductAttributeService(true)

const dataList = computed(() => {
  const result = Array.isArray(datas.value) ? datas.value : [datas.value]
  console.log('dataList:', result)
  return result
})

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

const {getProductAttributes} = useOptionsService();

const categoryOptions = computed<OptionType[]>(() => allAttributeCategories.value);
// Watch keyword to trigger search with minimum 3 characters
watch(keyword, (newValue: string) => {
  console.log('index.vue keyword changed:', newValue)
  if (newValue && newValue.length >= 3) {
    isFetch.value = true
    // If 3 or more characters, set keyword param
    setParams({keyword: newValue})
    refetch()
  } else {
    // If less than 3 characters, clear keyword param
    if (isFetch.value) {
      setParams({keyword: undefined})
      refetch()
      isFetch.value = false
    }
  }
})

const allAttributeCategories = ref<OptionType[]>([]);
// Fetch all attribute categories
getProductAttributes().then((attributes) => {
  const seen = new Set<string>();
  const arr = attributes
      .filter(item => item && typeof item.category === 'string')
      .map(item => item.category)
      .filter(cat => !seen.has(cat) && seen.add(cat))
      .map(cat => ({id: cat, label: cat}));
  allAttributeCategories.value = [{id: 'all', label: 'All'}, ...arr];
});

// Watch categoryOptions and loading
watch(
    [categoryOptions, loading],
    ([options, isLoading]) => {
      console.log('Watcher triggered. loading:', isLoading, 'categoryOptions:', options, 'selectedCategory:', selectedCategory.value)
      if (!isLoading && options.length > 0 && (selectedCategory.value === undefined || selectedCategory.value === '')) {
        selectedCategory.value = options[0].id
        console.log('Auto-selected category:', selectedCategory.value)
      }
    },
    {immediate: true}
)

// Watch selectedCategory and trigger server-side filter
watch(selectedCategory, (val: any) => {
  console.log('selectedCategory changed:', val)
  if (val === 'all' || val === undefined || val === '') {
    setParams({category: undefined}) // Remove category param to show all
  } else {
    setParams({category: val})
  }
  refetch()
})


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