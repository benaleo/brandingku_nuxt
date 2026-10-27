import type { Voucher, VoucherStatus } from '~/types/voucher.type'

export const VOUCHER_STATUS: Record<VoucherStatus, [string, string]> = {
  active: ['Aktif', 'bg-green-100 text-green-800'],
  scheduled: ['Terjadwal', 'bg-sky-100 text-sky-800'],
  expired: ['Berakhir', 'bg-gray-100 text-gray-700'],
  exhausted: ['Kuota habis', 'bg-amber-100 text-amber-800'],
  inactive: ['Nonaktif', 'bg-zinc-200 text-zinc-700'],
}

// "10% (maks Rp 50.000)" or "Rp 20.000"
export const describeVoucherDiscount = (v: Pick<Voucher, 'type' | 'value' | 'max_discount'>) => {
  if (v.type === 'percentage') {
    const pct = formatBps(v.value)
    return v.max_discount > 0 ? `${pct} (maks ${formatRupiah(v.max_discount)})` : pct
  }
  return formatRupiah(v.value)
}

const formatDateTimeShort = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

export const describeVoucherPeriod = (v: Pick<Voucher, 'starts_at' | 'ends_at'>) => {
  if (!v.starts_at && !v.ends_at) return 'Tanpa batas waktu'
  if (!v.ends_at) return `Mulai ${formatDateTimeShort(v.starts_at)}`
  if (!v.starts_at) return `Sampai ${formatDateTimeShort(v.ends_at)}`
  return `${formatDateTimeShort(v.starts_at)} – ${formatDateTimeShort(v.ends_at)}`
}

// <input type="datetime-local"> works in local time without a zone; the API takes ISO timestamps
export const toDateTimeLocal = (iso?: string | null) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const fromDateTimeLocal = (value: string) => (value ? new Date(value).toISOString() : null)
