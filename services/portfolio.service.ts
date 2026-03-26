import type { Portfolio, PortfolioConnection, PortfolioSortInput, PaginationInput } from "~/types/portfolio.type";
import { ref, reactive, onMounted, watch } from 'vue'
import { useGql } from '~/composables/useGql'
import { usePortfolioGalleryService } from '~/services/portfolio-gallery.service'
import { useRuntimeConfig } from '#app'
import { useCookie } from '#app'

export const usePortfolioService = (fetchResult?: boolean, dataId?: string) => {
    const { gqlFetch } = useGql()
    const config = useRuntimeConfig()
    const BASE_URL = config.public.API_URL
    const url = `${BASE_URL}/cms/v1/portfolio${dataId ? `/${dataId}` : ''}`

    // State mimicking useApiFetch interface
    const datas = ref<any>(fetchResult ? [] : null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const pagination = ref({ page: 0, limit: 10, total: 0 }) // page is 0-based locally
    const pageInfo = ref<{ current_page?: number; per_page?: number; total_items?: number; total_pages?: number; has_next_page?: boolean; has_previous_page?: boolean; start_item?: number; end_item?: number } | null>(null)
    const params = reactive<{ keyword?: string; category?: string | null; is_active?: boolean } >({})

    const changePage = (newPage: number) => {
        pagination.value.page = newPage
        if (fetchResult) fetchPortfolios()
    }
    const changeLimit = (newLimit: number) => {
        pagination.value.limit = newLimit
        if (fetchResult) fetchPortfolios()
    }
    const setParams = (newParams: Record<string, any>) => {
        Object.assign(params, newParams)
    }

    // GraphQL queries
    const fetchPortfolios = async () => {
        if (!fetchResult) return
        loading.value = true
        error.value = null
        try {
            const query = `
                query getPortfolios($page: Int!, $limit: Int!, $is_active: Boolean) {
                    getPortfolios(pagination: { page: $page, limit: $limit }, sort: { column: UPDATED_AT, direction: DESC }, is_active: $is_active) {
                        items {
                            id
                            category
                            title
                            subtitle
                            client
                            galleries { id portfolio_id file created_at }
                            is_active
                            deleted_at
                            created_at
                            updated_at
                        }
                        page_info {
                            current_page
                            per_page
                            total_items
                            total_pages
                            has_next_page
                            has_previous_page
                            start_item
                            end_item
                        }
                    }
                }
            `
            // server is 1-based pages; local is 0-based
            const serverPage = (pagination.value.page || 0) + 1
            const serverLimit = pagination.value.limit || 10
            const res = await gqlFetch<{ getPortfolios: PortfolioConnection }>(
                query,
                { 
                    page: serverPage, 
                    limit: serverLimit, 
                    ...(params.is_active != null ? { is_active: Boolean(params.is_active) } : {}) 
                },
                { auth: true }
            )
            let list = (res?.getPortfolios?.items || []) as any[]

            // Apply client-side keyword filter for compatibility
            const kw = params.keyword?.toLowerCase()?.trim()
            if (kw && kw.length >= 1) {
                list = list.filter((x: any) =>
                    (x.title || '').toLowerCase().includes(kw) ||
                    (x.category || '').toLowerCase().includes(kw) ||
                    (x.client || '').toLowerCase().includes(kw)
                )
            }

            // Update pagination from server; keep local page 0-based
            pageInfo.value = res?.getPortfolios?.page_info || null
            if (pageInfo.value) {
                pagination.value.limit = Number(pageInfo.value.per_page || serverLimit)
                pagination.value.total = Number(pageInfo.value.total_items || list.length)
                const cp = Number(pageInfo.value.current_page || serverPage)
                pagination.value.page = cp > 0 ? cp - 1 : 0
            } else {
                // Fallback
                pagination.value.total = list.length
            }

            datas.value = list
        } catch (e: any) {
            error.value = e?.message || 'Failed to load portfolios'
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
                query getPortfolioById($id: Int!) {
                    getPortfolioById(id: $id) {
                        id
                        category
                        title
                        subtitle
                        client
                        galleries { id portfolio_id file created_at }
                        is_active
                        deleted_at
                        created_at
                        updated_at
                    }
                }
            `
            const res = await gqlFetch<{ getPortfolioById: Portfolio }>(query, { id }, { auth: true })
            datas.value = res.getPortfolioById
        } catch (e: any) {
            error.value = e?.message || 'Failed to load portfolio detail'
        } finally {
            loading.value = false
        }
    }

    const refetch = async () => {
        if (fetchResult) return fetchPortfolios()
        if (dataId) return fetchDetail(Number(dataId))
    }

    // Auto fetch
    onMounted(() => {
        refetch()
    })
    if (fetchResult) {
        watch(params, () => fetchPortfolios(), { deep: true })
    }

    const getPortfolios = async (p: { page?: number; limit?: number } = {}) => {
        if (p.page !== undefined) changePage(p.page)
        if (p.limit) changeLimit(p.limit)
        return refetch()
    }

    const createPortfolio = async (payload: any) => {
        const mutation = `
            mutation CreatePortfolio(
                $category: String!
                $title: String!
                $subtitle: String
                $client: String
                $is_active: Boolean!
            ) {
                createPortfolio(
                    category: $category
                    title: $title
                    subtitle: $subtitle
                    client: $client
                    is_active: $is_active
                ) {
                    id
                    category
                    title
                }
            }
        `
        const variables = {
            category: payload.category,
            title: payload.title,
            subtitle: payload.subtitle ?? null,
            client: payload.client ?? null,
            is_active: Boolean(payload.is_active),
        }
        
        // Create portfolio first
        const res = await gqlFetch<{ createPortfolio: { id: string; category: string; title: string } }>(mutation, variables, { auth: true })
        const portfolioId = Number(res?.createPortfolio.id)
        
        if (!portfolioId) throw new Error('Failed to create portfolio')
        
        // Handle galleries if any
        if (payload.galleries?.length) {
            const galleryService = usePortfolioGalleryService()
            for (const gallery of payload.galleries) {
                await galleryService.createPortfolioGallery({
                    ...gallery,
                    portfolio_id: portfolioId
                })
            }
        }
        
        return res?.createPortfolio
    }

    // General UPDATE function
    const updatePortfolioById = async (id: string, payload: any) => {
        // GraphQL mutation per provided schema
        const mutation = `
            mutation UpdatePortfolio(
                $id: Int!,
                $category: String!,
                $title: String,
                $subtitle: String,
                $client: String,
                $is_active: Boolean
            ) {
                updatePortfolio(
                    id: $id,
                    category: $category,
                    title: $title,
                    subtitle: $subtitle,
                    client: $client,
                    is_active: $is_active
                ) {
                    id
                    category
                    title
                }
            }
        `
        const variables = {
            id: Number(id),
            category: payload.category,
            title: payload.title,
            subtitle: payload.subtitle ?? null,
            client: payload.client ?? null,
            is_active: payload.is_active != null ? Boolean(payload.is_active) : null,
        }
        const res = await gqlFetch<{ updatePortfolio: { id: string; category: string; title: string } }>(mutation, variables, { auth: true })

        // Handle galleries update/create if any
        if (payload.galleries?.length) {
            const galleryService = usePortfolioGalleryService()
            for (const gallery of payload.galleries) {
                try {
                    // Only treat as existing when ID is numeric (DB-generated)
                    const idStr = String(gallery.id ?? '')
                    const hasId = /^\d+$/.test(idStr)
                    if (hasId) {
                        // Update existing gallery (if needed)
                        // Note: GraphQL schema doesn't have updatePortfolioGallery, so we might need to handle this differently
                        // For now, we'll skip updating existing galleries
                    } else {
                        // Create new gallery for this portfolio
                        await galleryService.createPortfolioGallery({
                            file: gallery.file,
                            portfolio_id: Number(id)
                        })
                    }
                } catch (e) {
                }
            }
        }

        return res?.updatePortfolio
    }

    // General DELETE function
    const deletePortfolioById = async (id: string) => {
        const mutation = `
            mutation DeletePortfolio($id: Int!) {
                deletePortfolio(id: $id)
            }
        `
        const res = await gqlFetch<{ deletePortfolio: boolean }>(mutation, { id: Number(id) }, { auth: true })
        return res?.deletePortfolio
    }

    return {
        datas,
        loading,
        error,
        pagination,
        reFetch: refetch,
        getPortfolios,
        createPortfolio,
        updatePortfolioById,
        deletePortfolioById,
        changePage,
        changeLimit,
        setParams,
        params,
        pageInfo
    }
}
