import { useApiFetch } from '~/composables/useApiFetch'
import type {OptionType, ProductAttributeOptions} from '~/types/options.type';
import { useState, watch } from '#imports'

export const useOptionsService = () => {
  const config = useRuntimeConfig()
  const BASE_URL = config.public.API_URL
  const categoriesUrl = `${BASE_URL}/cms/v1/option/product-categories`
  const attributesUrl = `${BASE_URL}/cms/v1/option/product-attributes`

  // Cached data for product categories
  const cachedCategories = useState<OptionType[]>('product-categories', () => [])
  const isFetchingCategories = useState<boolean>('is-fetching-categories', () => false)

  const getProductsCategory = async (): Promise<OptionType[]> => {
    // If we already have cached categories, return them immediately
    if (cachedCategories.value.length > 0) {
      console.log('[OPTIONS] Returning cached categories')
      return cachedCategories.value
    }
    
    // If already fetching, wait for it to complete
    if (isFetchingCategories.value) {
      console.log('[OPTIONS] Already fetching categories, waiting...')
      // Wait for the current fetch to complete
      await new Promise<void>(resolve => {
        const unwatch = watch(isFetchingCategories, (val) => {
          if (!val) {
            unwatch()
            resolve()
          }
        })
      })
      return cachedCategories.value
    }
    
    // Create a new promise-based approach similar to getProductAttributes
    isFetchingCategories.value = true
    
    try {
      console.log('[OPTIONS] Fetching categories from API')
      return await new Promise<OptionType[]>((resolve) => {
        const { data, loading, error, refetch } = useApiFetch<OptionType[]>(categoriesUrl, {
          isResult: false,
          initialPage: 0,
          initialLimit: 10
        })
        
        // Watch for data changes to resolve the promise when data is loaded
        watch([loading, data], ([isLoading, currentData]) => {
          console.log('[OPTIONS] Categories loading:', isLoading, 'data:', currentData)
          if (!isLoading && currentData) {
            // Update the cache
            cachedCategories.value = currentData || []
            isFetchingCategories.value = false
            resolve(currentData || [])
          }
        }, { immediate: true })
        
        // If there's already data available, resolve immediately
        if (!loading.value && data.value) {
          cachedCategories.value = data.value || []
          isFetchingCategories.value = false
          resolve(data.value)
        }
        
        // Trigger the fetch
        refetch()
      })
    } catch (error) {
      console.error('[OPTIONS] Error fetching categories:', error)
      isFetchingCategories.value = false
      return []
    }
  }

  const fetchDiscountTypes = async (): Promise<OptionType[]> => {
    return [
      { id: 'PERCENTAGE', label: 'Percentage (%)' },
      { id: 'AMOUNT', label: 'Amount' }
    ];
  }

  const getProductAttributes = async (): Promise<ProductAttributeOptions[]> => {
    return new Promise((resolve) => {
      const { data, loading, error, refetch } = useApiFetch<ProductAttributeOptions[]>(attributesUrl, {
        isResult: false,
        initialPage: 0,
        initialLimit: 10
      })
      
      // Watch for data changes to resolve the promise when data is loaded
      watch([loading, data], ([isLoading, currentData]) => {
        console.log('Product Attributes loading:', isLoading, 'data:', currentData)
        if (!isLoading && currentData) {
          resolve(currentData || [])
        }
      }, { immediate: true })
      
      // If there's already data available, resolve immediately
      if (!loading.value && data.value) {
        resolve(data.value)
      }
    })
  }

  return {
    getProductsCategory,
    fetchDiscountTypes,
    getProductAttributes,
  }
}