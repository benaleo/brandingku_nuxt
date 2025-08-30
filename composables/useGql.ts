// Helper to call GraphQL
export const useGql = () => {
    const runtimeConfig = useRuntimeConfig()
    const API_URL = runtimeConfig.public.API_URL
    const GRAPHQL_ENDPOINT = `${API_URL}/query`
    const token = useCookie<string | null>('token', { sameSite: 'lax' })

    const gqlFetch = async <T>(query: string, variables?: Record<string, any>, opts?: { auth?: boolean }): Promise<T> => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': '*/*'
        }
        if (opts?.auth && token.value) headers['Authorization'] = `Bearer ${token.value}`

        const res = await $fetch<any>(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers,
            body: { query, variables }
        })

        if (res.errors?.length) {
            const msg = res.errors.map((e: any) => e.message).join(', ')
            throw new Error(msg)
        }
        return res.data as T
    }

    return { gqlFetch }
}