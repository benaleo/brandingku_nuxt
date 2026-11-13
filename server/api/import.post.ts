import { defineEventHandler, readRawBody, getHeader, getCookie, setResponseStatus } from 'h3'
import { useRuntimeConfig } from '#imports'

// Proxies the raw multipart upload to the Go backend so the browser never calls
// the API origin directly (and no CORS/large-body handling leaks into the client).
// The body is forwarded untouched: the multipart boundary lives in the content-type.
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const API_URL = config.public.API_URL
  if (!API_URL) {
    setResponseStatus(event, 500)
    return { error: 'API_URL is not configured on the server' }
  }

  let upstream = ''
  try {
    upstream = `${String(API_URL).replace(/\/+$/, '')}/import/products`
    new URL(upstream)
  } catch {
    setResponseStatus(event, 500)
    return { error: 'API_URL tidak valid. Periksa konfigurasi server.' }
  }

  const rawBody = await readRawBody(event, false)
  if (!rawBody || rawBody.length === 0) {
    setResponseStatus(event, 400)
    return { error: 'Berkas unggahan tidak ditemukan.' }
  }

  const contentType = getHeader(event, 'content-type')
  if (!contentType) {
    setResponseStatus(event, 400)
    return { error: 'Content-Type unggahan tidak ditemukan.' }
  }

  // Prefer Authorization header from client; otherwise build from cookie (same as gql.post.ts)
  const reqAuth = getHeader(event, 'authorization') || ''
  const token = getCookie(event, 'token')
  const headers: Record<string, string> = {
    'Content-Type': contentType,
    'Accept': 'application/json'
  }
  if (reqAuth) headers['Authorization'] = reqAuth
  else if (token) headers['Authorization'] = `Bearer ${token}`

  try {
    // `.raw` keeps the upstream status (202 queued, 200 dry run, 4xx/5xx errors).
    const res = await $fetch.raw<Record<string, unknown>>(upstream, {
      method: 'POST',
      headers,
      // Buffer/Uint8Array is passed through untouched; ofetch only serialises plain objects.
      body: rawBody,
      // Big archives need room: the backend may take minutes before answering.
      timeout: 600000,
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
    console.error('[import.post] Upstream import error', {
      status,
      message: err?.message,
      name: err?.name,
      stack: err?.stack,
      cause: err?.cause,
    })
    setResponseStatus(event, status >= 400 && status <= 599 ? status : 502)
    return { error: upstreamMessage || 'Gagal memproses impor. Silakan coba lagi.' }
  }
})
