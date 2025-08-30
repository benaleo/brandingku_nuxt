import type { ProductCategory } from "~/types/products.type";
import { ref, reactive, onMounted, watch } from 'vue'
import { useGql } from '~/composables/useGql'
import { useCookie } from '#app'

export const useProductCategoryService = () => {
    const { gqlFetch } = useGql()

    // State for list view (client-side pagination over GraphQL results)
    const datas = ref<ProductCategory[]>([])
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const pagination = ref({ page: 0, limit: 10, total: 0 })
    const params = reactive<{ keyword?: string }>({})

    const fetchParents = async () => {
        loading.value = true
        error.value = null
        try {
            const query = `
                query getProductCategories {
                    getProductCategories {
                        id
                        name
                        slug
                        description
                        image
                        is_landing_page
                        is_active
                        created_at
                        updated_at
                        parent_id
                    }
                }
            `
            const res = await gqlFetch<{ getProductCategories: ProductCategory[] }>(
                query,
                undefined,
                { auth: true }
            )
            const all = (res?.getProductCategories || []) as ProductCategory[]

            // only parents
            let filtered = (all as any[]).filter((x) => x?.parent_id == null)

            // filter by keyword (name or slug)
            const kw = params.keyword?.toLowerCase()?.trim()
            if (kw && kw.length >= 1) {
                filtered = filtered.filter((x: any) =>
                    (x.name || '').toLowerCase().includes(kw) ||
                    (x.slug || '').toLowerCase().includes(kw)
                )
            }

            // client-side pagination
            pagination.value.total = filtered.length
            const start = (pagination.value.page || 0) * (pagination.value.limit || 10)
            const end = start + (pagination.value.limit || 10)
            datas.value = filtered.slice(start, end)
        } catch (e: any) {
            console.error('[product-category] fetchParents error:', e)
            error.value = e?.message || 'Gagal memuat data kategori'
        } finally {
            loading.value = false
        }
    }

    const reFetch = () => fetchParents()
    const changePage = (newPage: number) => {
        pagination.value.page = newPage
        fetchParents()
    }
    const changeLimit = (newLimit: number) => {
        pagination.value.limit = newLimit
        fetchParents()
    }
    const setParams = (newParams: Record<string, any>) => {
        Object.assign(params, newParams)
    }

    watch(params, fetchParents, { deep: true })
    onMounted(fetchParents)

    // Get all parent categories
    const getProductCategoriesParent = async () => {
        const query = `
            query getProductCategories {
                getProductCategories {
                    id
                    name
                }
            }
        `

        const data = await gqlFetch<{ getProductCategories: ProductCategory[] }>(
            query,
            undefined,
            { auth: true }
        )
        return data.getProductCategories
    }

    // Create a new product category
    const createProductCategory = async (vars: {
        name: string
        slug: string
        description?: string
        image?: string
        parent_id?: number
        is_landing_page?: boolean
    }) => {
        const mutation = `
            mutation CreateProductCategory(
                $name: String!,
                $slug: String!,
                $description: String,
                $image: String,
                $parent_id: Int,
                $is_landing_page: Boolean
            ) {
                createProductCategory(
                    name: $name,
                    slug: $slug,
                    description: $description,
                    image: $image,
                    parent_id: $parent_id,
                    is_landing_page: $is_landing_page
                ) {
                    id
                    name
                    slug
                    description
                    image
                    is_landing_page
                    is_active
                    created_at
                    updated_at
                }
            }
        `

        const data = await gqlFetch<{ createProductCategory: ProductCategory }>(
            mutation,
            { ...vars },
            { auth: true }
        )
        return data.createProductCategory
    }

    // Update a product category
    const updateProductCategory = async (vars: {
        id: number
        name: string
        slug?: string
        description?: string
        image?: string
        parent_id?: number
        is_landing_page?: boolean
    }) => {
        const mutation = `
            mutation UpdateProductCategory(
                $id: Int!,
                $name: String!,
                $slug: String,
                $description: String,
                $image: String,
                $parent_id: Int,
                $is_landing_page: Boolean
            ) {
                updateProductCategory(
                    id: $id,
                    name: $name,
                    slug: $slug,
                    description: $description,
                    image: $image,
                    parent_id: $parent_id,
                    is_landing_page: $is_landing_page
                ) {
                    id
                    name
                    slug
                    description
                    image
                    is_landing_page
                    is_active
                    created_at
                    updated_at
                }
            }
        `

        const data = await gqlFetch<{ updateProductCategory: ProductCategory }>(
            mutation,
            { ...vars },
            { auth: true }
        )
        return data.updateProductCategory
    }

    // Delete a product category
    const deleteProductCategory = async (id: number) => {
        const mutation = `
            mutation DeleteProductCategory($id: Int!) {
                deleteProductCategory(id: $id)
            }
        `

        const data = await gqlFetch<{ deleteProductCategory: boolean }>(
            mutation,
            { id },
            { auth: true }
        )
        return data.deleteProductCategory
    }

    // GraphQL wrappers to match page usages
    const updateProductCategoryImage = async (id: string, payload: { url: string }) => {
        const mutation = `
            mutation UpdateProductCategoryImage($id: Int!, $image: String!) {
                updateProductCategory(id: $id, image: $image) {
                    id
                    image
                }
            }
        `
        const data = await gqlFetch<{ updateProductCategory: { id: string; image: string } }>(
            mutation,
            { id: Number(id), image: payload.url },
            { auth: true }
        )
        return data.updateProductCategory
    }

    const deleteProductCategoryById = async (id: string) => {
        const deleted = await deleteProductCategory(Number(id))
        return deleted
    }

    return {
        // GraphQL list state (backward-compatible shape for the page)
        datas,
        loading,
        error,
        pagination,
        changePage,
        changeLimit,
        setParams,
        params,
        reFetch,
        deleteProductCategoryById,
        updateProductCategoryImage,

        // GraphQL APIs
        getProductCategoriesParent,
        createProductCategory,
        updateProductCategory,
        deleteProductCategory,
    }
}