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

  return {
    datas: data,
    loading,
    error,
    reFetch,
    getProductsCategory,
  }
}