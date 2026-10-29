import type { InvoiceItem } from '~/types/invoice.type'
import type { Order, OrderDocument } from '~/types/order.type'

// product lines show qty × product price, with each branding service as its own qty × price
// line below; once there is a deal its items and prices replace the requested ones
export type PriceLine = { key: string; label: string; quantity: number; unitPrice: number; discountBps: number; total: number }
export type ItemRow = { key: string; name: string; image: string; slug: string; note: string; product: PriceLine | null; brandings: PriceLine[] }

// the deal whose prices replace the requested ones: the newest one still standing.
// Customers never see drafts; the console may show one before it is sent.
export const currentDeal = (o: Order | null, withDrafts = false): OrderDocument | null =>
  [...(o?.documents || [])]
    .filter(d => d.type === 'deal' && !['void', 'cancelled'].includes(d.status) && (withDrafts || d.status !== 'draft'))
    .sort((a, b) => b.id - a.id)[0] || null

// brandingLabel turns a method name into the line label, e.g. "Branding Sablon"
export const rowsFromOrder = (o: Order, brandingLabel: (name: string) => string): ItemRow[] => o.items.map(it => ({
  key: `o${it.id}`, name: it.product_name, image: it.product_image, slug: it.product_slug, note: it.note,
  product: { key: 'p', label: it.variant_name, quantity: it.quantity, unitPrice: it.unit_price, discountBps: 0, total: it.quantity * it.unit_price },
  brandings: (it.brandings || []).map(b => ({
    key: `b${b.branding_method_id}`, label: brandingLabel(b.name), quantity: it.quantity, unitPrice: b.unit_price, discountBps: 0, total: it.quantity * b.unit_price,
  })),
}))

// deal lines keep the quotation's order: a product line, then its "Branding <name> - <product>" lines;
// anything else the admin added stands on its own row
export const rowsFromDeal = (o: Order, items: InvoiceItem[]): ItemRow[] => {
  const rows: ItemRow[] = []
  items.forEach((it, i) => {
    const line = (label: string): PriceLine => ({ key: `d${it.id ?? i}`, label, quantity: it.quantity, unitPrice: it.unit_price, discountBps: it.discount_bps || 0, total: it.line_total ?? it.quantity * it.unit_price })
    const source = it.product_additional_id ? o.items.find(x => x.product_additional_id === it.product_additional_id) : undefined
    const branding = !it.product_additional_id && /^Branding /.test(it.description) ? it.description.split(' - ')[0] || '' : ''
    const last = rows[rows.length - 1]
    if (branding && last?.product) last.brandings.push(line(branding))
    else if (it.product_additional_id) rows.push({ key: `d${it.id ?? i}`, name: source?.product_name || it.description, image: source?.product_image || '', slug: source?.product_slug || '', note: source?.note || '', product: line(source?.variant_name || ''), brandings: [] })
    else rows.push({ key: `d${it.id ?? i}`, name: it.description, image: '', slug: '', note: '', product: null, brandings: [line('')] })
  })
  return rows
}

export const linesOf = (row: ItemRow) => (row.product ? [row.product, ...row.brandings] : row.brandings)
export const rowsTotal = (rows: ItemRow[]) => rows.reduce((sum, r) => sum + linesOf(r).reduce((s, l) => s + l.total, 0), 0)
