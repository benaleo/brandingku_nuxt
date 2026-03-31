import { ref } from 'vue'
import type { OptionType } from '~/types/options.type'
import { useGql } from './useGql'

export const usePortfolioCategories = () => {
  const { gqlFetch } = useGql()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const options = ref<OptionType[]>([])

  const fetch = async () => {
    loading.value = true
    error.value = null
    try {
      const query = `
        query getProductCategories($is_landing_page: Boolean, $only_parent: Boolean) {
          getProductCategories(is_landing_page: $is_landing_page, only_parent: $only_parent) {
            id
            name
            slug
          }
        }
      `
      
      const response = await gqlFetch<{
        getProductCategories: Array<{ id: number, name: string, slug: string }>
      }>(
        query, 
        { 
          is_landing_page: false, 
          only_parent: false 
        },
        { auth: true }
      )
      
      options.value = (response?.getProductCategories || []).map(({ id, name }) => ({
        id: id.toString(),
        label: name
      }))
    } catch (e: any) {
      error.value = e?.message || 'Failed to load categories'
      console.error('Error fetching portfolio categories:', e)
      options.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    options,
    loading,
    error,
    fetch
  }
}
