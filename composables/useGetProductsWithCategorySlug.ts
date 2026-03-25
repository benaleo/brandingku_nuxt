import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'
import { useGql } from '~/composables/useGql'
import type { Product } from '~/types/products.type'

export interface ProductWithCategory {
    id: string
    slug: string
    name: string
    description: string
    category: {
        name: string
        slug: string
    }
    image: string
    additionals: {
        price: number
    }[]
    galleries: {
        image: string
    }[]
    is_recommended: boolean
    is_upsell: boolean
}

export interface PageInfo {
    has_next_page: boolean
    has_previous_page: boolean
    start_item: number
    end_item: number
}

export interface ProductsWithCategoryResponse {
    items: ProductWithCategory[]
    page_info: PageInfo
}

export const useGetProductsWithCategorySlug = (categorySlug: string | Ref<string> | ComputedRef<string>, initialPage: number = 1, limit: number = 6) => {
    const { gqlFetch } = useGql()
    const config = useRuntimeConfig()
    const STORAGE_URL = config.public.STORAGE_URL
    
    const products = ref<ProductWithCategory[]>([])
    const pageInfo = ref<PageInfo | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const currentPage = ref(initialPage)
    
    // Get the current slug value (reactive)
    const currentSlug = computed(() => {
        return typeof categorySlug === 'string' ? categorySlug : categorySlug.value
    })

    const fetchProducts = async (page: number = initialPage, append: boolean = false) => {
        loading.value = true
        error.value = null
        
        try {
            const query = `
                query GetProductsWithCategorySlug($categorySlug: String!, $page: Int!, $limit: Int!) {
                    getProductsWithCategorySlug(
                        categorySlug: $categorySlug
                        pagination: { page: $page, limit: $limit }
                    ) {
                        items {
                            id
                            slug
                            name
                            description
                            category {
                                name
                                slug
                            }
                            image
                            additionals {
                                price
                            }
                            galleries {
                                image
                            }
                            is_recommended
                            is_upsell
                        }
                        page_info {
                            has_next_page
                            has_previous_page
                            start_item
                            end_item
                        }
                    }
                }
            `
            
            const response = await gqlFetch<{ getProductsWithCategorySlug: ProductsWithCategoryResponse }>(
                query,
                { categorySlug: currentSlug.value, page, limit }
            )
            
            const newProducts = response.getProductsWithCategorySlug.items.map(product => ({
                ...product,
                image: product.image ? `${STORAGE_URL}${product.image}` : '',
                galleries: product.galleries?.map(gallery => ({
                    ...gallery,
                    image: gallery.image ? `${STORAGE_URL}${gallery.image}` : ''
                })) || []
            }))
            
            if (append) {
                products.value = [...products.value, ...newProducts]
            } else {
                products.value = newProducts
            }
            
            pageInfo.value = response.getProductsWithCategorySlug.page_info
            currentPage.value = page
            
        } catch (err: any) {
            error.value = err?.message || 'Failed to fetch products'
            console.error('Error fetching products by category slug:', err)
        } finally {
            loading.value = false
        }
    }

    const loadMore = async () => {
        if (pageInfo.value?.has_next_page && !loading.value) {
            const nextPage = currentPage.value + 1
            await fetchProducts(nextPage, true)
        }
    }

    // Watch for slug changes and refetch products
    watch(currentSlug, () => {
        fetchProducts(1, false) // Reset to first page when slug changes
    }, { immediate: false })

    // Auto-fetch on mount
    fetchProducts()

    return {
        products,
        pageInfo,
        loading,
        error,
        fetchProducts,
        loadMore
    }
}
