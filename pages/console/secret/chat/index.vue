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
      <div v-if="error" class="text-center py-4 text-red-500">
        {{ error }}
      </div>
      <div v-else>
        <DatatablesDataTable
            :columns="chatSessionColumns"
            :data="dataList || []"
            :loading="loading"
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
import {chatSessionColumns} from '~/components/datatables/chatSessionColumns'
import {useChatAdminService} from '~/services/chat-admin.service'
import {computed, ref, watch} from 'vue'
import {refDebounced} from '@vueuse/core'
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import AppFilterTable from "~/components/elements/AppFilterTable.vue";

const {
  datas,
  loading,
  error,
  pagination,
  changePage,
  changeLimit,
  setParams,
  reFetch,
} = useChatAdminService(true)

// the keyword is searched by the API across every session, not only the loaded page
const dataList = computed(() => datas.value || [])

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

const keyword = ref<string>('')
const debouncedKeyword = refDebounced(keyword, 300)
watch(debouncedKeyword, (value) => {
  pagination.value.page = 0
  setParams({ keyword: value.trim() || undefined })
  reFetch()
})

const pageTitle = 'Live Chat';

useHead({
  title: pageTitle,
})

definePageMeta({
  layout: 'console-secret'
})
</script>
