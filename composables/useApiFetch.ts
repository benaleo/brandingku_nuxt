import type {Ref} from 'vue'
import {useCookie} from '#app'
import {useRouter} from 'vue-router'

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface PaginatedResponse<T> {
    result: T[];
    currentPage: number;
    prevPage: number | null;
    nextPage: number | null;
    firstPage: number;
    lastPage: number | null;
    perPage: number;
    totalItems: number;
}

export const useApiFetch = <T>(url: string, options: {
    isResult?: boolean
    dynamicParam?: string | null
    initialPage?: number
    initialLimit?: number
    isPublic?: boolean
}) => {
    // --- NEW: Dynamic query params support ---
    const params = reactive<{ [key: string]: any }>({})
    const setParams = (newParams: Record<string, any>) => {
        Object.assign(params, newParams)
    }
    // --- END NEW ---
    const token = useCookie('token')
    const router = useRouter()

    const data: Ref<T | null> = ref(null)
    const loading = ref(true)
    const error = ref<string | null>(null)
    const refetching = ref(false)

    const pagination = ref({
        page: options.initialPage || 0,
        limit: options.initialLimit || 10,
        total: 0
    })

    const fetchData = async () => {
        let apiUrl = url

        // Handle dynamic params
        if (options.dynamicParam) {
            apiUrl = apiUrl.replace(`{${options.dynamicParam}}`, options.dynamicParam)
        }

        // --- MERGED: Append custom params + pagination params ---
        const query = new URLSearchParams()
        // Add custom params
        for (const key in params) {
            if (params[key] != null && params[key] !== '') {
                query.append(key, params[key])
            }
        }
        // Add pagination params
        if (pagination.value.page !== undefined) query.append('page', pagination.value.page.toString())
        if (pagination.value.limit !== undefined) query.append('limit', pagination.value.limit.toString())

        if ([...query].length > 0) {
            apiUrl += (apiUrl.includes('?') ? '&' : '?') + query.toString()
        }
        // --- END MERGED ---

        const finalUrl = apiUrl;
        // Add log for debugging URL after selectedOptions
        console.log('[useApiFetch] Fetching URL:', finalUrl)

        loading.value = true
        error.value = null
        try {
            const response = await $fetch<ApiResponse<
                typeof options.isResult extends true ? PaginatedResponse<T> : T
            >>(finalUrl, {
                headers: {
                    'accept': '*/*',
                    ...(options.isPublic ? {} : { 'Authorization': token.value ? `Bearer ${token.value}` : '' })
                }
            })

            if ((response as any)?.status === 403) {
                token.value = null
                router.push('/login')
                return
            }

            if (!response.success) {
                error.value = response.message
                return
            }

            if (options.isResult) {
                const paginatedData = response.data as PaginatedResponse<T>
                data.value = paginatedData.result as any
                pagination.value.total = paginatedData.totalItems
                pagination.value.page = paginatedData.currentPage
                console.log("response pagination", data.value)
            } else {
                data.value = response.data as any
                console.log("response single", data.value)
            }
        } catch (err: any) {
            error.value = err.message
        } finally {
            loading.value = false
            refetching.value = false
        }
    }

    const reFetch = async () => {
        refetching.value = true
        await fetchData()
        return data.value
    }

    const changePage = (newPage: number) => {
        pagination.value.page = newPage
        fetchData()
    }

    const changeLimit = (newLimit: number) => {
        pagination.value.limit = newLimit
        fetchData()
    }

    // --- NEW: Watch params and auto-refetch ---
    watch(params, fetchData, { deep: true })
    // --- END NEW ---

    // Initial fetch
    onMounted(fetchData)
    watch(refetching, (val) => val && fetchData())

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        pagination,
        changePage,
        changeLimit,
        setParams,
        params,
    }
}
