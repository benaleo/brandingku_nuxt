import { defineEventHandler, readBody, getHeader, setResponseStatus, getCookie } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const API_URL = config.public.API_URL
  if (!API_URL) {
    setResponseStatus(event, 500)
    return { errors: [{ message: 'API_URL is not configured on the server' }] }
  }

  try {
    const { query, variables } = await readBody<{ query: string; variables?: Record<string, any> }>(event)
    if (!query || typeof query !== 'string') {
      setResponseStatus(event, 400)
      return { errors: [{ message: 'Invalid GraphQL query' }] }
    }

    // Prefer Authorization header from client; otherwise build from cookie
    const reqAuth = getHeader(event, 'authorization') || ''
    const token = getCookie(event, 'token')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': '*/*'
    }
    if (reqAuth) headers['Authorization'] = reqAuth
    else if (token) headers['Authorization'] = `Bearer ${token}`

    // Basic guard: if API_URL appears to be same-origin, log a warning to help avoid recursion/misconfig
    try {
      const host = getHeader(event, 'host') || ''
      const apiHost = new URL(API_URL).host
      if (host && apiHost && host === apiHost) {
        console.warn('[gql.post] Warning: API_URL host equals request host. Ensure NUXT_PUBLIC_API_URL points to your backend, not this site.', {
          host,
          API_URL
        })
      }
    } catch {}

    const res = await $fetch<any>(`${API_URL}/query`, {
      method: 'POST',
      headers,
      body: { query, variables },
      // Prevent hanging the request forever in production
      timeout: 15000,
    })

    // Pass through GraphQL-style response
    return res
  } catch (err: any) {
    console.error('[gql.post] Upstream GraphQL error', {
      message: err?.message,
      name: err?.name,
      stack: err?.stack,
      cause: err?.cause,
    })
    setResponseStatus(event, 502)
    return { errors: [{ message: err?.message || 'GraphQL proxy error' }] }
  }
})
