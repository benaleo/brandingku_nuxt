<template>
  <div>
    <!-- Breadcrumb -->
    <AppBreadcrumb/>

    <!-- Table Header -->
    <AppTableHeader :pageTitle="pageTitle" :create-path="'/console/secret/landing-page/client/add'"/>

    <!-- Filter -->
    <AppFilterTable v-model="keyword">
      <div class="flex-1">
      </div>
    </AppFilterTable>

    <!-- Data Table -->
    <div class="mt-2">
      <div v-if="loading" class="text-center py-4">
        Loading clients...
      </div>
      <div v-else-if="error" class="text-center py-4 text-red-500">
        {{ error }}
      </div>
      <div v-if="!loading">
        <DatatablesDataTable
            :columns="clientColumns"
            :data="clientList || []"
            :pagination="paginationData"
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
import {clientColumns} from "~/components/datatables/clientColumns";
import {useClientService} from "~/services/client.service";
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import {toast} from 'vue-sonner'
import AppFilterTable from "~/components/elements/AppFilterTable.vue";

const pageTitle = 'Client'
const keyword = ref<string>('')
const isFetch = ref<boolean>(false)

const {
  datas,
  loading,
  error,
  pagination,
  changePage,
  changeLimit,
  deleteClientById,
  updateClientImage,
  setParams,
  reFetch
} = useClientService()

const clientList = computed(() => {
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

const handleDelete = async (id: string) => {
  try {
    await deleteClientById(id)
    // Refresh the current page
    reFetch()
    toast.success('Berhasil menghapus data')
  } catch (error) {
    console.error('Error deleting client:', error)
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