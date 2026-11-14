import { defineEventHandler, getRequestURL, setHeader } from 'h3'

type Entry = { path: string; lastmod?: string | null; priority: string }
type Page<T> = { items: T[]; page_info: { has_next_page: boolean } }
type Dated = { slug: string; updated_at?: string | null }

const STATIC_PAGES: Entry[] = [
  { path: '/', priority: '1.0' },
  { path: '/product', priority: '0.9' },
  { path: '/category', priority: '0.8' },
  { path: '/portfolio', priority: '0.7' },
  { path: '/services', priority: '0.7' },
  { path: '/tentang', priority: '0.5' },
  { path: '/kontak', priority: '0.5' },
  { path: '/tnc', priority: '0.2' },
]
const PAGE_SIZE = 100
// stops a backend that always reports has_next_page from looping forever
const MAX_PAGES = 50

const fetchAll = async (field: 'getProducts' | 'getPortfolios'): Promise<Dated[]> => {
  const out: Dated[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const data = await backendGql<Record<string, Page<Dated>>>(
      `query sitemap($page: Int!, $limit: Int!) {
        ${field}(pagination: { page: $page, limit: $limit }, is_active: true) {
          items { slug updated_at }
          page_info { has_next_page }
        }
      }`,
      { page, limit: PAGE_SIZE },
    )
    out.push(...data[field].items)
    if (!data[field].page_info.has_next_page) break
  }
  return out
}

// only top-level categories have their own url; sub categories are a ?sub= filter on the parent
const fetchCategories = async (): Promise<Dated[]> => {
  const data = await backendGql<{ getProductCategories: (Dated & { parent_id?: number | null; is_active?: boolean })[] }>(
    `{ getProductCategories { slug parent_id is_active updated_at } }`,
  )
  return data.getProductCategories.filter((c) => !c.parent_id && c.is_active !== false)
}

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

const toEntries = (rows: Dated[], prefix: string, priority: string): Entry[] =>
  rows.filter((r) => r.slug).map((r) => ({ path: `${prefix}/${encodeURIComponent(r.slug)}`, lastmod: r.updated_at, priority }))

export default defineEventHandler(async (event) => {
  const origin = siteOrigin(getRequestURL(event).origin)

  // one failing source still leaves the rest of the sitemap usable
  const [products, categories, portfolios] = await Promise.allSettled([
    fetchAll('getProducts'),
    fetchCategories(),
    fetchAll('getPortfolios'),
  ])
  for (const r of [products, categories, portfolios]) {
    if (r.status === 'rejected') console.error('[sitemap]', r.reason)
  }
  const ok = <T>(r: PromiseSettledResult<T[]>) => (r.status === 'fulfilled' ? r.value : [])

  const entries = [
    ...STATIC_PAGES,
    ...toEntries(ok(categories), '/category', '0.8'),
    ...toEntries(ok(products), '/product', '0.8'),
    ...toEntries(ok(portfolios), '/portfolio', '0.6'),
  ]

  const urls = entries.map((e) => {
    const lastmod = e.lastmod && !Number.isNaN(Date.parse(e.lastmod)) ? `<lastmod>${new Date(e.lastmod).toISOString()}</lastmod>` : ''
    return `<url><loc>${escapeXml(`${origin}${e.path === '/' ? '' : e.path}`)}</loc>${lastmod}<priority>${e.priority}</priority></url>`
  })

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
})
