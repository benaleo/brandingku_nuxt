import { defineEventHandler, getHeader, getCookie, getRouterParam, setResponseStatus } from 'h3'
import { useRuntimeConfig } from '#imports'

// Polling endpoint for one import job. Auth is forwarded exactly like gql.post.ts so
// the browser only ever talks to this Nuxt origin.
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const API_URL = config.public.API_URL
  if (!API_URL) {
    setResponseStatus(event, 500)
    return { error: 'API_URL is not configured on the server' }
  }

  const id = getRouterParam(event, 'id') || ''
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) {
    setResponseStatus(event, 400)
    return { error: 'ID pekerjaan impor tidak valid.' }
  }

  // Prefer Authorization header from client; otherwise build from cookie (same as gql.post.ts)
  const reqAuth = getHeader(event, 'authorization') || ''
  const token = getCookie(event, 'token')
  const headers: Record<string, string> = {
    'Accept': 'application/json'
  }
  if (reqAuth) headers['Authorization'] = reqAuth
  else if (token) headers['Authorization'] = `Bearer ${token}`

  let upstream = ''
  try {
    upstream = `${String(API_URL).replace(/\/+$/, '')}/import/products/${encodeURIComponent(id)}`
    new URL(upstream)
  } catch {
    setResponseStatus(event, 500)
    return { error: 'API_URL tidak valid. Periksa konfigurasi server.' }
  }

  try {
    const res = await $fetch.raw<Record<string, unknown>>(upstream, {
      method: 'GET',
      headers,
      timeout: 30000,
      retry: 0,
      responseType: 'json',
    })
    setResponseStatus(event, res.status)
    return res._data
  } catch (err: any) {
    const status = Number(err?.statusCode ?? err?.status ?? err?.response?.status) || 502
    const data = err?.data
    const upstreamMessage = typeof data?.error === 'string'
      ? data.error
      : typeof data === 'string' && data.trim() && !data.trimStart().startsWith('<')
        ? data
        : ''
    console.error('[import/[id].get] Upstream status error', {
      status,
      message: err?.message,
      name: err?.name,
      stack: err?.stack,
      cause: err?.cause,
    })
    setResponseStatus(event, status >= 400 && status <= 599 ? status : 502)
    return { error: upstreamMessage || 'Gagal mengambil status impor. Silakan coba lagi.' }
  }
})
