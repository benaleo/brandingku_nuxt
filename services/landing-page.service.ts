import {useFetch} from '~/composables/useFetch'
import type {ProductCategory} from "~/components/datatables/productCategoryColumns";

export const useLandingFeaturedCategories = (fetchResult?: boolean, dataId?: string | null, isPublic?: boolean) => {
  const config = useRuntimeConfig()
  const BASE_URL = config.public.API_URL
  const url = `${BASE_URL}/api/v1/featured-category`

  const {
    data,
    loading,
    error,
    pagination,
    changePage,
    changeLimit,
    reFetch
  } = useFetch<ProductCategory>(url, {
    isResult: fetchResult,
    dynamicParam: dataId ? url : null,
    initialPage: 0,
    initialLimit: 10,
    isPublic
  })

  const fetchFeaturedCategories = async (params: {
    page?: number
    limit?: number
    sortBy?: string
    direction?: 'asc' | 'desc'
  } = {}) => {
    if (params.page !== undefined) changePage(params.page)
    if (params.limit) changeLimit(params.limit)

    // Additional query params can be added here
    return reFetch();
  }

  return {
    datas: data,
    loading,
    error,
    pagination,
    reFetch,
    fetchFeaturedCategories,
    changePage,
    changeLimit,
  }
}