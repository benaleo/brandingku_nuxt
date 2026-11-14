import { ref } from 'vue'
import { useGql } from '~/composables/useGql'
import type { Customer, CustomerAddress, CustomerAddressInput } from '~/types/customer.type'
import type { PageInfo } from '~/types/Pagination'

// console list of customers, paged on the server (page is 0-based here like the other tables)
export const useCustomerService = () => {
  const { gqlFetch } = useGql()
  const datas = ref<Customer[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({ page: 0, limit: 10, total: 0 })
  const keyword = ref('')

  const fetchList = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await gqlFetch<{ getCustomers: { items: Customer[]; page_info: PageInfo } }>(
        `query getCustomers($page: Int!, $limit: Int!, $keyword: String) {
          getCustomers(pagination: { page: $page, limit: $limit }, keyword: $keyword) {
            items { id name email phone address avatar role is_active order_count open_order_count last_order_at created_at }
            page_info { current_page per_page total_items }
          }
        }`,
        { page: pagination.value.page + 1, limit: pagination.value.limit, keyword: keyword.value.trim() || null },
        { auth: true },
      )
      datas.value = res.getCustomers.items
      pagination.value.total = Number(res.getCustomers.page_info.total_items)
    } catch (e: any) {
      error.value = e?.message || 'Gagal memuat customer'
    } finally {
      loading.value = false
    }
  }

  const changePage = (page: number) => {
    pagination.value.page = page
    fetchList()
  }
  const changeLimit = (limit: number) => {
    pagination.value.limit = limit
    pagination.value.page = 0
    fetchList()
  }
  const search = (value: string) => {
    keyword.value = value
    pagination.value.page = 0
    fetchList()
  }

  return { datas, loading, error, pagination, fetchList, changePage, changeLimit, search }
}

const ADDRESS_FIELDS = 'id user_id label recipient_name phone address city postal_code created_at updated_at'

// admin-only address book; customers never see it
export const useCustomerAddressService = () => {
  const { gqlFetch } = useGql()

  const getCustomerAddresses = async (userId: number) => {
    const res = await gqlFetch<{ getCustomerAddresses: CustomerAddress[] }>(
      `query getCustomerAddresses($userId: Int!) { getCustomerAddresses(user_id: $userId) { ${ADDRESS_FIELDS} } }`,
      { userId },
      { auth: true },
    )
    return res.getCustomerAddresses
  }

  const createCustomerAddress = async (userId: number, input: CustomerAddressInput) => {
    const res = await gqlFetch<{ createCustomerAddress: CustomerAddress }>(
      `mutation createCustomerAddress($userId: Int!, $input: CustomerAddressInput!) { createCustomerAddress(user_id: $userId, input: $input) { ${ADDRESS_FIELDS} } }`,
      { userId, input },
      { auth: true },
    )
    return res.createCustomerAddress
  }

  const updateCustomerAddress = async (id: number, input: CustomerAddressInput) => {
    const res = await gqlFetch<{ updateCustomerAddress: CustomerAddress }>(
      `mutation updateCustomerAddress($id: Int!, $input: CustomerAddressInput!) { updateCustomerAddress(id: $id, input: $input) { ${ADDRESS_FIELDS} } }`,
      { id, input },
      { auth: true },
    )
    return res.updateCustomerAddress
  }

  const deleteCustomerAddress = async (id: number) => {
    await gqlFetch(
      `mutation deleteCustomerAddress($id: Int!) { deleteCustomerAddress(id: $id) }`,
      { id },
      { auth: true },
    )
  }

  return { getCustomerAddresses, createCustomerAddress, updateCustomerAddress, deleteCustomerAddress }
}
