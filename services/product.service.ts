import {useApiFetch} from '~/composables/useApiFetch'
import type {Product} from "~/types/products.type";

export const useProductService = (fetchResult?: boolean, dataId?: string) => {
    const config = useRuntimeConfig()
    const BASE_URL = config.public.API_URL
    const url = `${BASE_URL}/cms/v1/product${dataId ? `/${dataId}` : ''}`

    const {
        data,
        loading,
        error,
        pagination,
        changePage,
        changeLimit,
        setParams,
        refetch,
        params
    } = useApiFetch<Product>(url, {
        isResult: fetchResult,
        dynamicParam: dataId ? url : null,
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
        return refetch();
    }

    const createProduct = async (payload: any) => {
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
            throw await response.json()
        }

        return await response.json()
    }

    // General UPDATE function
    const updateProductById = async (id: string, payload: any) => {
        const response = await fetch(`${url}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Authorization': `Bearer ${useCookie('token').value}`
            }
        })
        if (!response.ok) {
            throw await response.json()
        }
        return await response.json()
    }

    // General DELETE function
    const deleteProductById = async (id: string) => {
        const response = await fetch(`${url}/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': '*/*',
                'Authorization': `Bearer ${useCookie('token').value}`
            }
        })
        if (!response.ok) {
            const error = await response.json()
            throw error
        }
        return await response.json()
    }

    // Update Image Product Galleries
    const updateProductGalleries = async (id: string, payload: {
        newFileUrl: string[],
        removeIds: string[]
    }) => {
        const response = await fetch(`${url}/${id}/gallery?newFile=${payload.newFileUrl.join(',')}&removeId=${payload.removeIds.join(',')}`, {
            method: 'PUT',
            headers: {
                'Accept': '*/*',
                'Authorization': `Bearer ${useCookie('token').value}`
            }
        })
        // console.log("response upload image gallery", await response.json())
        if (!response.ok) {
            throw await response.json()
        }
        return await response.json()
    }


    return {
        datas: data,
        loading,
        error,
        pagination,
        reFetch: refetch,
        getProducts,
        createProduct,
        updateProductById,
        updateProductGalleries,
        deleteProductById,
        changePage,
        changeLimit,
        setParams,
        params
    }
}