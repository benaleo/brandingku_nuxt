import { ref } from 'vue'
import { useGql } from './useGql'

export type ProductCategoryOption = {
  id: string
  label: string
  parentName: string
}

export const useOptionProductCategories = () => {
  const { gqlFetch } = useGql()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const options = ref<ProductCategoryOption[]>([])

  const fetch = async () => {
    loading.value = true
    error.value = null
    try {
      const query = `
        query getProductCategoriesChild($parent: Int, $is_all: Boolean) {
          getProductCategoriesChild(parent_id: $parent, is_all: $is_all) {
            id
            name
            slug
            parent {
              name
            }
          }
        }
      `

      const response = await gqlFetch<{
        getProductCategoriesChild: Array<{ id: number; name: string; slug: string; parent?: { name: string } | null }>
      }>(
        query,
        {
          parent: 0,
          is_all: true,
        },
        { auth: true }
      )

      options.value = (response?.getProductCategoriesChild || []).map(({ id, name, parent }) => ({
        id: id.toString(),
        label: name,
        parentName: parent?.name ?? '',
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
