import { gql } from '@apollo/client'
import type { ProductCategory } from '~/types/products.type'
import { useGql } from '~/composables/useGql'

export const useLandingFeaturedCategories = () => {
  const { gqlFetch } = useGql()

  const data = ref<ProductCategory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const query = `
        query GetProductCategories {
          getProductCategories(is_landing_page: true) {
            id
            name
            image
            slug
          }
        }
      `
      const res = await gqlFetch<{ getProductCategories: ProductCategory[] }>(query, undefined, { auth: true })
      data.value = res.getProductCategories || []
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch categories'
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchCategories)

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    refetch: fetchCategories
  }
}