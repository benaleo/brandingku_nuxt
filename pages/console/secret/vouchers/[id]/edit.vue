<template>
  <div>
    <AppBreadcrumb/>
    <AppTableHeader :pageTitle="pageTitle"/>
    <div v-if="loading" class="py-4 text-center">Loading...</div>
    <div v-else-if="error" class="py-4 text-center text-red-500">{{ error }}</div>
    <template v-else-if="voucher">
      <VoucherForm
        :voucher="voucher"
        @saved="router.push('/console/secret/vouchers')"
        @cancel="router.push('/console/secret/vouchers')"
      />

      <section class="mt-8 rounded-xl border bg-card p-4 text-sm">
        <p class="mb-3 font-medium">Riwayat pemakaian</p>
        <p v-if="!redemptions.length" class="text-muted-foreground">Belum pernah dipakai.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[560px]">
            <thead class="border-b text-left text-xs text-muted-foreground">
              <tr>
                <th class="py-2 pr-3">Waktu</th>
                <th class="py-2 pr-3">Customer</th>
                <th class="py-2 pr-3">Invoice</th>
                <th class="py-2 pr-3 text-right">Potongan</th>
                <th class="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in redemptions" :key="r.id" class="border-b last:border-0">
                <td class="py-2 pr-3 whitespace-nowrap">{{ formatDateTime(r.created_at) }}</td>
                <td class="py-2 pr-3">{{ r.user_email }}</td>
                <td class="py-2 pr-3">
                  <NuxtLink v-if="r.invoice_id" :to="`/console/secret/invoices/${r.invoice_id}/detail`" class="text-green-700 hover:underline">{{ r.invoice_number }}</NuxtLink>
                  <span v-else>-</span>
                </td>
                <td class="py-2 pr-3 text-right whitespace-nowrap">{{ formatRupiah(r.discount_amount) }}</td>
                <td class="py-2">{{ REDEMPTION_LABELS[r.status] || r.status }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import AppBreadcrumb from '~/components/elements/AppBreadcrumb.vue'
import AppTableHeader from '~/components/elements/AppTableHeader.vue'
import VoucherForm from '~/components/forms/VoucherForm.vue'
import {useVoucherService} from '~/services/voucher.service'
import {invoiceErrorMessage} from '~/services/invoice.service'
import type {Voucher, VoucherRedemption} from '~/types/voucher.type'

const REDEMPTION_LABELS: Record<string, string> = {reserved: 'Dipesan (belum dibayar)', used: 'Terpakai', released: 'Dibatalkan'}

const router = useRouter()
const route = useRoute()
const id = computed(() => Number(route.params.id))
const {getVoucher, getVoucherRedemptions} = useVoucherService()

const voucher = ref<Voucher | null>(null)
const redemptions = ref<VoucherRedemption[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const pageTitle = computed(() => voucher.value ? `Edit Voucher ${voucher.value.code}` : 'Edit Voucher')

onMounted(async () => {
  try {
    const [v, r] = await Promise.all([getVoucher(id.value), getVoucherRedemptions(id.value)])
    voucher.value = v
    redemptions.value = r
  } catch (e: any) {
    error.value = invoiceErrorMessage(e, 'Gagal memuat voucher')
  } finally {
    loading.value = false
  }
})

useHead({title: pageTitle})

definePageMeta({
  layout: 'console-secret'
})
</script>
