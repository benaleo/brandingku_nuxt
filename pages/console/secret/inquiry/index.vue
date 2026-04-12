<template>
  <div>
    <!-- Breadcrumb -->
    <AppBreadcrumb/>

    <!-- Table Header -->
    <AppTableHeader :pageTitle="pageTitle"/>

    <!-- Filter -->
    <AppFilterTable v-model="keyword"/>

    <!-- Table -->
    <div class="mt-6">
      <div v-if="loading" class="text-center py-4">
        <div class="grid grid-cols-2">
          <Skeleton />
        </div>
      </div>
      <div v-else-if="error" class="text-center py-4 text-red-500">
        {{ error }}
      </div>
      <div v-else-if="hasInquiries">
        <DatatablesDataTable
            :columns="inquiryColumns"
            :data="dataList || []"
            :pagination="paginationData"
            @page-change="onPageChange"
            @limit-change="onLimitChange"
        />
      </div>
      <div v-else class="text-center py-4">
        No inquiries found
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppBreadcrumb from "~/components/elements/AppBreadcrumb.vue"
import {inquiryColumns} from '~/components/datatables/inquiryColumns'
import {useWebContactService} from '~/services/web-contact.service'
import {computed, ref, watch} from 'vue'
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import AppFilterTable from "~/components/elements/AppFilterTable.vue";

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
} = useWebContactService(true)

const hasInquiries = computed(() => {
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
const keyword = ref<string>('')
const isFetch = ref<boolean>(false)

// Watch keyword to trigger search with minimum 3 characters
watch(keyword, (newValue: string) => {
  if (newValue && newValue.length >= 3) {
    isFetch.value = true
    setParams({keyword: newValue})
    reFetch()
  } else {
    if (isFetch.value) {
      setParams({keyword: undefined})
      reFetch()
      isFetch.value = false
    }
  }
})

const pageTitle = 'Inquiry';

useHead({
  title: pageTitle,
})

definePageMeta({
  layout: 'console-secret'
})
</script>
