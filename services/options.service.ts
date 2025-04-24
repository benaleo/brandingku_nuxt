import { useApiFetch } from '~/composables/useApiFetch'
import type { OptionType } from '~/types/OptionType';

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

  const {
    data,
    loading,
    error,
    reFetch
  } = useApiFetch<OptionType[]>(categoriesUrl, {
    isResult: false,
    initialPage: 0,
    initialLimit: 10
  })

  const getProductsCategory = async () => {
    return reFetch();
  }

  const fetchDiscountTypes = async (): Promise<OptionType[]> => {
    return [
      { id: 'PERCENTAGE', label: 'Percentage (%)' },
      { id: 'AMOUNT', label: 'Amount' }
    ];
  }

  const getProductAttributes = async (): Promise<ProductAttribute[]> => {
    return new Promise((resolve) => {
      const { data, loading, error, reFetch } = useApiFetch<ProductAttribute[]>(attributesUrl, {
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
    reFetch,
    getProductsCategory,
    fetchDiscountTypes,
    getProductAttributes,
  }
}