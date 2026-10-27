import { useGql } from '~/composables/useGql'
import type { Invoice, InvoiceInput, InvoiceStatusSummary, PublicInvoice } from '~/types/invoice.type'

const LINK_FIELDS = 'id number type status total amount_due'
const AMOUNT_FIELDS = 'subtotal discount_total shipping_fee tax_mode tax_rate_bps tax_base tax_total total deduction amount_due paid_amount'
const CUSTOMER_FIELDS = 'customer_name customer_email customer_phone customer_company customer_address customer_npwp'
const ITEM_FIELDS = 'id product_id product_additional_id description quantity unit_price discount_bps line_total'

const LIST_FIELDS = `id number type status ${CUSTOMER_FIELDS} issue_date due_date total amount_due paid_amount created_at`
const DETAIL_FIELDS = `
  id number type status order_id user_id ${CUSTOMER_FIELDS} issue_date due_date ${AMOUNT_FIELDS}
  notes terms public_token sent_at paid_at void_reason created_by created_at updated_at
  parent { ${LINK_FIELDS} }
  children { ${LINK_FIELDS} }
  items { ${ITEM_FIELDS} }
  payments { id amount method proof_path payer_name note paid_on status reject_reason verified_by verified_at created_at }
  events { id action actor note created_at }
`

export type InvoiceFilters = {
  type?: string
  status?: string
  keyword?: string
  date_from?: string
  date_to?: string
}

export type PaymentInput = {
  amount: number
  paid_on: string
  method?: string
  payer_name?: string
  note?: string
  proof?: { file_name: string; content_type?: string; content: string } | null
}

// GraphQL errors arrive as "[GQL] Request failed: <message>"
export const invoiceErrorMessage = (e: any, fallback: string) =>
  String(e?.message || fallback).replace(/^\[GQL\] Request failed:\s*/, '') || fallback

export const useInvoiceService = () => {
  const { gqlFetch } = useGql()

  const detailMutation = async <K extends string>(name: K, signature: string, args: string, variables: Record<string, any>) => {
    const res = await gqlFetch<Record<K, Invoice>>(
      `mutation ${name}(${signature}) { ${name}(${args}) { ${DETAIL_FIELDS} } }`,
      variables,
      { auth: true },
    )
    return res[name]
  }

  const getInvoices = async (page: number, limit: number, filters: InvoiceFilters) => {
    const res = await gqlFetch<{ getInvoices: { items: Invoice[]; page_info: { total_items: number; current_page: number; per_page: number } } }>(
      `query getInvoices($page: Int, $limit: Int, $type: String, $status: String, $keyword: String, $date_from: String, $date_to: String) {
        getInvoices(pagination: { page: $page, limit: $limit }, type: $type, status: $status, keyword: $keyword, date_from: $date_from, date_to: $date_to) {
          items { ${LIST_FIELDS} }
          page_info { total_items current_page per_page }
        }
      }`,
      { page, limit, ...filters },
      { auth: true },
    )
    return res.getInvoices
  }

  const getInvoiceSummary = async () => {
    const res = await gqlFetch<{ getInvoiceSummary: InvoiceStatusSummary[] }>(
      'query getInvoiceSummary { getInvoiceSummary { status count amount_due } }', {}, { auth: true })
    return res.getInvoiceSummary
  }

  const getInvoice = async (id: number) => {
    const res = await gqlFetch<{ getInvoice: Invoice }>(
      `query getInvoice($id: Int!) { getInvoice(id: $id) { ${DETAIL_FIELDS} } }`, { id }, { auth: true })
    return res.getInvoice
  }

  const createInvoice = (input: InvoiceInput) =>
    detailMutation('createInvoice', '$input: InvoiceInput!', 'input: $input', { input })
  const updateInvoice = (id: number, input: InvoiceInput) =>
    detailMutation('updateInvoice', '$id: Int!, $input: InvoiceInput!', 'id: $id, input: $input', { id, input })
  const sendInvoice = (id: number, notify: boolean) =>
    detailMutation('sendInvoice', '$id: Int!, $notify: Boolean', 'id: $id, notify: $notify', { id, notify })
  const voidInvoice = (id: number, reason: string) =>
    detailMutation('voidInvoice', '$id: Int!, $reason: String!', 'id: $id, reason: $reason', { id, reason })
  const duplicateInvoice = (id: number) =>
    detailMutation('duplicateInvoice', '$id: Int!', 'id: $id', { id })
  const createDeal = (quotationId: number) =>
    detailMutation('createDeal', '$id: Int!', 'quotation_id: $id', { id: quotationId })
  const createDownPayment = (dealId: number, opts: { amount?: number; percent_bps?: number }) =>
    detailMutation('createDownPayment', '$id: Int!, $amount: Int64, $percent_bps: Int', 'deal_id: $id, amount: $amount, percent_bps: $percent_bps',
      { id: dealId, amount: opts.amount ?? null, percent_bps: opts.percent_bps ?? null })
  const createFinal = (dealId: number) =>
    detailMutation('createFinal', '$id: Int!', 'deal_id: $id', { id: dealId })
  const recordPayment = (id: number, input: PaymentInput) =>
    detailMutation('recordInvoicePayment', '$id: Int!, $input: InvoicePaymentInput!', 'id: $id, input: $input', { id, input })

  const verifyPayment = (paymentId: number) =>
    detailMutation('verifyInvoicePayment', '$id: Int!', 'payment_id: $id', { id: paymentId })
  const rejectPayment = (paymentId: number, reason: string) =>
    detailMutation('rejectInvoicePayment', '$id: Int!, $reason: String!', 'payment_id: $id, reason: $reason', { id: paymentId, reason })

  const deleteInvoice = async (id: number) => {
    const res = await gqlFetch<{ deleteInvoice: boolean }>('mutation deleteInvoice($id: Int!) { deleteInvoice(id: $id) }', { id }, { auth: true })
    return res.deleteInvoice
  }

  const getPublicInvoice = async (token: string) => {
    const res = await gqlFetch<{ getPublicInvoice: PublicInvoice | null }>(
      `query getPublicInvoice($token: String!) {
        getPublicInvoice(token: $token) {
          number type status parent_number ${CUSTOMER_FIELDS} issue_date due_date ${AMOUNT_FIELDS} notes terms
          items { ${ITEM_FIELDS} }
          company_name company_npwp company_address company_phone company_email
          bank_accounts { bank number name }
        }
      }`,
      { token },
    )
    return res.getPublicInvoice
  }

  return {
    getInvoices, getInvoiceSummary, getInvoice, createInvoice, updateInvoice, deleteInvoice, sendInvoice,
    voidInvoice, duplicateInvoice, createDeal, createDownPayment, createFinal, recordPayment, getPublicInvoice,
    verifyPayment, rejectPayment,
  }
}
