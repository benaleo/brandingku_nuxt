export const useResetPassword = () => {
    const { gqlFetch } = useGql()
    const resetToken = useCookie<string | null>('reset_token', { sameSite: 'lax', maxAge: 600 })
    const loading = ref(false)
    const error = ref<string | null>(null)

    const requestOtp = async (email: string) => {
        loading.value = true
        error.value = null
        try {
            const mutation = `
                mutation otpRequest($email: String!, $type: String!) {
                    otpRequest(email: $email, type: $type)
                }
            `
            const data = await gqlFetch<{ otpRequest: boolean }>(mutation, { email, type: 'reset_password' })
            return data.otpRequest
        } catch (err: any) {
            error.value = err.message || 'Failed to send OTP'
            throw err
        } finally {
            loading.value = false
        }
    }

    const verifyOtp = async (email: string, token: string) => {
        loading.value = true
        error.value = null
        try {
            const mutation = `
                mutation otpVerify($email: String!, $token: String!, $type: String!) {
                    otpVerify(email: $email, token: $token, type: $type) {
                        token
                    }
                }
            `
            const data = await gqlFetch<{ otpVerify: { token: string } }>(mutation, { email, token, type: 'reset_password' })
            resetToken.value = data.otpVerify.token
            return data.otpVerify.token
        } catch (err: any) {
            error.value = err.message || 'Invalid or expired OTP'
            throw err
        } finally {
            loading.value = false
        }
    }

    const updatePassword = async (newPassword: string) => {
        loading.value = true
        error.value = null
        try {
            const mutation = `
                mutation updateUserPassword($password: String!) {
                    userUpdatePassword(newPassword: $password)
                }
            `
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Accept': '*/*',
            }
            if (resetToken.value) headers['Authorization'] = `Bearer ${resetToken.value}`

            const res = await $fetch<any>('/api/gql', {
                method: 'POST',
                headers,
                body: { query: mutation, variables: { password: newPassword } },
                responseType: 'json',
                retry: 0,
                timeout: 20000,
            })

            if (res?.errors?.length) {
                throw new Error(res.errors.map((e: any) => e?.message).join(', '))
            }
            if (!('data' in res)) throw new Error('Unexpected response')

            resetToken.value = null
            return res.data.userUpdatePassword as boolean
        } catch (err: any) {
            error.value = err.message || 'Failed to update password'
            throw err
        } finally {
            loading.value = false
        }
    }

    return { loading, error, resetToken, requestOtp, verifyOtp, updatePassword }
}
