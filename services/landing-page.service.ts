import { gql } from '@apollo/client'
import { ref, computed, onMounted } from 'vue'
import type { ProductCategory } from '~/types/products.type'
import { useGql } from '~/composables/useGql'
import { useRuntimeConfig } from '#app'

export interface SubCategory {
  id: number
  name: string
  description: string
  image: string
  cover: string
  slug: string
  total_products: number
  is_active: boolean
  catalog_file: string
  catalog_file_name: string
  // a link elsewhere (e.g. Google Drive) used instead of a file
  catalog_url: string
}

export interface ProductCategoryBySlug {
  id: number
  slug: string
  name: string
  description: string
  cover_image: string
  banner_image: string
  meta_title: string
  meta_description: string
  catalog_file: string
  catalog_file_name: string
  catalog_url: string
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
            landing_image
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
  const event = useRequestEvent()

  const fetchCategory = async (): Promise<ProductCategoryBySlug | null> => {
    const query = `
      query GetProductCategoryBySlug($slug: String!) {
        getProductCategoryBySlug(slug: $slug) {
          id
          slug
          name
          description
          cover_image
          banner_image
          meta_title
          meta_description
          catalog_file
          catalog_file_name
          catalog_url
          sub {
            id
            name
            description
            image
            cover
            slug
            total_products
            is_active
            catalog_file
            catalog_file_name
            catalog_url
          }
        }
      }
    `
    // an unknown slug answers with a "category not found" error (or null); either way the page
    // gets a real 404 so search engines drop the url
    const res = await gqlFetch<{ getProductCategoryBySlug: ProductCategoryBySlug }>(
      query,
      { slug },
      { auth: true }
    ).catch((e: any) => {
      if (event && /not found/i.test(e?.message || '')) setResponseStatus(event, 404)
      throw e
    })
    const result = res.getProductCategoryBySlug || null
    if (!result && event) setResponseStatus(event, 404)
    
    // Prepend STORAGE_URL to image URLs
    if (result) {
      result.cover_image = result.cover_image ? `${STORAGE_URL}${result.cover_image}` : result.cover_image
      result.banner_image = result.banner_image ? `${STORAGE_URL}${result.banner_image}` : result.banner_image
      result.catalog_file = result.catalog_file ? `${STORAGE_URL}${result.catalog_file}` : ''
      
      if (result.sub) {
        result.sub = result.sub.map(subCategory => ({
          ...subCategory,
          image: subCategory.image ? `${STORAGE_URL}${subCategory.image}` : subCategory.image,
          cover: subCategory.cover ? `${STORAGE_URL}${subCategory.cover}` : subCategory.cover,
          catalog_file: subCategory.catalog_file ? `${STORAGE_URL}${subCategory.catalog_file}` : '',
        }))
      }
    }

    return result
  }

  // fetched during SSR so the category name, description and sub categories reach crawlers
  const { data, status, error, refresh } = useAsyncData(`product-category-${slug}`, fetchCategory)

  return {
    data: computed(() => data.value ?? null),
    loading: computed(() => status.value === 'pending'),
    error: computed(() => (error.value ? error.value.message || 'Failed to fetch category' : null)),
    refetch: () => refresh()
  }
}