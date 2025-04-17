import type { NitroFetchRequest } from 'nitropack'
import type { FetchOptions } from 'ofetch'

export const useApi = () => {
  const runtimeConfig = useRuntimeConfig()
  const token = useCookie('token')
  
  const $api = async <T>(
    endpoint: string,
    opts?: FetchOptions<any>
  ): Promise<T> => {
    const baseURL = 'http://localhost:8080' // Hardcoded for now, can be moved to runtimeConfig
    const url = `${baseURL}${endpoint}`
    
    try {
      return await $fetch<T>(url, {
        ...opts,
        headers: {
          ...opts?.headers,
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json',
          'Accept': '*/*'
        }
      })
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }
  
  return { $api }
}
