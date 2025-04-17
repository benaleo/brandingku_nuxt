import {useFetch} from '~/composables/useFetch'
import type {ProductCategory} from "~/components/datatables/productCategoryColumns";

export const useProductCategoryService = () => {
    const config = useRuntimeConfig()
    const BASE_URL = config.public.API_URL
    const url = `${BASE_URL}/cms/v1/product-category`

    const {
        data,
        loading,
        error,
        pagination,
        changePage,
        changeLimit,
        reFetch
    } = useFetch<ProductCategory>(url, {
        isResult: true,
        initialPage: 0,
        initialLimit: 10
    })

    const getProductsCategory = async (params: {
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
        products: data,
        loading,
        error,
        pagination,
        getProductsCategory,
        changePage,
        changeLimit
    }
}
