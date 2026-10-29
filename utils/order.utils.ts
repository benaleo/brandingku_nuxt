import type { Order, OrderStatus } from '~/types/order.type'

// a listed order's total: before the shipping fee is known the invoice total excludes it;
// quotations show the quoted total
export const orderListTotal = (o: Order) => o.invoice?.total ?? o.subtotal - o.discount_total

export const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  awaiting_shipping_fee: 'bg-amber-100 text-amber-800',
  pending_payment: 'bg-sky-100 text-sky-800',
  paid: 'bg-green-100 text-green-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-violet-100 text-violet-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-zinc-200 text-zinc-700',
  expired: 'bg-zinc-200 text-zinc-700',
  requested: 'bg-amber-100 text-amber-800',
  quoted: 'bg-sky-100 text-sky-800',
  revision_requested: 'bg-orange-100 text-orange-800',
  accepted: 'bg-teal-100 text-teal-800',
  rejected: 'bg-zinc-200 text-zinc-700',
}

// console labels; the storefront uses app.orderStatus.* translations
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  awaiting_shipping_fee: 'Menunggu ongkir',
  pending_payment: 'Menunggu pembayaran',
  paid: 'Dibayar',
  processing: 'Diproses',
  shipped: 'Dikirim',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  expired: 'Kedaluwarsa',
  requested: 'Minta penawaran',
  quoted: 'Penawaran terkirim',
  revision_requested: 'Minta revisi',
  accepted: 'Penawaran diterima',
  rejected: 'Penawaran ditolak',
}

// statuses where nothing is left to do on the order
export const FINISHED_ORDER_STATUSES: OrderStatus[] = ['completed', 'cancelled', 'expired', 'rejected']

// the API takes 5 MB per file (base64 must fit its 10 MB request limit)
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
export const isImageOrPdf = (file: File) => file.type.startsWith('image/') || file.type === 'application/pdf'

export const readFileAsDataURL = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

export const newIdempotencyKey = () =>
  (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^A-Za-z0-9-]/g, '')
