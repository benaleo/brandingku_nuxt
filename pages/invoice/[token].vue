<script setup lang="ts">
import {computed} from 'vue'
import {FileDown, Printer} from 'lucide-vue-next'
import {Button} from '@/components/ui/button'
import {useInvoiceService} from '~/services/invoice.service'

const TITLES: Record<string, string> = {
  invoice: 'INVOICE', quotation: 'QUOTATION', deal: 'DEAL', dp: 'INVOICE UANG MUKA', final: 'INVOICE PELUNASAN',
}
const STAMPS: Record<string, [string, string]> = {
  paid: ['LUNAS', 'border-green-600 text-green-700'],
  void: ['VOID', 'border-red-600 text-red-700'],
  cancelled: ['DIBATALKAN', 'border-red-600 text-red-700'],
  overdue: ['LEWAT JATUH TEMPO', 'border-red-600 text-red-700'],
}

const route = useRoute()
const config = useRuntimeConfig()
const token = computed(() => String(route.params.token || ''))
const {getPublicInvoice} = useInvoiceService()

const {data: inv, pending, error} = await useAsyncData(`public-invoice-${token.value}`, () => getPublicInvoice(token.value))

const pdfUrl = computed(() => `${String(config.public.API_URL).replace(/\/$/, '')}/invoice/${token.value}/pdf`)
const billable = computed(() => !!inv.value && isBillableType(inv.value.type))
const remaining = computed(() => inv.value ? Math.max(0, inv.value.amount_due - inv.value.paid_amount) : 0)
const stamp = computed(() => STAMPS[inv.value?.status || ''])
const showPayment = computed(() => billable.value && inv.value?.status !== 'paid' && inv.value?.status !== 'void' && (inv.value?.bank_accounts.length || 0) > 0)

const printPage = () => window.print()

useHead(() => ({
  title: inv.value ? `${inv.value.number} - ${inv.value.company_name}` : 'Invoice',
  // the link itself is the credential
  meta: [{name: 'robots', content: 'noindex, nofollow'}, {name: 'referrer', content: 'no-referrer'}],
}))

definePageMeta({layout: false})
</script>

<template>
  <div class="min-h-screen bg-gray-100 px-4 py-8 text-gray-900 print:bg-white print:p-0">
    <div v-if="pending" class="mx-auto max-w-3xl py-20 text-center text-gray-500">Memuat…</div>
    <div v-else-if="error || !inv" class="mx-auto max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
      <p class="text-lg font-semibold">Dokumen tidak ditemukan</p>
      <p class="mt-2 text-sm text-gray-600">Link ini tidak valid atau dokumen belum diterbitkan. Hubungi kami jika butuh bantuan.</p>
    </div>
    <template v-else>
      <div class="mx-auto mb-4 flex max-w-3xl justify-end gap-2 print:hidden">
        <Button variant="outline" class="bg-white" @click="printPage"><Printer class="size-4"/> Cetak</Button>
        <Button as="a" :href="pdfUrl" class="bg-green-600 hover:bg-green-700"><FileDown class="size-4"/> Unduh PDF</Button>
      </div>

      <article class="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-sm sm:p-10 print:max-w-none print:rounded-none print:shadow-none">
        <header class="flex flex-col gap-6 sm:flex-row sm:justify-between">
          <div class="min-w-0 text-sm">
            <p class="text-xl font-bold">{{ inv.company_name }}</p>
            <p v-if="inv.company_address" class="mt-1 whitespace-pre-line text-gray-600">{{ inv.company_address }}</p>
            <p class="text-gray-600">{{ [inv.company_phone, inv.company_email].filter(Boolean).join(' · ') }}</p>
            <p v-if="inv.company_npwp" class="text-gray-600">NPWP {{ inv.company_npwp }}</p>
          </div>
          <div class="text-sm sm:text-right">
            <p class="text-2xl font-bold tracking-tight">{{ TITLES[inv.type] || 'INVOICE' }}</p>
            <dl class="mt-2 grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5 sm:justify-end">
              <dt class="text-gray-500">No.</dt><dd class="font-medium">{{ inv.number }}</dd>
              <dt class="text-gray-500">Tanggal</dt><dd>{{ formatInvoiceDate(inv.issue_date) }}</dd>
              <template v-if="inv.type !== 'deal'">
                <dt class="text-gray-500">{{ inv.type === 'quotation' ? 'Berlaku sampai' : 'Jatuh tempo' }}</dt><dd>{{ formatInvoiceDate(inv.due_date) }}</dd>
              </template>
              <template v-if="inv.parent_number"><dt class="text-gray-500">Referensi</dt><dd>{{ inv.parent_number }}</dd></template>
            </dl>
            <p v-if="stamp" class="mt-3 inline-block rounded border-2 px-3 py-1 text-sm font-bold" :class="stamp[1]">{{ stamp[0] }}</p>
          </div>
        </header>

        <section class="mt-8 text-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Ditagihkan kepada</p>
          <p class="mt-1 font-semibold">{{ inv.customer_name }}</p>
          <p v-if="inv.customer_company">{{ inv.customer_company }}</p>
          <p v-if="inv.customer_address" class="whitespace-pre-line text-gray-600">{{ inv.customer_address }}</p>
          <p class="text-gray-600">{{ [inv.customer_email, inv.customer_phone].filter(Boolean).join(' · ') }}</p>
          <p v-if="inv.customer_npwp" class="text-gray-600">NPWP {{ inv.customer_npwp }}</p>
        </section>

        <div class="mt-6 overflow-x-auto">
          <table class="w-full min-w-[520px] text-sm">
            <thead class="border-b-2 border-gray-200 text-left text-xs text-gray-500">
              <tr>
                <th class="py-2 pr-2">Deskripsi</th>
                <th class="px-2 py-2 text-right">Qty</th>
                <th class="px-2 py-2 text-right">Harga</th>
                <th class="px-2 py-2 text-right">Diskon</th>
                <th class="py-2 pl-2 text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="it in inv.items" :key="it.id" class="border-b border-gray-100">
                <td class="py-2 pr-2">{{ it.description }}</td>
                <td class="px-2 py-2 text-right">{{ it.quantity.toLocaleString('id-ID') }}</td>
                <td class="px-2 py-2 text-right whitespace-nowrap">{{ formatRupiah(it.unit_price) }}</td>
                <td class="px-2 py-2 text-right">{{ it.discount_bps ? formatBps(it.discount_bps) : '-' }}</td>
                <td class="py-2 pl-2 text-right whitespace-nowrap">{{ formatRupiah(it.line_total ?? 0) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <dl class="ml-auto mt-4 max-w-xs space-y-1 text-sm">
          <div class="flex justify-between"><dt class="text-gray-600">Subtotal</dt><dd>{{ formatRupiah(inv.subtotal) }}</dd></div>
          <div v-if="inv.discount_total" class="flex justify-between"><dt class="text-gray-600">Diskon</dt><dd>-{{ formatRupiah(inv.discount_total) }}</dd></div>
          <div v-if="inv.shipping_fee" class="flex justify-between"><dt class="text-gray-600">Ongkos kirim</dt><dd>{{ formatRupiah(inv.shipping_fee) }}</dd></div>
          <template v-if="inv.tax_mode === 'exclusive'">
            <div class="flex justify-between"><dt class="text-gray-600">DPP</dt><dd>{{ formatRupiah(inv.tax_base) }}</dd></div>
            <div class="flex justify-between"><dt class="text-gray-600">PPN {{ formatBps(inv.tax_rate_bps) }}</dt><dd>{{ formatRupiah(inv.tax_total) }}</dd></div>
          </template>
          <div class="flex justify-between border-t pt-2 text-base font-bold">
            <dt>{{ inv.tax_mode === 'inclusive' ? 'Total (termasuk PPN)' : 'Total' }}</dt><dd>{{ formatRupiah(inv.total) }}</dd>
          </div>
          <template v-if="inv.tax_mode === 'inclusive'">
            <div class="flex justify-between text-xs text-gray-500"><dt>DPP</dt><dd>{{ formatRupiah(inv.tax_base) }}</dd></div>
            <div class="flex justify-between text-xs text-gray-500"><dt>PPN {{ formatBps(inv.tax_rate_bps) }}</dt><dd>{{ formatRupiah(inv.tax_total) }}</dd></div>
          </template>
          <template v-if="inv.deduction">
            <div class="flex justify-between"><dt class="text-gray-600">Dikurangi uang muka</dt><dd>-{{ formatRupiah(inv.deduction) }}</dd></div>
            <div class="flex justify-between font-semibold"><dt>Sisa tagihan</dt><dd>{{ formatRupiah(inv.amount_due) }}</dd></div>
          </template>
          <template v-if="billable && inv.paid_amount > 0 && remaining > 0">
            <div class="flex justify-between text-green-700"><dt>Sudah dibayar</dt><dd>-{{ formatRupiah(inv.paid_amount) }}</dd></div>
            <div class="flex justify-between font-semibold"><dt>Kurang bayar</dt><dd>{{ formatRupiah(remaining) }}</dd></div>
          </template>
        </dl>

        <section v-if="showPayment" class="mt-8 rounded-lg bg-green-50 p-4 text-sm print:border print:bg-white">
          <p class="font-semibold">Pembayaran</p>
          <p class="mt-1 text-gray-700">Transfer ke salah satu rekening berikut:</p>
          <ul class="mt-2 space-y-1">
            <li v-for="b in inv.bank_accounts" :key="b.number"><span class="font-medium">{{ b.bank }} {{ b.number }}</span> a.n. {{ b.name }}</li>
          </ul>
          <p class="mt-2 text-gray-700">Cantumkan nomor <span class="font-medium">{{ inv.number }}</span> pada berita transfer.</p>
        </section>

        <section v-if="inv.notes" class="mt-6 text-sm">
          <p class="font-semibold">Catatan</p>
          <p class="mt-1 whitespace-pre-line text-gray-700">{{ inv.notes }}</p>
        </section>
        <section v-if="inv.terms" class="mt-6 text-sm">
          <p class="font-semibold">Syarat & ketentuan</p>
          <p class="mt-1 whitespace-pre-line text-gray-600">{{ inv.terms }}</p>
        </section>
      </article>
    </template>
  </div>
</template>
