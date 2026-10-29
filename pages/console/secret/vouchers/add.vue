<template>
  <div>
    <AppBreadcrumb/>
    <AppTableHeader :pageTitle="pageTitle"/>
    <VoucherForm
      @saved="router.push('/console/secret/vouchers')"
      @cancel="router.push('/console/secret/vouchers')"
    />
  </div>
</template>

<script setup lang="ts">
import AppBreadcrumb from '~/components/elements/AppBreadcrumb.vue'
import AppTableHeader from '~/components/elements/AppTableHeader.vue'
import VoucherForm from '~/components/forms/VoucherForm.vue'

const router = useRouter()
const pageTitle = 'Tambah Voucher'

useHead({title: pageTitle})

definePageMeta({
  layout: 'console-secret'
})
</script>
