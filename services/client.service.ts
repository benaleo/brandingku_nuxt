import { ref, reactive, onMounted, watch } from 'vue'
import { useGql } from '~/composables/useGql'
import type { Client } from '~/types/client.type'

export type PageInfo = {
  current_page: number
  per_page: number
  total_items: number
  total_pages: number
  has_next_page: boolean
  has_previous_page: boolean
  start_item: number
  end_item: number
}

export const useClientService = () => {
  const { gqlFetch } = useGql()

  const datas = ref<Client[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  // Keep local page 0-based for UI consistency (like useProductService)
  const pagination = ref({ page: 0, limit: 10, total: 0 })
  const pageInfo = ref<PageInfo | null>(null)
  const params = reactive<{ keyword?: string; is_active?: boolean }>({})
  const detail = ref<Client | null>(null)

  // List with server-side pagination
  const fetchList = async () => {
    loading.value = true
    error.value = null
    try {
      const query = `
        query GetClients($page: Int!, $limit: Int!, $is_active: Boolean) {
          getClients(pagination: { page: $page, limit: $limit }, is_active: $is_active) {
            items {
              id
              name
              logo
              orders
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
      const variables: any = {
        page: serverPage,
        limit: serverLimit,
        ...(params.is_active != null ? { is_active: Boolean(params.is_active) } : {}),
      }

      const res = await gqlFetch<{
        getClients: {
          items: Array<{ id: number; name: string; logo: string; orders: number }>
          page_info: PageInfo
        }
      }>(query, variables, { auth: true })

      let items = (res?.getClients?.items || []).map((it) => ({
        id: String(it.id),
        name: it.name,
        logo: it.logo,
        orders: it.orders,
        // When API list doesn't include is_active, fallback to filter param or true
        is_active: params.is_active ?? true,
      }))

      // client-side keyword filter (by name)
      const kw = params.keyword?.toLowerCase()?.trim()
      if (kw && kw.length >= 1) {
        items = items.filter((x) => (x.name || '').toLowerCase().includes(kw))
      }

      // Update pagination from server; keep local page 0-based
      pageInfo.value = res?.getClients?.page_info || null
      if (pageInfo.value) {
        pagination.value.limit = Number(pageInfo.value.per_page || serverLimit)
        pagination.value.total = Number(pageInfo.value.total_items || items.length)
        const cp = Number(pageInfo.value.current_page || serverPage)
        pagination.value.page = cp > 0 ? cp - 1 : 0
      } else {
        // Fallback
        pagination.value.total = items.length
      }

      datas.value = items
    } catch (e: any) {
      console.error('[client] fetchList error:', e)
      error.value = e?.message || 'Failed to load clients'
    } finally {
      loading.value = false
    }
  }

  const changePage = (newPage: number) => {
    pagination.value.page = newPage
    fetchList()
  }
  const changeLimit = (newLimit: number) => {
    pagination.value.limit = newLimit
    fetchList()
  }
  const setParams = (newParams: Record<string, any>) => {
    Object.assign(params, newParams)
  }
  const reFetch = () => fetchList()

  watch(params, fetchList, { deep: true })
  onMounted(fetchList)

  // Detail
  const getClientDetail = async (id: number) => {
    const query = `
      query GetClientDetail($id: Int!) {
        getClientDetail(id: $id) {
          id
          name
          logo
          orders
          is_active
        }
      }
    `
    const data = await gqlFetch<{
      getClientDetail: { id: number; name: string; logo: string; orders: number; is_active: boolean }
    }>(query, { id }, { auth: true })

    const d = data.getClientDetail
    return {
      id: String(d.id),
      name: d.name,
      logo: d.logo,
      orders: d.orders,
      is_active: d.is_active,
    } as Client
  }

  const loadDetail = async (id: number) => {
    detail.value = await getClientDetail(id)
    return detail.value
  }

  // Create
  const createClient = async (vars: {
    name: string
    logo: string
    orders: number
    is_active: boolean
  }) => {
    const mutation = `
      mutation CreateClient($name: String!, $logo: String!, $orders: Int!, $is_active: Boolean!) {
        createClient(name: $name, logo: $logo, orders: $orders, is_active: $is_active) {
          id
          name
          logo
          orders
          is_active
        }
      }
    `
    const data = await gqlFetch<{
      createClient: { id: number; name: string; logo: string; orders: number; is_active: boolean }
    }>(mutation, vars, { auth: true })

    const c = data.createClient
    return {
      id: String(c.id),
      name: c.name,
      logo: c.logo,
      orders: c.orders,
      is_active: c.is_active,
    } as Client
  }

  // Update
  const updateClient = async (vars: {
    id: number
    name: string
    logo?: string
    orders?: number
    is_active?: boolean
  }) => {
    const mutation = `
      mutation UpdateClient($id: Int!, $name: String!, $logo: String, $orders: Int, $is_active: Boolean) {
        updateClient(id: $id, name: $name, logo: $logo, orders: $orders, is_active: $is_active) {
          id
          name
          logo
          orders
          is_active
        }
      }
    `
    const data = await gqlFetch<{
      updateClient: { id: number; name: string; logo: string; orders: number; is_active: boolean }
    }>(mutation, vars, { auth: true })

    const c = data.updateClient
    return {
      id: String(c.id),
      name: c.name,
      logo: c.logo,
      orders: c.orders,
      is_active: c.is_active,
    } as Client
  }

  const updateClientImage = async (id: string, payload: { url: string }) => {
    // Convenience wrapper: ensure we have a name to satisfy updateClient mutation
    let name = detail.value?.name
    if (!name) {
      const d = await getClientDetail(Number(id))
      name = d.name
    }
    const updated = await updateClient({ id: Number(id), name: name || '', logo: payload.url })
    return updated
  }

  // Delete
  const deleteClient = async (id: number) => {
    const mutation = `
      mutation DeleteClient($id: Int!) {
        deleteClient(id: $id)
      }
    `
    const data = await gqlFetch<{ deleteClient: boolean }>(mutation, { id }, { auth: true })
    return data.deleteClient
  }

  const deleteClientById = async (id: string) => deleteClient(Number(id))

  return {
    // list state
    datas,
    loading,
    error,
    pagination,
    pageInfo,
    params,
    setParams,
    changePage,
    changeLimit,
    reFetch,

    // detail
    detail,
    loadDetail,

    // CRUD
    createClient,
    updateClient,
    deleteClient,
    deleteClientById,
    updateClientImage,
  }
}
