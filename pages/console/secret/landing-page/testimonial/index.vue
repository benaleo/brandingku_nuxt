<template>
  <div>
    <!-- Breadcrumb -->
    <AppBreadcrumb/>

    <!-- Table Header -->
    <AppTableHeader :pageTitle="pageTitle" :create-path="'/console/secret/landing-page/testimonial/add'"/>

    <!-- Filter -->
    <AppFilterTable v-model="keyword">
      <div class="flex-1">
      </div>
    </AppFilterTable>

    <!-- Data Table -->
    <div class="mt-2">
      <div v-if="loading" class="text-center py-4">
        Loading testimonials...
      </div>
      <div v-else-if="error" class="text-center py-4 text-red-500">
        {{ error }}
      </div>
      <div v-if="!loading">
        <DatatablesDataTable
            :columns="testimonialColumns"
            :data="testimonialList || []"
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