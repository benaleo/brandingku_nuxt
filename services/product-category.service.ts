import type { ProductCategory, ProductCategoryRequest } from "~/types/products.type";
import { useApiFetch } from '~/composables/useApiFetch'
import { useCookie } from '#app'

export const useProductCategoryService = (fetchResult?: boolean, dataId?: string) => {
    const { gqlFetch } = useGql()
    const config = useRuntimeConfig()
    const BASE_URL = config.public.API_URL
    const url = `${BASE_URL}/cms/v1/product-category${dataId ? `/${dataId}` : ''}`

    // REST listing with pagination/filters (backward compatible API)
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

    // Get all parent categories
    const getProductCategoriesParent = async () => {
        const query = `
            query GetProductCategoriesParent {
                getProductCategoriesParent {
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

        const data = await gqlFetch<{ getProductCategoriesParent: ProductCategory[] }>(query)
        return data.getProductCategoriesParent
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

    // REST: update image
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

    // REST: delete by id
    const deleteProductCategoryById = async (id: string) => {
        const response = await fetch(`${url}/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': '*/*',
                'Authorization': `Bearer ${useCookie('token').value}`
            }
        })
        if (!response.ok) {
            const err = await response.json()
            throw err
        }
        return await response.json()
    }

    const reFetch = () => refetch()

    return {
        // REST list API expected by index.vue
        datas: data,
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