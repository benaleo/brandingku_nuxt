import { useGql } from '~/composables/useGql'

export type LandingGallery = { id: number; image: string; title: string; link: string; orders: number }

const FIELDS = 'id image title link orders'

export const useLandingGalleryService = () => {
    const { gqlFetch } = useGql()

    const getLandingGalleries = async () => {
        const res = await gqlFetch<{ getLandingMainGalleries: LandingGallery[] }>(`query landingGalleries { getLandingMainGalleries { ${FIELDS} } }`)
        return res?.getLandingMainGalleries || []
    }

    const createLandingGallery = async (file: string) => {
        const res = await gqlFetch<{ createLandingGallery: LandingGallery }>(
            `mutation createLandingGallery($file: String!) { createLandingGallery(file: $file) { ${FIELDS} } }`,
            { file },
            { auth: true, timeout: 60000 },
        )
        return res.createLandingGallery
    }

    const updateLandingGallery = async (id: number, title: string, link: string) => {
        const res = await gqlFetch<{ updateLandingGallery: LandingGallery }>(
            `mutation updateLandingGallery($id: Int!, $title: String!, $link: String!) { updateLandingGallery(id: $id, title: $title, link: $link) { ${FIELDS} } }`,
            { id, title, link },
            { auth: true },
        )
        return res.updateLandingGallery
    }

    const reorderLandingGalleries = async (ids: number[]) => {
        const res = await gqlFetch<{ reorderLandingGalleries: LandingGallery[] }>(
            `mutation reorderLandingGalleries($ids: [Int!]!) { reorderLandingGalleries(ids: $ids) { ${FIELDS} } }`,
            { ids },
            { auth: true },
        )
        return res.reorderLandingGalleries
    }

    const deleteLandingGallery = async (id: number) => {
        const res = await gqlFetch<{ deleteLandingGallery: boolean }>(
            `mutation deleteLandingGallery($id: Int!) { deleteLandingGallery(id: $id) }`,
            { id },
            { auth: true },
        )
        return res.deleteLandingGallery
    }

    return { getLandingGalleries, createLandingGallery, updateLandingGallery, reorderLandingGalleries, deleteLandingGallery }
}
