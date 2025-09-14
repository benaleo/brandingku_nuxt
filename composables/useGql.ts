// Helper to call GraphQL
export const useGql = () => {
    const runtimeConfig = useRuntimeConfig()
    // Route through server proxy to avoid client-side CORS and ensure env/token handling
    const GRAPHQL_ENDPOINT = `/api/gql`
    const token = useCookie<string | null>('token', { sameSite: 'lax' })

    const gqlFetch = async <T>(query: string, variables?: Record<string, any>, opts?: { auth?: boolean }): Promise<T> => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': '*/*'
        }
        if (opts?.auth && token.value) headers['Authorization'] = `Bearer ${token.value}`

        try {
            const res = await $fetch<any>(GRAPHQL_ENDPOINT, {
                method: 'POST',
                headers,
                body: { query, variables },
                // Ensure we fail fast if server responds with non-JSON/HTML
                responseType: 'json',
                retry: 0,
                timeout: 20000,
            })

            // Validate GraphQL response shape
            if (res && typeof res === 'object') {
                if (Array.isArray(res.errors) && res.errors.length) {
                    const msg = res.errors.map((e: any) => e?.message || 'GraphQL error').join(', ')
                    throw new Error(msg)
                }
                if ('data' in res) {
                    return res.data as T
                }
            }
            // Unexpected shape (e.g., HTML string proxied or wrong upstream)
            throw new Error('[GQL] Unexpected response from server proxy. Ensure server/api/gql.post.ts reaches your backend and returns GraphQL { data, errors }.')
        } catch (err: any) {
            // Bubble up with context
            const msg = err?.message || String(err)
            throw new Error(`[GQL] Request failed: ${msg}`)
        }
    }

    return { gqlFetch }
}