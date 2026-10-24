import { ref, reactive, onMounted, watch } from 'vue'
import { useGql } from '~/composables/useGql'
import type { AdminSmtp, AdminSmtpInput } from '~/types/admin-smtp.type'

const SMTP_FIELDS = `
    id email provider branch sender_name host port quota available_today quota_date
    is_active has_app_password has_secret created_at updated_at
`

// fetchList: load the paginated list on mount; dataId: load one record on mount
export const useAdminSmtpService = (fetchList?: boolean, dataId?: string) => {
    const { gqlFetch } = useGql()

    const datas = ref<any>(fetchList ? [] : null)
    const loading = ref<boolean>(Boolean(fetchList || dataId))
    const error = ref<string | null>(null)
    const pagination = ref({ page: 0, limit: 10, total: 0 }) // 0-based locally
    const params = reactive<{ keyword?: string; is_active?: boolean }>({})

    const fetchSmtps = async () => {
        loading.value = true
        error.value = null
        try {
            const query = `
                query getAdminSmtps($page: Int!, $limit: Int!, $keyword: String, $is_active: Boolean) {
                    getAdminSmtps(pagination: { page: $page, limit: $limit, sortBy: "updated_at,desc" }, keyword: $keyword, is_active: $is_active) {
                        items { ${SMTP_FIELDS} }
                        page_info { current_page per_page total_items }
                    }
                }
            `
            const res = await gqlFetch<{ getAdminSmtps: { items: AdminSmtp[]; page_info: any } }>(query, {
                page: pagination.value.page + 1,
                limit: pagination.value.limit,
                ...(params.keyword ? { keyword: params.keyword } : {}),
                ...(params.is_active != null ? { is_active: params.is_active } : {}),
            }, { auth: true })
            const info = res?.getAdminSmtps?.page_info
            datas.value = res?.getAdminSmtps?.items || []
            if (info) {
                pagination.value.total = Number(info.total_items || 0)
                pagination.value.limit = Number(info.per_page || pagination.value.limit)
                pagination.value.page = Math.max(0, Number(info.current_page || 1) - 1)
            }
        } catch (e: any) {
            error.value = e?.message || 'Gagal memuat data SMTP'
        } finally {
            loading.value = false
        }
    }

    const fetchDetail = async (id: number) => {
        loading.value = true
        error.value = null
        try {
            const query = `query getAdminSmtpDetail($id: Int!) { getAdminSmtpDetail(id: $id) { ${SMTP_FIELDS} } }`
            const res = await gqlFetch<{ getAdminSmtpDetail: AdminSmtp }>(query, { id }, { auth: true })
            datas.value = res?.getAdminSmtpDetail || null
        } catch (e: any) {
            error.value = e?.message || 'Gagal memuat detail SMTP'
        } finally {
            loading.value = false
        }
    }

    const reFetch = () => (fetchList ? fetchSmtps() : dataId ? fetchDetail(Number(dataId)) : Promise.resolve())
    const changePage = (page: number) => { pagination.value.page = page; fetchSmtps() }
    const changeLimit = (limit: number) => { pagination.value.limit = limit; pagination.value.page = 0; fetchSmtps() }
    const setParams = (p: Partial<typeof params>) => { Object.assign(params, p) }

    const createSmtp = async (input: AdminSmtpInput) => {
        const mutation = `mutation createAdminSmtp($input: AdminSmtpInput!) { createAdminSmtp(input: $input) { ${SMTP_FIELDS} } }`
        const res = await gqlFetch<{ createAdminSmtp: AdminSmtp }>(mutation, { input }, { auth: true })
        return res?.createAdminSmtp
    }

    const updateSmtp = async (id: string | number, input: AdminSmtpInput) => {
        const mutation = `mutation updateAdminSmtp($id: Int!, $input: AdminSmtpInput!) { updateAdminSmtp(id: $id, input: $input) { ${SMTP_FIELDS} } }`
        const res = await gqlFetch<{ updateAdminSmtp: AdminSmtp }>(mutation, { id: Number(id), input }, { auth: true })
        return res?.updateAdminSmtp
    }

    const deleteSmtp = async (id: string | number) => {
        const mutation = `mutation deleteAdminSmtp($id: Int!) { deleteAdminSmtp(id: $id) }`
        const res = await gqlFetch<{ deleteAdminSmtp: boolean }>(mutation, { id: Number(id) }, { auth: true })
        return res?.deleteAdminSmtp
    }

    onMounted(() => { if (fetchList || dataId) reFetch() })
    if (fetchList) watch(params, () => { pagination.value.page = 0; fetchSmtps() }, { deep: true })

    return { datas, loading, error, pagination, params, reFetch, changePage, changeLimit, setParams, createSmtp, updateSmtp, deleteSmtp }
}
