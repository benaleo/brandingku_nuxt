<template>
  <div>
    <AppBreadcrumb/>
    <AppTableHeader :pageTitle="pageTitle"/>
    <div v-if="loading" class="py-4 text-center">Loading...</div>
    <div v-else-if="error" class="py-4 text-center text-red-500">{{ error }}</div>
    <div v-else-if="invoice && !editable" class="rounded-lg border bg-card p-6 text-sm">
      {{ invoice.number }} tidak bisa diedit: hanya draft invoice, quotation atau deal yang bisa diubah,
      dan invoice pembelian diatur dari halaman Transaksi.
      <NuxtLink :to="detailPath" class="ml-1 font-medium text-green-700 hover:underline">Kembali ke detail</NuxtLink>
    </div>
    <InvoiceForm
      v-else-if="invoice"
      :invoice="invoice"
      @saved="router.push(detailPath)"
      @cancel="router.push(detailPath)"
    />
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import AppBreadcrumb from '~/components/elements/AppBreadcrumb.vue'
import AppTableHeader from '~/components/elements/AppTableHeader.vue'
import InvoiceForm from '~/components/forms/InvoiceForm.vue'
import {invoiceErrorMessage, useInvoiceService} from '~/services/invoice.service'
import type {Invoice} from '~/types/invoice.type'

const router = useRouter()
const route = useRoute()
const id = computed(() => Number(route.params.id))
const detailPath = computed(() => `/console/secret/invoices/${id.value}/detail`)
const {getInvoice} = useInvoiceService()

const invoice = ref<Invoice | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const editable = computed(() => invoice.value?.status === 'draft' && !['dp', 'final'].includes(invoice.value.type) &&
  !(invoice.value.type === 'invoice' && invoice.value.order_id))
const pageTitle = computed(() => invoice.value ? `Edit ${invoice.value.number}` : 'Edit Invoice')

onMounted(async () => {
  try {
    invoice.value = await getInvoice(id.value)
  } catch (e: any) {
    error.value = invoiceErrorMessage(e, 'Gagal memuat invoice')
  } finally {
    loading.value = false
  }
})

useHead({title: pageTitle})

definePageMeta({
  layout: 'console-secret'
})
</script>
