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

    const createProductCategory = async (payload: {
        name: string
        slug: string
        description: string
    }) => {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Authorization': `Bearer ${useCookie('token').value}`
            }
        })

        if (!response.ok) {
            const error = await response.json()
            throw error
        }

        const data = await response.json()
        return data
    }

    return {
        datas: data,
        loading,
        error,
        pagination,
        getProductsCategory,
        createProductCategory,
        changePage,
        changeLimit
    }
}