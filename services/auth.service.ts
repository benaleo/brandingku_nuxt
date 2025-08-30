import { useAuth } from '~/composables/useAuth'

interface AuthService {
    login: (email: string, password: string) => Promise<{ token: string | null }>;
    register: (name: string, email: string, password: string) => Promise<{ token: string; user: { email: string; name: string } }>;
    logout: () => void;
    refreshToken: () => Promise<{ token: string | null }>;
    user: Ref<{ email: string; name: string } | null>;
    loading: Ref<boolean>;
    error: Ref<string | null>;
    token: Ref<string | null>;
}

export const useAuthService = (): AuthService => {
    const auth = useAuth()
    
    return {
        login: auth.login,
        register: auth.register,
        logout: auth.logout,
        refreshToken: auth.refreshToken,
        user: auth.user,
        loading: auth.loading,
        error: auth.error,
        token: auth.token
    }
}

// Export the function itself, not the result of calling it
export default useAuthService
