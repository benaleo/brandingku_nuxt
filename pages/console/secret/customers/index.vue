<template>
  <div>
    <AppBreadcrumb/>
    <AppTableHeader :pageTitle="pageTitle"/>
    <AppFilterTable v-model="keyword"/>

    <div class="mt-2">
      <div v-if="error" class="py-4 text-center text-red-500">{{ error }}</div>
      <DatatablesDataTable
          v-else
          :columns="customerColumns"
          :data="datas"
          :loading="loading"
          :pagination="pagination"
          @page-change="changePage"
          @limit-change="changeLimit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import AppBreadcrumb from '~/components/elements/AppBreadcrumb.vue'
import AppTableHeader from '~/components/elements/AppTableHeader.vue'
import AppFilterTable from '~/components/elements/AppFilterTable.vue'
import {customerColumns} from '~/components/datatables/customerColumns'
import {useCustomerService} from '~/services/customer.service'

const pageTitle = 'Customer'
const {datas, loading, error, pagination, fetchList, changePage, changeLimit, search} = useCustomerService()

// the first request starts on mount; show its skeleton during SSR too
loading.value = true
onMounted(fetchList)

// searches from 3 characters, and again when the box is cleared
const keyword = ref('')
let timer: ReturnType<typeof setTimeout> | undefined
watch(keyword, (value) => {
  clearTimeout(timer)
  const kw = value.trim()
  if (kw && kw.length < 3) return
  timer = setTimeout(() => search(kw), 300)
})

useHead({title: pageTitle})

definePageMeta({
  layout: 'console-secret'
})
</script>
