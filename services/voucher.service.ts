import { useGql } from '~/composables/useGql'
import type { Voucher, VoucherInput, VoucherRedemption } from '~/types/voucher.type'

const VOUCHER_FIELDS = `
  id code name description type value max_discount min_subtotal starts_at ends_at
  usage_limit per_user_limit used_count scope is_active status created_at updated_at
  categories { id name }
  products { id name }
`

export const useVoucherService = () => {
  const { gqlFetch } = useGql()

  const getVouchers = async (page: number, limit: number, filters: { keyword?: string; status?: string }) => {
    const res = await gqlFetch<{ getVouchers: { items: Voucher[]; page_info: { total_items: number } } }>(
      `query getVouchers($page: Int, $limit: Int, $keyword: String, $status: String) {
        getVouchers(pagination: { page: $page, limit: $limit }, keyword: $keyword, status: $status) {
          items { ${VOUCHER_FIELDS} }
          page_info { total_items }
        }
      }`,
      { page, limit, ...filters },
      { auth: true },
    )
    return res.getVouchers
  }

  const getVoucher = async (id: number) => {
    const res = await gqlFetch<{ getVoucher: Voucher }>(
      `query getVoucher($id: Int!) { getVoucher(id: $id) { ${VOUCHER_FIELDS} } }`, { id }, { auth: true })
    return res.getVoucher
  }

  const getVoucherRedemptions = async (voucherId: number) => {
    const res = await gqlFetch<{ getVoucherRedemptions: VoucherRedemption[] }>(
      `query getVoucherRedemptions($id: Int!) {
        getVoucherRedemptions(voucher_id: $id) { id user_id user_email order_id invoice_id invoice_number discount_amount status created_at }
      }`,
      { id: voucherId },
      { auth: true },
    )
    return res.getVoucherRedemptions
  }

  const createVoucher = async (input: VoucherInput) => {
    const res = await gqlFetch<{ createVoucher: Voucher }>(
      `mutation createVoucher($input: VoucherInput!) { createVoucher(input: $input) { ${VOUCHER_FIELDS} } }`, { input }, { auth: true })
    return res.createVoucher
  }

  const updateVoucher = async (id: number, input: VoucherInput) => {
    const res = await gqlFetch<{ updateVoucher: Voucher }>(
      `mutation updateVoucher($id: Int!, $input: VoucherInput!) { updateVoucher(id: $id, input: $input) { ${VOUCHER_FIELDS} } }`,
      { id, input },
      { auth: true },
    )
    return res.updateVoucher
  }

  const deleteVoucher = async (id: number) => {
    const res = await gqlFetch<{ deleteVoucher: boolean }>('mutation deleteVoucher($id: Int!) { deleteVoucher(id: $id) }', { id }, { auth: true })
    return res.deleteVoucher
  }

  return { getVouchers, getVoucher, getVoucherRedemptions, createVoucher, updateVoucher, deleteVoucher }
}
