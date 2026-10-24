<template>
  <div>
    <AppBreadcrumb/>
    <AppTableHeader :pageTitle="pageTitle" :create-path="'/console/secret/email-list/add'"/>

    <AppFilterTable v-model="keyword" placeholder="Cari email, sender, provider…">
      <FieldXSelectSimple class="w-full sm:w-40" :options="statusOptions" placeholder="Semua status" v-model="selectedStatus"/>
    </AppFilterTable>

    <div class="mt-2">
      <div v-if="error" class="py-4 text-center text-red-500">{{ error }}</div>
      <DatatablesDataTable
          v-else
          :columns="adminSmtpColumns"
          :data="datas || []"
          :loading="loading"
          :pagination="paginationData"
          :meta="tableMeta"
          @page-change="changePage"
          @limit-change="changeLimit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {refDebounced} from '@vueuse/core'
import {toast} from 'vue-sonner'
import AppBreadcrumb from '~/components/elements/AppBreadcrumb.vue'
import AppTableHeader from '~/components/elements/AppTableHeader.vue'
import AppFilterTable from '~/components/elements/AppFilterTable.vue'
import FieldXSelectSimple from '~/components/forms/fields/FieldXSelectSimple.vue'
import {adminSmtpColumns} from '~/components/datatables/adminSmtpColumns'
import {useAdminSmtpService} from '~/services/admin-smtp.service'

const pageTitle = 'Email List'

const {datas, loading, error, pagination, changePage, changeLimit, setParams, reFetch, deleteSmtp} = useAdminSmtpService(true)

const keyword = ref('')
const debouncedKeyword = refDebounced(keyword, 300)
const selectedStatus = ref('all')
const statusOptions = [
  {id: 'all', label: 'Semua status'},
  {id: 'yes', label: 'Aktif'},
  {id: 'no', label: 'Nonaktif'},
]

// server-side search and filter; setParams refetches through the service watcher
watch([debouncedKeyword, selectedStatus], ([kw, status]) => {
  setParams({
    keyword: kw.trim() || undefined,
    is_active: status === 'yes' ? true : status === 'no' ? false : undefined,
  })
})

const paginationData = computed(() => ({
  page: pagination.value.page,
  limit: pagination.value.limit,
  total: pagination.value.total,
}))

const handleDelete = async (id: string) => {
  try {
    await deleteSmtp(id)
    reFetch()
    toast.success('Berhasil menghapus data')
  } catch (e: any) {
    toast.error(e?.message || 'Gagal menghapus data')
  }
}
const tableMeta = {handleDelete}

useHead({title: pageTitle})

definePageMeta({
  layout: 'console-secret'
})
</script>
