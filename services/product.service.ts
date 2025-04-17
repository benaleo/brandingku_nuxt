import {useFetch} from '~/composables/useFetch'
import type {Product} from "~/components/datatables/productColumns";

export const useProductService = () => {
    const config = useRuntimeConfig()
    const BASE_URL = config.public.API_URL
    const url = `${BASE_URL}/cms/v1/product`

    const {
        data,
        loading,
        error,
        pagination,
        changePage,
        changeLimit,
        reFetch
    } = useFetch<Product>(url, {
        isResult: true,
        initialPage: 0,
        initialLimit: 10
    })

    const getProducts = async (params: {
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
        getProducts,
        changePage,
        changeLimit
    }
}
