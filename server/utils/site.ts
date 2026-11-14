import { useRuntimeConfig } from '#imports'

// public origin used in sitemap and robots; falls back to the request host when BASE_URL is unset
export const siteOrigin = (requestOrigin: string) =>
  (useRuntimeConfig().public.BASE_URL || requestOrigin).replace(/\/+$/, '')

// anonymous GraphQL call straight to the backend, for server routes that have no visitor session
export const backendGql = async <T>(query: string, variables?: Record<string, unknown>): Promise<T> => {
  const config = useRuntimeConfig()
  const base = String(config.public.API_URL || '').replace(/\/+$/, '')
  if (!base) throw new Error('API_URL is not configured on the server')
  const path = `/${String(config.public.graphqlPath || '/query').replace(/^\/+/, '')}`

  const res = await $fetch<{ data?: T; errors?: { message?: string }[] }>(`${base}${path}`, {
    method: 'POST',
    body: { query, variables },
    retry: 1,
    timeout: 20000,
  })
  if (res.errors?.length) throw new Error(res.errors.map((e) => e.message || 'GraphQL error').join(', '))
  if (!res.data) throw new Error('Empty GraphQL response')
  return res.data
}
