import type { InvoiceStatus, InvoiceType, TaxMode } from '~/types/invoice.type'

export const INVOICE_TYPE_LABELS: Record<InvoiceType, string> = {
  invoice: 'Invoice',
  quotation: 'Quotation',
  deal: 'Deal',
  dp: 'DP',
  final: 'Final',
}

export const INVOICE_STATUS: Record<InvoiceStatus, [string, string]> = {
  draft: ['Draft', 'bg-gray-100 text-gray-800'],
  sent: ['Terkirim', 'bg-sky-100 text-sky-800'],
  overdue: ['Lewat jatuh tempo', 'bg-red-100 text-red-800'],
  paid: ['Lunas', 'bg-green-100 text-green-800'],
  void: ['Void', 'bg-zinc-200 text-zinc-700 line-through'],
  cancelled: ['Dibatalkan', 'bg-zinc-200 text-zinc-700'],
}

export const TAX_MODE_LABELS: Record<TaxMode, string> = {
  none: 'Tanpa PPN',
  exclusive: 'Exclude (PPN ditambahkan)',
  inclusive: 'Include (harga sudah termasuk PPN)',
}

export const isBillableType = (type: string) => type === 'invoice' || type === 'dp' || type === 'final'

export const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0)

export const formatBps = (bps: number) => `${String(Math.round(bps) / 100).replace('.', ',')}%`

export const formatInvoiceDate = (date: string) => {
  if (!date) return '-'
  const d = new Date(`${date.slice(0, 10)}T00:00:00`)
  return Number.isNaN(d.getTime()) ? date : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// half-up integer division, same rounding as the server
const mulDivRound = (a: number, b: number, c: number) => Math.floor((a * b * 2 + c) / (c * 2))

// preview of the server's CalcInvoice; the saved invoice always uses the server's numbers
export const previewInvoiceTotals = (input: {
  items: { quantity: number; unit_price: number; discount_bps: number }[]
  discount_total: number
  shipping_fee: number
  tax_mode: TaxMode
  tax_rate_bps: number
}) => {
  const lines = input.items.map((it) => {
    const gross = (Number(it.quantity) || 0) * (Number(it.unit_price) || 0)
    return gross - mulDivRound(gross, Number(it.discount_bps) || 0, 10000)
  })
  const subtotal = lines.reduce((a, b) => a + b, 0)
  const net = subtotal - (Number(input.discount_total) || 0) + (Number(input.shipping_fee) || 0)
  const rate = Number(input.tax_rate_bps) || 0
  let base = net
  let tax = 0
  let total = net
  if (input.tax_mode === 'exclusive') {
    tax = mulDivRound(net, rate, 10000)
    total = net + tax
  } else if (input.tax_mode === 'inclusive') {
    base = mulDivRound(net, 10000, 10000 + rate)
    tax = net - base
  }
  return { lines, subtotal, base, tax, total }
}
