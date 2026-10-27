<template>
  <div>
    <AppBreadcrumb/>
    <AppTableHeader :pageTitle="pageTitle" create-path="/console/secret/vouchers/add"/>

    <AppFilterTable v-model="keyword" placeholder="Cari kode atau nama…">
      <select v-model="status" aria-label="Filter status" class="h-9 rounded-md border bg-background px-3 text-sm">
        <option value="">Semua status</option>
        <option v-for="(s, value) in VOUCHER_STATUS" :key="value" :value="value">{{ s[0] }}</option>
      </select>
    </AppFilterTable>

    <div class="mt-6">
      <div v-if="error" class="py-4 text-center text-red-500">{{ error }}</div>
      <DatatablesDataTable
        v-else
        :columns="voucherColumns"
        :data="rows"
        :loading="loading"
        :meta="{ handleDelete }"
        :pagination="{ page, limit, total }"
        @page-change="(p: number) => { page = p; load() }"
        @limit-change="(l: number) => { limit = l; page = 0; load() }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import {toast} from 'vue-sonner'
import AppBreadcrumb from '~/components/elements/AppBreadcrumb.vue'
import AppTableHeader from '~/components/elements/AppTableHeader.vue'
import AppFilterTable from '~/components/elements/AppFilterTable.vue'
import {voucherColumns} from '~/components/datatables/voucherColumns'
import {useVoucherService} from '~/services/voucher.service'
import {invoiceErrorMessage} from '~/services/invoice.service'
import type {Voucher} from '~/types/voucher.type'

const pageTitle = 'Voucher'
const {getVouchers, deleteVoucher} = useVoucherService()

const rows = ref<Voucher[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
// DataTable pages are 0-based; the API is 1-based
const page = ref(0)
const limit = ref(10)
const total = ref(0)
const keyword = ref('')
const status = ref('')

let requestId = 0
async function load() {
  const current = ++requestId
  loading.value = true
  error.value = null
  try {
    const kw = keyword.value.trim()
    const res = await getVouchers(page.value + 1, limit.value, {keyword: kw || undefined, status: status.value || undefined})
    if (current !== requestId) return
    rows.value = res.items
    total.value = res.page_info.total_items
  } catch (e: any) {
    if (current === requestId) error.value = invoiceErrorMessage(e, 'Gagal memuat voucher')
  } finally {
    if (current === requestId) loading.value = false
  }
}

const handleDelete = async (voucher: Voucher) => {
  try {
    await deleteVoucher(voucher.id)
    toast.success(`Voucher ${voucher.code} dihapus`)
    load()
  } catch (e: any) {
    toast.error(invoiceErrorMessage(e, 'Gagal menghapus voucher'))
  }
}

let keywordTimer: ReturnType<typeof setTimeout> | undefined
watch(keyword, () => {
  clearTimeout(keywordTimer)
  keywordTimer = setTimeout(() => { page.value = 0; load() }, 300)
})
watch(status, () => { page.value = 0; load() })

onMounted(load)

useHead({title: pageTitle})

definePageMeta({
  layout: 'console-secret'
})
</script>
