import { ref } from 'vue'
import type { OptionType } from '~/types/options.type'
import { useGql } from './useGql'

export const useOptionProductCategories = () => {
  const { gqlFetch } = useGql()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const options = ref<OptionType[]>([])

  const fetch = async () => {
    loading.value = true
    error.value = null
    try {
      const query = `
        query GetProductCategories($parentId: Int!, $isAll: Boolean!) {
          getProductCategoriesChild(parent_id: $parentId, is_all: $isAll) {
            id
            name
          }
        }
      `
      
      const response = await gqlFetch<{
        getProductCategoriesChild: Array<{ id: number, name: string }>
      }>(
        query, 
        { 
          parentId: 0, 
          isAll: true 
        },
        { auth: true }
      )
      
      options.value = (response?.getProductCategoriesChild || []).map(({ id, name }) => ({
        id: id.toString(),
        label: name
      }))
    } catch (e: any) {
      error.value = e?.message || 'Failed to load categories'
      console.error('Error fetching product categories:', e)
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
