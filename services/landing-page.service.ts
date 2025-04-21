import {useApiFetch} from '~/composables/useApiFetch'
import type {ProductCategory} from "~/components/datatables/productCategoryColumns";

export const useLandingFeaturedCategories = (fetchResult?: boolean, slug?: string | null, isPublic?: boolean) => {
  const config = useRuntimeConfig()
  const BASE_URL = config.public.API_URL

  // Always build query string with all params
  const params = new URLSearchParams()
  if (slug) params.append('slug', slug)
  // Add more params as needed

  const url = `${BASE_URL}/api/v1/featured-category`

  const dynamicParam = slug ? url : null

  const {
    data,
    loading,
    error,
    pagination,
    changePage,
    changeLimit,
    reFetch
  } = useApiFetch<ProductCategory>(url, {
    isResult: fetchResult,
    dynamicParam,
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
    // Optionally handle sortBy/direction here
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