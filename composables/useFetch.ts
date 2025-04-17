import type { Ref } from 'vue'
import { useCookie } from '#app'
import { useRouter } from 'vue-router'

export const useFetch = <T>(url: string, options: {
  isResult?: boolean
  dynamicParam?: string
  initialPage?: number
  initialLimit?: number
}) => {
  const token = useCookie('token')
  const router = useRouter()
  
  const data: Ref<T | null> = ref(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const refetching = ref(false)
  
  const pagination = ref({
    page: options.initialPage || 0,
    limit: options.initialLimit || 10
  })

  const fetchData = async () => {
    let apiUrl = url
    
    // Handle dynamic params
    if (options.isResult && options.dynamicParam) {
      apiUrl = apiUrl.replace(`{${options.dynamicParam}}`, options.dynamicParam)
    }
    
    // Add pagination params
    const query = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString()
    })
    apiUrl += `?${query.toString()}`
    
    try {
      loading.value = true
      const response = await $fetch<T>(apiUrl, {
        headers: {
          'accept': '*/*',
          'Authorization': token.value ? `Bearer ${token.value}` : ''
        }
      })

      if ((response as any)?.status === 403) {
        token.value = null
        router.push('/login')
      }

      data.value = options.isResult ? (response as any)?.data?.result : response
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
      refetching.value = false
    }
  }

  const reFetch = () => {
    refetching.value = true
    fetchData()
  }

  const changePage = (newPage: number) => {
    pagination.value.page = newPage
    fetchData()
  }

  const changeLimit = (newLimit: number) => {
    pagination.value.limit = newLimit
    fetchData()
  }

  // Initial fetch
  onMounted(fetchData)
  watch(refetching, (val) => val && fetchData())

  return { 
    data, 
    loading, 
    error, 
    reFetch,
    pagination,
    changePage,
    changeLimit
  }
}
