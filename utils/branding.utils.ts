import type { BrandingTier } from '~/types/branding.type'
import { formatRupiah } from './invoice.utils'

// price per piece at qty, same rule as the server: below the smallest tier it cannot be ordered
export const brandingPriceAt = (tiers: BrandingTier[], qty: number): number | null => {
  let price: number | null = null
  let bestMin = 0
  for (const t of tiers) {
    if (t.min_qty <= qty && t.min_qty > bestMin) {
      price = t.price
      bestMin = t.min_qty
    }
  }
  return price
}

export const brandingMinQty = (tiers: BrandingTier[]) =>
  tiers.reduce((least, t) => (least === 0 || t.min_qty < least ? t.min_qty : least), 0)

export const sortedTiers = (tiers: BrandingTier[]) => [...tiers].sort((a, b) => a.min_qty - b.min_qty)

// "50+ pcs Rp 3.000 · 250+ pcs Rp 2.500"
export const describeBrandingTiers = (tiers: BrandingTier[]) =>
  sortedTiers(tiers).map(t => `${t.min_qty.toLocaleString('id-ID')}+ pcs ${formatRupiah(t.price)}`).join(' · ')

// "2,5": the same canonical form the server keys cart lines by
export const brandingKey = (ids: number[] | undefined) => [...new Set(ids || [])].sort((a, b) => a - b).join(',')

// inline check of a tier list as the server validates it; null when fine
export const brandingTierProblem = (tiers: BrandingTier[]): string | null => {
  const seen = new Set<number>()
  for (const t of tiers) {
    const qty = Number(t.min_qty)
    if (!Number.isInteger(qty) || qty < 1) return 'Min. qty minimal 1'
    if (!Number.isInteger(Number(t.price)) || Number(t.price) < 0) return 'Harga tidak valid'
    if (seen.has(qty)) return `Min. qty ${qty} dipakai dua kali`
    seen.add(qty)
  }
  let prev: BrandingTier | undefined
  for (const t of sortedTiers(tiers)) {
    if (prev && Number(t.price) > Number(prev.price)) {
      return `Harga untuk ${t.min_qty} pcs tidak boleh lebih mahal dari tier sebelumnya`
    }
    prev = t
  }
  return null
}
