import {useApiFetch} from '~/composables/useApiFetch'
import type {OptionType} from '~/types/OptionType';

export const useOptionsService = () => {
  const config = useRuntimeConfig()
  const BASE_URL = config.public.API_URL
  const url = `${BASE_URL}/cms/v1/option/product-categories`

  const {
    data,
    loading,
    error,
    reFetch
  } = useApiFetch<OptionType[]>(url, {
    isResult: false,
    initialPage: 0,
    initialLimit: 10
  })

  const getProductsCategory = async () => {
    return reFetch();
  }

  const fetchDiscountTypes  = async (): Promise<OptionType[]> => {
    return [
      { id: 'PERCENTAGE', label: 'Percentage (%)' },
      { id: 'AMOUNT', label: 'Amount' }
    ];
  }

  return {
    datas: data,
    loading,
    error,
    reFetch,
    getProductsCategory,
    fetchDiscountTypes,
  }
}