import {useApiFetch} from '~/composables/useApiFetch'
import type {ProductAttribute} from "~/components/datatables/productAttributeColumns";

export const useProductAttributeService = (fetchResult?: boolean, dataId?: string) => {
    const config = useRuntimeConfig()
    const BASE_URL = config.public.API_URL
    const url = `${BASE_URL}/cms/v1/product-attribute${dataId ? `/${dataId}` : ''}`
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
    } = useApiFetch<ProductAttribute>(url, {
        isResult: fetchResult,
        dynamicParam: dataId ? url : null,
        initialPage: 0,
        initialLimit: 10
    })

    const getProductsAttribute = async (params: {
        page?: number
        limit?: number
        sortBy?: string
        direction?: 'asc' | 'desc'
        category?: string | number
    } = {}) => {
        if (params.page !== undefined) changePage(params.page)
        if (params.limit) changeLimit(params.limit)

        // Add category to query params if provided
        let fetchUrl = url
        if (params.category) {
            const urlObj = new URL(fetchUrl)
            urlObj.searchParams.set('category', String(params.category))
            fetchUrl = urlObj.toString()
        }

        // Use reFetch with dynamicParam if category is set
        return refetch();
    }

    const createProductAttribute = async (payload: {
        name: string
        category: string
        is_active: boolean
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
            throw await response.json()
        }

        return await response.json()
    }

    // General UPDATE function
    const updateProductAttributeById = async (id: string, payload: {
        name: string;
        category: string;
        is_active: boolean;
    }) => {
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
    const deleteProductAttributeById = async (id: string) => {
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


    // Add filterByCategory function
    function filterByCategory(categoryId: string) {
        if (!Array.isArray(data.value)) return [];
        // Adjust the property name if needed
        return data.value.filter(attr => attr.category_id === categoryId);
    }

    return {
        datas: data,
        loading,
        error,
        pagination,
        refetch,
        setParams,
        params,
        getProductsAttribute,
        createProductAttribute,
        updateProductAttributeById,
        deleteProductAttributeById,
        changePage,
        changeLimit,
        filterByCategory
    }
}