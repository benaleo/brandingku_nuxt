import { gql } from '@apollo/client'
import { ref, computed, onMounted } from 'vue'
import type { ProductCategory } from '~/types/products.type'
import { useGql } from '~/composables/useGql'
import { useRuntimeConfig } from '#app'

export interface SubCategory {
  name: string
  description: string
  image: string
  cover: string
  slug: string
  total_products: number
  is_active: boolean
}

export interface ProductCategoryBySlug {
  slug: string
  name: string
  description: string
  cover_image: string
  banner_image: string
  meta_title: string
  meta_description: string
  sub: SubCategory[]
}

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

  onMounted(() => {
  // Remove automatic fetching - will be called manually when component is in view
})

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    refetch: fetchCategories
  }
}

export const useGetProductCategoryBySlug = (slug: string) => {
  const { gqlFetch } = useGql()
  const config = useRuntimeConfig()
  const STORAGE_URL = config.public.STORAGE_URL

  const data = ref<ProductCategoryBySlug | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchCategory = async () => {
    loading.value = true
    error.value = null
    try {
      const query = `
        query GetProductCategoryBySlug($slug: String!) {
          getProductCategoryBySlug(slug: $slug) {
            slug
            name
            description
            cover_image
            banner_image
            meta_title
            meta_description
            sub {
              name
              description
              image
              cover
              slug
              total_products
              is_active
            }
          }
        }
      `
      const res = await gqlFetch<{ getProductCategoryBySlug: ProductCategoryBySlug }>(
        query,
        { slug },
        { auth: true }
      )
      const result = res.getProductCategoryBySlug || null
      
      // Prepend STORAGE_URL to image URLs
      if (result) {
        result.cover_image = result.cover_image ? `${STORAGE_URL}${result.cover_image}` : result.cover_image
        result.banner_image = result.banner_image ? `${STORAGE_URL}${result.banner_image}` : result.banner_image
        
        if (result.sub) {
          result.sub = result.sub.map(subCategory => ({
            ...subCategory,
            image: subCategory.image ? `${STORAGE_URL}${subCategory.image}` : subCategory.image,
            cover: subCategory.cover ? `${STORAGE_URL}${subCategory.cover}` : subCategory.cover
          }))
        }
      }
      
      data.value = result
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch category'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchCategory()
  })

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    refetch: fetchCategory
  }
}