<template>
  <div>
    <AppBreadcrumb/>
    <AppTableHeader :pageTitle="pageTitle"/>
    <InvoiceForm
      :default-type="defaultType"
      @saved="(inv) => router.push(`/console/secret/invoices/${inv.id}/detail`)"
      @cancel="router.push('/console/secret/invoices')"
    />
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import AppBreadcrumb from '~/components/elements/AppBreadcrumb.vue'
import AppTableHeader from '~/components/elements/AppTableHeader.vue'
import InvoiceForm from '~/components/forms/InvoiceForm.vue'
import type {InvoiceType} from '~/types/invoice.type'

const router = useRouter()
const route = useRoute()
const defaultType = computed<InvoiceType>(() => (route.query.type === 'quotation' ? 'quotation' : 'invoice'))
const pageTitle = computed(() => defaultType.value === 'quotation' ? 'Buat Quotation' : 'Buat Invoice')

useHead({title: pageTitle})

definePageMeta({
  layout: 'console-secret'
})
</script>
