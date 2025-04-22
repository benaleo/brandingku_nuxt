export const useAuth = () => {
    const { $supabase } = useNuxtApp()
    const user = ref(null)
    const loading = ref(false)
    const error = ref(null)

    // Check current session on init
    onMounted(async () => {
        const { data } = await $supabase.auth.getSession()
        user.value = data.session?.user || null
    })

    // Login function
    const login = async (email, password) => {
        loading.value = true
        error.value = null

        try {
            const { data, error: authError } = await $supabase.auth.signInWithPassword({
                email,
                password
            })

            if (authError) throw authError
            user.value = data.user
            return data
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    // Logout function
    const logout = async () => {
        await $supabase.auth.signOut()
        user.value = null
    }

    return {
        user,
        loading,
        error,
        login,
        logout
    }
}