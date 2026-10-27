import { ref } from 'vue'
import { useGql } from './useGql'
import type { ProductCategoryOption } from './useOptionProductCategories'

// shaped like category options so FieldXSelectWithGroupParent can render them
export const useOptionProducts = () => {
  const { gqlFetch } = useGql()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const options = ref<ProductCategoryOption[]>([])
  let requestId = 0

  const fetch = async (categoryId: number | null, groupName = '') => {
    const current = ++requestId
    if (!categoryId) {
      options.value = []
      error.value = null
      loading.value = false
      return
    }
    loading.value = true
    error.value = null
    try {
      const query = `
        query getProductOptions($category_id: Int, $page: Int, $limit: Int) {
          getProducts(category_id: $category_id, pagination: { page: $page, limit: $limit }) {
            items {
              id
              name
            }
          }
        }
      `
      const response = await gqlFetch<{ getProducts: { items: Array<{ id: number; name: string }> } }>(
        query,
        { category_id: categoryId, page: 1, limit: 500 },
        { auth: true }
      )
      // a newer category was picked while this request was in flight
      if (current !== requestId) return
      options.value = (response?.getProducts?.items || []).map(({ id, name }) => ({
        id: id.toString(),
        label: name,
        parentName: groupName,
      }))
    } catch (e: any) {
      if (current !== requestId) return
      error.value = e?.message || 'Failed to load products'
      console.error('Error fetching product options:', e)
      options.value = []
    } finally {
      if (current === requestId) loading.value = false
    }
  }

  return {
    options,
    loading,
    error,
    fetch
  }
}
