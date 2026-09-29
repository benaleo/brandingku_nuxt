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
import {computed, ref} from 'vue'
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import AppFilterTable from "~/components/elements/AppFilterTable.vue";

const {
  datas,
  loading,
  error,
  pagination,
  changePage,
  changeLimit,
} = useChatAdminService(true)

const dataList = computed(() => {
  const list = datas.value || []
  const kw = keyword.value.trim().toLowerCase()
  if (!kw || kw.length < 3) return list
  return list.filter((s) =>
    s.name?.toLowerCase().includes(kw) || s.contact_value?.toLowerCase().includes(kw)
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

// Filter options (client-side — backend has no keyword search for chat sessions)
const keyword = ref<string>('')

const pageTitle = 'Live Chat';

useHead({
  title: pageTitle,
})

definePageMeta({
  layout: 'console-secret'
})
</script>
