<template>
  <div>
    <!-- Breadcrumb -->
    <AppBreadcrumb/>

    <!-- Table Header -->
    <AppTableHeader :pageTitle="pageTitle" :create-path="'/console/secret/landing-page/testimonial/add'"/>

    <!-- Filter -->
    <AppFilterTable v-model="keyword"
      :filters="{ placement, source, status }"
      :filter-defaults="{ placement: '', source: '', status: '' }"
      @apply="(f) => { placement = f.placement; source = f.source; status = f.status }"
    >
      <template #default="{ draft }">
      <div class="flex flex-col gap-3">
        <select v-model="draft.placement" class="h-9 rounded-md border bg-background px-2 text-sm" aria-label="Tampil di">
          <option value="">Semua tempat</option>
          <option value="landing_page">Landing page</option>
          <option value="product">Halaman produk</option>
        </select>
        <select v-model="draft.source" class="h-9 rounded-md border bg-background px-2 text-sm" aria-label="Sumber">
          <option value="">Semua sumber</option>
          <option value="customer">Ulasan customer</option>
          <option value="console">Dibuat di console</option>
        </select>
        <select v-model="draft.status" class="h-9 rounded-md border bg-background px-2 text-sm" aria-label="Status">
          <option value="">Semua status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Tidak aktif</option>
        </select>
      </div>
      </template>
    </AppFilterTable>
    <p class="mt-1 text-xs text-muted-foreground">Ulasan customer masuk sebagai tidak aktif. Aktifkan lewat edit agar tampil; ulasan yang customer tidak setujui tidak bisa diaktifkan.</p>

    <!-- Data Table -->
    <div class="mt-2">
      <div v-if="error" class="text-center py-4 text-red-500">
        {{ error }}
      </div>
      <div v-else>
        <DatatablesDataTable
            :columns="testimonialColumns"
            :data="testimonialList || []"
            :loading="loading"
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
import {computed, ref, watch, onMounted} from 'vue'
import {testimonialColumns} from "~/components/datatables/testimonialColumns";
import {useTestimonialService} from "~/services/testimonial.service";
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import {toast} from 'vue-sonner'
import AppFilterTable from "~/components/elements/AppFilterTable.vue";

const pageTitle = 'Testimonial'
const keyword = ref<string>('')
const isFetch = ref<boolean>(false)

const {
  datas,
  loading,
  error,
  pagination,
  changePage,
  changeLimit,
  deleteTestimonialById,
  setParams,
  reFetch
} = useTestimonialService()

// The initial list request starts on mount; show its skeleton during SSR too.
loading.value = true

const testimonialList = computed(() => {
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
    await deleteTestimonialById(id)
    // Refresh current page
    reFetch()
    toast.success('Berhasil menghapus data')
  } catch (error) {
    console.error('Error deleting testimonial:', error)
    toast.error('Gagal menghapus data')
  }
}

const placement = ref('')
const source = ref('')
const status = ref('')
watch([placement, source, status], () => {
  pagination.value.page = 0
  setParams({
    placement: placement.value || undefined,
    source: source.value || undefined,
    is_active: status.value ? status.value === 'active' : undefined,
  })
})

// Load data when component mounts
onMounted(() => {
  console.log('Testimonial admin page mounted, fetching data...')
  reFetch()
})

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
