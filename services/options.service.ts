import { useApiFetch } from '~/composables/useApiFetch'
import type { OptionType } from '~/types/options.type';
import { useState, watch } from '#imports'

interface ProductAttribute {
  id: string;
  label: string;
  category: string;
}

export const useOptionsService = () => {
  const config = useRuntimeConfig()
  const BASE_URL = config.public.API_URL
  const categoriesUrl = `${BASE_URL}/cms/v1/option/product-categories`
  const attributesUrl = `${BASE_URL}/cms/v1/option/product-attributes`

  // Cached data for product categories
  const cachedCategories = useState<OptionType[]>('product-categories', () => [])
  const isFetchingCategories = useState<boolean>('is-fetching-categories', () => false)

  const {
    data,
    loading,
    error,
    refetch
  } = useApiFetch<OptionType[]>(categoriesUrl, {
    isResult: false,
    initialPage: 0,
    initialLimit: 10
  })

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
    
    // Otherwise, fetch the categories
    try {
      console.log('[OPTIONS] Fetching categories from API')
      isFetchingCategories.value = true
      await refetch()
      
      if (data.value) {
        cachedCategories.value = data.value
      }
      return data.value || []
    } finally {
      isFetchingCategories.value = false
    }
  }

  const fetchDiscountTypes = async (): Promise<OptionType[]> => {
    return [
      { id: 'PERCENTAGE', label: 'Percentage (%)' },
      { id: 'AMOUNT', label: 'Amount' }
    ];
  }

  const getProductAttributes = async (): Promise<ProductAttribute[]> => {
    return new Promise((resolve) => {
      const { data, loading, error, refetch } = useApiFetch<ProductAttribute[]>(attributesUrl, {
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
    datas: data,
    loading,
    error,
    reFetch: refetch,
    getProductsCategory,
    fetchDiscountTypes,
    getProductAttributes,
  }
}