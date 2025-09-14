import { defineEventHandler, readBody, getHeader, setResponseStatus, getCookie } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const API_URL = config.public.API_URL
  const GRAPHQL_PATH = String(config.public.graphqlPath || '/query')
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

    // Normalize upstream endpoint and detect potential recursion
    let upstream = ''
    try {
      const normalized = new URL(API_URL)
      // Ensure no trailing slash duplication
      normalized.pathname = normalized.pathname.replace(/\/$/, '')
      const path = (GRAPHQL_PATH || '').trim()
      // Build upstream robustly to avoid double slashes regardless of inputs
      const baseParts = [
        normalized.origin,
        normalized.pathname.replace(/^\/+|\/+$/g, ''),
      ].filter(Boolean)
      const pathPart = path.replace(/^\/+/, '')
      upstream = [...baseParts, ...(pathPart ? [pathPart] : [])].join('/')

      const host = (getHeader(event, 'host') || '').toLowerCase()
      const apiHost = normalized.host.toLowerCase()
      if (host && apiHost && host === apiHost) {
        // If API_URL points to same host, it likely recurses to this Nuxt app.
        // This often returns HTML or causes re-entrant calls in production.
        console.warn('[gql.post] Detected API_URL host equals current host. This can cause recursion. Configure NUXT_PUBLIC_API_URL to your backend origin.', {
          host,
          API_URL,
        })
      }
    } catch (e) {
      setResponseStatus(event, 500)
      return { errors: [{ message: `Invalid API_URL: ${API_URL}` }] }
    }

    const res = await $fetch<any>(upstream, {
      method: 'POST',
      headers,
      body: { query, variables },
      // Prevent hanging the request forever in production
      timeout: 15000,
      retry: 0,
      responseType: 'json',
    }).catch((err: any) => {
      // Convert non-JSON or network errors into GraphQL-style error
      const msg = err?.message || 'Upstream request failed'
      throw new Error(msg)
    })

    // Validate shape explicitly to avoid passing HTML/invalid payloads with 200
    if (res && typeof res === 'object') {
      if (Array.isArray(res.errors) && res.errors.length) {
        setResponseStatus(event, 502)
        return { errors: res.errors }
      }
      if ('data' in res) {
        return res
      }
    }

    setResponseStatus(event, 502)
    return { errors: [{ message: 'Upstream returned unexpected payload. Ensure your backend responds with { data, errors }.' }] }
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
