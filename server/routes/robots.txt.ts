import { defineEventHandler, getRequestURL, setHeader } from 'h3'

// pages behind a login or a private token; cart/checkout/invoice stay crawlable so their noindex is seen
const DISALLOW = ['/console/', '/api/', '/test/', '/profile/', '/wishlist']

export default defineEventHandler((event) => {
  const origin = siteOrigin(getRequestURL(event).origin)
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=86400')
  return ['User-agent: *', 'Allow: /', ...DISALLOW.map((p) => `Disallow: ${p}`), '', `Sitemap: ${origin}/sitemap.xml`, ''].join('\n')
})
