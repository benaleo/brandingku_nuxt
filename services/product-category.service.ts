import {useApiFetch} from '~/composables/useApiFetch'
import type {ProductCategory, ProductCategoryRequest} from "~/types/products.type";

export const useProductCategoryService = (fetchResult?: boolean, dataId?: string) => {
    const config = useRuntimeConfig()
    const BASE_URL = config.public.API_URL
    const url = `${BASE_URL}/cms/v1/product-category${dataId ? `/${dataId}` : ''}`
    console.log("url fetch is ", url)

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
    } = useApiFetch<ProductCategory>(url, {
        isResult: fetchResult,
        dynamicParam: dataId ? url : null,
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
        let fetchUrl = url
        return refetch();
    }

    const createProductCategory = async (payload: ProductCategoryRequest) => {
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
    const updateProductCategoryById = async (id: string, payload: ProductCategoryRequest) => {
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
    const deleteProductCategoryById = async (id: string) => {
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

    // Update Image
    const updateProductCategoryImage = async (id: string, data: { url: string }) => {
        const response = await fetch(`${url}/${id}/image?file=${data.url}`, {
            method: 'PUT',
            headers: {
                'Accept': '*/*',
                'Authorization': `Bearer ${useCookie('token').value}`,
            }
        })
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
        setParams,
        params,
        getProductsCategory,
        createProductCategory,
        updateProductCategoryById,
        updateProductCategoryImage,
        changePage,
        changeLimit,
        deleteProductCategoryById
    }
}