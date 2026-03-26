import type { PortfolioGallery } from "~/types/portfolio.type";
import { ref } from 'vue'
import { useGql } from '~/composables/useGql'

export const usePortfolioGalleryService = () => {
    const { gqlFetch } = useGql()
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)

    const createPortfolioGallery = async (payload: { portfolio_id: number; file: string }) => {
        loading.value = true
        error.value = null
        try {
            const mutation = `
                mutation CreatePortfolioGallery(
                    $portfolio_id: Int!
                    $file: String!
                ) {
                    createPortfolioGallery(
                        portfolio_id: $portfolio_id
                        file: $file
                    ) {
                        id
                        portfolio_id
                        file
                        created_at
                    }
                }
            `
            const variables = {
                portfolio_id: Number(payload.portfolio_id),
                file: payload.file,
            }
            const res = await gqlFetch<{ createPortfolioGallery: PortfolioGallery }>(mutation, variables, { auth: true })
            return res?.createPortfolioGallery
        } catch (e: any) {
            error.value = e?.message || 'Failed to create portfolio gallery'
            throw e
        } finally {
            loading.value = false
        }
    }

    const deletePortfolioGallery = async (id: number) => {
        loading.value = true
        error.value = null
        try {
            const mutation = `
                mutation DeletePortfolioGallery($id: Int!) {
                    deletePortfolioGallery(id: $id)
                }
            `
            const res = await gqlFetch<{ deletePortfolioGallery: boolean }>(mutation, { id }, { auth: true })
            return res?.deletePortfolioGallery
        } catch (e: any) {
            error.value = e?.message || 'Failed to delete portfolio gallery'
            throw e
        } finally {
            loading.value = false
        }
    }

    const getPortfolioGalleries = async (portfolioId: number): Promise<PortfolioGallery[]> => {
        loading.value = true
        error.value = null
        try {
            const query = `
                query getPortfolioById($id: Int!) {
                    getPortfolioById(id: $id) {
                        galleries { id portfolio_id file created_at }
                    }
                }
            `
            const res = await gqlFetch<{ getPortfolioById: { galleries: PortfolioGallery[] } }>(query, { id: portfolioId }, { auth: true })
            return res?.getPortfolioById?.galleries || []
        } catch (e: any) {
            error.value = e?.message || 'Failed to fetch portfolio galleries'
            return []
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        error,
        createPortfolioGallery,
        deletePortfolioGallery,
        getPortfolioGalleries
    }
}
