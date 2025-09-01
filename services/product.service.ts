import type { Product } from "~/types/products.type";
import { ref, reactive, onMounted, watch } from 'vue'
import { useGql } from '~/composables/useGql'
import { useProductAdditionalService } from '~/services/product-additional.service'
import { useProductGalleriesService } from '~/services/product-galleries.service'
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
                        image
                        category {
                            id
                            name
                        }
                        is_highlight
                        is_recommended
                        is_upsell
                        galleries { id image orders }
                        additionals {
                            id
                            name
                            price
                            moq
                            stock
                            discount
                            discount_type
                            attributes
                        }
                        created_at
                        updated_at
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
            // Category-based client filtering removed due to schema changes

            // Pagination
            pagination.value.total = list.length
            const start = (pagination.value.page || 0) * (pagination.value.limit || 10)
            const end = start + (pagination.value.limit || 10)
            datas.value = list.slice(start, end)
        } catch (e: any) {
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
                        image
                        category {
                            id
                            name
                        }
                        is_highlight
                        is_recommended
                        is_upsell
                        galleries { id image orders }
                        additionals {
                            id
                            name
                            price
                            moq
                            stock
                            discount
                            discount_type
                            attributes
                        }
                        created_at
                        updated_at
                    }
                }
            `
            const res = await gqlFetch<{ getProductDetail: Product }>(query, { id }, { auth: true })
            datas.value = res.getProductDetail
        } catch (e: any) {
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
        const mutation = `
            mutation CreateProduct(
                $name: String!
                $description: String!
                $image: String
                $product_category_id: Int!
                $is_highlight: Boolean!
                $is_recommended: Boolean!
                $is_upsell: Boolean!
                $is_active: Boolean
            ) {
                createProduct(
                    name: $name
                    description: $description
                    image: $image
                    product_category_id: $product_category_id
                    is_highlight: $is_highlight
                    is_recommended: $is_recommended
                    is_upsell: $is_upsell
                    is_active: $is_active
                ) {
                    id
                    name
                }
            }
        `
        const variables = {
            name: payload.name,
            description: payload.description ?? null,
            image: payload.image ?? null,
            product_category_id: Number(payload.product_category_id),
            is_highlight: Boolean(payload.is_highlight),
            is_recommended: Boolean(payload.is_recommended),
            is_upsell: Boolean(payload.is_upsell),
            is_active: payload.is_active != null ? Boolean(payload.is_active) : null,
        }
        
        // Create product first
        const res = await gqlFetch<{ createProduct: { id: string; name: string } }>(mutation, variables, { auth: true })
        const productId = Number(res?.createProduct.id)
        
        if (!productId) throw new Error('Failed to create product')
        
        // Handle additionals if any
        if (payload.additionals?.length) {
            const additionalService = useProductAdditionalService()
            for (const additional of payload.additionals) {
                await additionalService.createProductAdditional({
                    ...additional,
                    product_id: productId
                })
            }
        }
        
        // Handle galleries if any
        if (payload.galleries?.length) {
            const galleryService = useProductGalleriesService()
            for (const gallery of payload.galleries) {
                await galleryService.createProductGallery({
                    ...gallery,
                    product_id: productId
                })
            }
        }
        
        return res?.createProduct
    }

    // General UPDATE function
    const updateProductById = async (id: string, payload: any) => {
        // GraphQL mutation per provided schema
        const mutation = `
            mutation UpdateProduct(
                $id: Int!,
                $name: String!,
                $description: String,
                $image: String,
                $product_category_id: Int!,
                $is_highlight: Boolean!,
                $is_recommended: Boolean!,
                $is_upsell: Boolean!,
                $is_active: Boolean
            ) {
                updateProduct(
                    id: $id,
                    name: $name,
                    description: $description,
                    image: $image,
                    product_category_id: $product_category_id,
                    is_highlight: $is_highlight,
                    is_recommended: $is_recommended,
                    is_upsell: $is_upsell,
                    is_active: $is_active
                ) {
                    id
                    name
                }
            }
        `
        const variables = {
            id: Number(id),
            name: payload.name,
            description: payload.description ?? null,
            image: payload.image ?? null,
            product_category_id: Number(payload.product_category_id),
            is_highlight: Boolean(payload.is_highlight),
            is_recommended: Boolean(payload.is_recommended),
            is_upsell: Boolean(payload.is_upsell),
            is_active: payload.is_active != null ? Boolean(payload.is_active) : null,
        }
        const res = await gqlFetch<{ updateProduct: { id: string; name: string } }>(mutation, variables, { auth: true })

        // Handle galleries update/create if any
        if (payload.galleries?.length) {
            const galleryService = useProductGalleriesService()
            for (const gallery of payload.galleries) {
                try {
                    // Only treat as existing when ID is numeric (DB-generated)
                    const idStr = String(gallery.id ?? '')
                    const hasId = /^\d+$/.test(idStr)
                    if (hasId) {
                        // Update existing gallery (e.g., orders)
                        await galleryService.updateProductGallery(Number(idStr), {
                            // image can be optionally updated; omit if empty/undefined
                            ...(gallery.image ? { image: gallery.image } : {}),
                            orders: Number(gallery.orders) || 0,
                        })
                    } else {
                        // Create new gallery for this product
                        await galleryService.createProductGallery({
                            image: gallery.image,
                            orders: Number(gallery.orders) || 0,
                            product_id: Number(id)
                        })
                    }
                } catch (e) {
                }
            }
        }

        // Handle additionals update/create/delete if any
        if (Array.isArray(payload.additionals)) {
            try {
                const additionalService = useProductAdditionalService()

                // Fetch existing additionals to detect deletions
                const existing = await additionalService.getProductAdditionals(Number(id))
                const existingIds = new Set((existing || []).map((a: any) => String(a.id)))
                const incomingIds = new Set(
                    payload.additionals
                        .filter((a: any) => a?.id != null && `${a.id}`.length > 0)
                        .map((a: any) => String(a.id))
                )

                // Update or create incoming additionals
                for (const add of payload.additionals) {
                    const hasId = add?.id != null && `${add.id}`.length > 0
                    const normalized = {
                        name: add.name ?? '',
                        moq: Number(add.moq) || 0,
                        price: Number(add.price) || 0,
                        stock: Number(add.stock) || 0,
                        discount: Number(add.discount) || 0,
                        discount_type: add.discount_type ?? 'AMOUNT',
                        attributes: typeof add.attributes === 'string' ? add.attributes : '[]',
                    }

                    if (hasId) {
                        await additionalService.updateProductAdditional(Number(add.id), normalized)
                    } else {
                        await additionalService.createProductAdditional({
                            ...normalized,
                            product_id: Number(id),
                        })
                    }
                }

                // Delete removed additionals (present in existing but not in incoming)
                for (const ex of existing || []) {
                    const exId = String(ex.id)
                    if (!incomingIds.has(exId)) {
                        await additionalService.deleteProductAdditional(Number(exId))
                    }
                }
            } catch (e) {
            }
        }

        return res?.updateProduct
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