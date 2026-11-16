// Pictures of products and portfolios are served by the API at /media/..., which lays the logo
// over them. Every other stored file (categories, clients, proofs) keeps coming from the storage
// domain. Paths already absolute (http, data) pass through untouched.
const WATERMARKED = /^\/?(products|portfolios)\//

export const mediaUrlFor = (cfg: { API_URL?: string; STORAGE_URL?: string }) => (path?: string | null): string => {
  if (!path) return ''
  if (/^(https?:|data:|blob:)/.test(path)) return path
  if (WATERMARKED.test(path) && cfg.API_URL) {
    return `${String(cfg.API_URL).replace(/\/+$/, '')}/media/${path.replace(/^\/+/, '')}`
  }
  return `${cfg.STORAGE_URL || ''}${path}`
}

// call in setup, then use the returned function anywhere (also after an await)
export const useMediaUrl = () => mediaUrlFor(useRuntimeConfig().public as { API_URL?: string; STORAGE_URL?: string })
