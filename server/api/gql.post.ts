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

    const res = await $fetch<any>(`${API_URL}/query`, {
      method: 'POST',
      headers,
      body: { query, variables },
    })

    // Pass through GraphQL-style response
    return res
  } catch (err: any) {
    setResponseStatus(event, 500)
    return { errors: [{ message: err?.message || 'GraphQL proxy error' }] }
  }
})
