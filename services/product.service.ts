import type {Product} from '~/types/product'
import type {Pagination} from '~/types/pagination'
import {useFetch} from '~/composables/useFetch'

export const useProductService = () => {
    const {
        data,
        loading,
        error,
        pagination,
        changePage,
        changeLimit,
        reFetch
    } = useFetch<Pagination<Product>>('http://localhost:8080/cms/v1/product', {
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
        getProducts
    }
}
