interface User {
    email: string;
    name: string;
}

export const useAuth = () => {
    const runtimeConfig = useRuntimeConfig()
    const API_URL = runtimeConfig.public.API_URL
    const GRAPHQL_ENDPOINT = `${API_URL}/query`

    const user = ref<User | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const token = useCookie<string | null>('token', { sameSite: 'lax' })

    // Initialize from existing token if any
    onMounted(() => {
        // If you want to decode the token to populate user, do it here.
        // For now we only rely on register response to set user email.
        if (!token.value) return
    })

    // Helper to call GraphQL
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

    // Register -> returns user { email }
    const register = async (name: string, email: string, password: string) => {
        loading.value = true
        error.value = null
        try {
            const query = `
                mutation Register($name: String!, $email: String!, $password: String!) {
                    register(name: $name, email: $email, password: $password) {
                        token
                        user { 
                            email
                            name
                        }
                    }
                }
            `
            const data = await gqlFetch<{ 
                register: { 
                    token: string
                    user: { 
                        email: string
                        name: string
                    } 
                } 
            }>(query, { name, email, password })
            
            token.value = data.register.token
            user.value = { 
                email: data.register.user.email,
                name: data.register.user.name 
            }
            return data.register
        } catch (err: any) {
            error.value = err.message || 'Register failed'
            throw err
        } finally {
            loading.value = false
        }
    }

    // Login -> returns token
    const login = async (email: string, password: string) => {
        loading.value = true
        error.value = null
        try {
            const query = `
                mutation Login($email: String!, $password: String!) {
                    login(email: $email, password: $password) {
                        token
                    }
                }
            `
            const data = await gqlFetch<{ login: { token: string } }>(query, { email, password })
            token.value = data.login.token || null
            return { token: token.value }
        } catch (err: any) {
            error.value = err.message || 'Login failed'
            throw err
        } finally {
            loading.value = false
        }
    }

    // Logout -> returns boolean
    const logout = async () => {
        loading.value = true
        error.value = null
        try {
            const query = `
                mutation Logout {
                    logout
                }
            `
            const data = await gqlFetch<{ logout: boolean }>(query, {}, { auth: true })
            token.value = null
            user.value = null
            return data.logout
        } catch (err: any) {
            // Even if API fails, clear local session to be safe
            token.value = null
            user.value = null
            error.value = err.message || 'Logout failed'
            throw err
        } finally {
            loading.value = false
        }
    }

    // Refresh token -> returns token
    const refreshToken = async () => {
        loading.value = true
        error.value = null
        try {
            const query = `
                mutation RefreshToken {
                    refreshToken {
                        token
                    }
                }
            `
            const data = await gqlFetch<{ refreshToken: { token: string } }>(query, {}, { auth: true })
            token.value = data.refreshToken?.token || null
            return { token: token.value }
        } catch (err: any) {
            error.value = err.message || 'Refresh token failed'
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        user,
        loading,
        error,
        token,
        register,
        login,
        logout,
        refreshToken,
    }
}