import type { Product } from "~/types/products.type";
import { ref, reactive, onMounted, watch } from 'vue'
import { useGql } from '~/composables/useGql'
import { useRuntimeConfig } from '#app'
import { useCookie } from '#app'

export const useProductService = (fetchResult?: boolean, dataId?: string) => {
    const { gqlFetch } = useGql()
    const config = useRuntimeConfig()
    const BASE_URL = config.public.API_URL
    const url = `${BASE_URL}/cms/v1/product${dataId ? `/${dataId}` : ''}`

    // State mimicking useApiFetch interface
    const datas = ref<any>(fetchResult ? [] : null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const pagination = ref({ page: 0, limit: 10, total: 0 })
    const params = reactive<{ keyword?: string; category?: string } >({})

    const changePage = (newPage: number) => {
        pagination.value.page = newPage
        if (fetchResult) fetchProducts()
    }
    const changeLimit = (newLimit: number) => {
        pagination.value.limit = newLimit
        if (fetchResult) fetchProducts()
    }
    const setParams = (newParams: Record<string, any>) => {
        Object.assign(params, newParams)
    }

    // GraphQL queries
    const fetchProducts = async () => {
        if (!fetchResult) return
        loading.value = true
        error.value = null
        try {
            const query = `
                query getProducts {
                    getProducts {
                        id
                        name
                        slug
                        description
                        highlight_image
                        highlight_description
                        is_highlight
                        is_recommended
                        is_upsell
                        category_id
                        additionals {
                            id
                            price
                            moq
                            stock
                            discount
                            discount_type
                            attributes { id category name }
                        }
                    }
                }
            `
            const res = await gqlFetch<{ getProducts: Product[] }>(query, undefined, { auth: true })
            let list = (res?.getProducts || []) as any[]

            // Apply client-side filters similar to previous implementation
            const kw = params.keyword?.toLowerCase()?.trim()
            if (kw && kw.length >= 1) {
                list = list.filter((x: any) =>
                    (x.name || '').toLowerCase().includes(kw) ||
                    (x.slug || '').toLowerCase().includes(kw)
                )
            }
            if (params.category) {
                list = list.filter((x: any) => String(x.category_id) === String(params.category))
            }

            // Pagination
            pagination.value.total = list.length
            const start = (pagination.value.page || 0) * (pagination.value.limit || 10)
            const end = start + (pagination.value.limit || 10)
            datas.value = list.slice(start, end)
        } catch (e: any) {
            console.error('[product] fetchProducts error:', e)
            error.value = e?.message || 'Failed to load products'
        } finally {
            loading.value = false
        }
    }

    const fetchDetail = async (id: number) => {
        if (fetchResult) return
        loading.value = true
        error.value = null
        try {
            const query = `
                query getProductDetail($id: Int!) {
                    getProductDetail(id: $id) {
                        id
                        name
                        slug
                        description
                        highlight_image
                        highlight_description
                        is_highlight
                        is_recommended
                        is_upsell
                        category_id
                        additionals {
                            id
                            price
                            moq
                            stock
                            discount
                            discount_type
                            attributes { id category name }
                        }
                    }
                }
            `
            const res = await gqlFetch<{ getProductDetail: Product }>(query, { id }, { auth: true })
            datas.value = res.getProductDetail
        } catch (e: any) {
            console.error('[product] fetchDetail error:', e)
            error.value = e?.message || 'Failed to load product detail'
        } finally {
            loading.value = false
        }
    }

    const refetch = async () => {
        if (fetchResult) return fetchProducts()
        if (dataId) return fetchDetail(Number(dataId))
    }

    // Auto fetch
    onMounted(() => {
        refetch()
    })
    if (fetchResult) {
        watch(params, () => fetchProducts(), { deep: true })
    }

    const getProducts = async (p: { page?: number; limit?: number } = {}) => {
        if (p.page !== undefined) changePage(p.page)
        if (p.limit) changeLimit(p.limit)
        return refetch()
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
        datas,
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