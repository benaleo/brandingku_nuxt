import { useGql } from '~/composables/useGql'
import type { EmailAttachmentInput } from '~/types/admin-smtp.type'
import type { CheckoutInput, CheckoutItemInput, CheckoutPreview, MyOrderSummary, Order, PaymentPlanInput, ProductionStep } from '~/types/order.type'

const DOC_FIELDS = `
  id number type status public_token issue_date due_date total amount_due paid_amount
  payments { id amount method proof_path payer_name note paid_on status reject_reason created_at }
`
const ORDER_FIELDS = `
  id code access_token type status user_id
  customer_name customer_email customer_phone customer_company
  delivery_method shipping_name shipping_phone shipping_address shipping_city shipping_postal_code
  shipping_fee shipping_note tracking_number notes subtotal discount_total voucher_code
  expires_at paid_at cancelled_at cancel_reason can_cancel can_submit_payment can_respond_quotation can_pay_online
  design_file_path design_file_name created_at updated_at
  payment_plan production_stage can_review_progress can_ship
  payment_options { deal_number deal_total min_dp_amount }
  progress { id stage note decision decision_note decided_at created_at files { file_name content_type size path } }
  documents { ${DOC_FIELDS} }
  payable_documents { ${DOC_FIELDS} }
  items {
    id product_id product_additional_id product_name product_slug product_image variant_name quantity unit_price original_unit_price line_total note
    branding_unit_price brandings { branding_method_id name unit_price }
  }
  events { id action actor note created_at }
  invoice {
    id number status public_token due_date subtotal discount_total shipping_fee tax_mode tax_rate_bps tax_base tax_total total amount_due paid_amount
    payments { id amount method proof_path payer_name note paid_on status reject_reason created_at }
    bank_accounts { bank number name }
  }
`
const LIST_FIELDS = `
  id code access_token type status customer_name customer_email customer_company delivery_method shipping_city
  subtotal discount_total created_at expires_at can_cancel can_submit_payment
  items { id product_name variant_name quantity }
  invoice { id number status total amount_due paid_amount payments { id status } }
  documents { id type status payments { id status } }
`

type OrderPage = { items: Order[]; page_info: { total_items: number } }

export const useOrderService = () => {
  const { gqlFetch } = useGql()

  // customer
  const previewCheckout = async (items: CheckoutItemInput[] | undefined, voucherCode?: string) => {
    const res = await gqlFetch<{ previewCheckout: CheckoutPreview }>(
      `query previewCheckout($items: [CheckoutItemInput!], $voucher: String) {
        previewCheckout(items: $items, voucher_code: $voucher) {
          lines {
            product_id product_additional_id product_name product_slug product_image variant_name quantity moq stock unit_price original_unit_price line_total note problem
            branding_unit_price brandings { branding_method_id name unit_price min_qty available }
          }
          subtotal discount voucher_code voucher_message tax_mode tax_rate_bps tax_base tax_total total can_pay
        }
      }`,
      { items: items?.length ? items : null, voucher: voucherCode || null },
      { auth: true },
    )
    return res.previewCheckout
  }

  const placeOrder = async (input: CheckoutInput, idempotencyKey: string) => {
    const res = await gqlFetch<{ placeOrder: Order }>(
      `mutation placeOrder($input: CheckoutInput!, $key: String!) { placeOrder(input: $input, idempotency_key: $key) { ${ORDER_FIELDS} } }`,
      { input, key: idempotencyKey },
      { auth: true },
    )
    return res.placeOrder
  }

  const requestQuotation = async (input: CheckoutInput, designFile: { file_name: string; content_type?: string; content: string } | null, idempotencyKey: string) => {
    const res = await gqlFetch<{ requestQuotation: Order }>(
      `mutation requestQuotation($input: CheckoutInput!, $file: EmailAttachmentInput, $key: String!) {
        requestQuotation(input: $input, design_file: $file, idempotency_key: $key) { ${ORDER_FIELDS} }
      }`,
      { input, file: designFile, key: idempotencyKey },
      { auth: true, timeout: 60000 },
    )
    return res.requestQuotation
  }

  const respondQuotation = async (code: string, action: 'accept' | 'reject' | 'revise', message?: string) => {
    const res = await gqlFetch<{ respondQuotation: Order }>(
      `mutation respondQuotation($code: String!, $action: String!, $message: String) {
        respondQuotation(code: $code, action: $action, message: $message) { ${ORDER_FIELDS} }
      }`,
      { code, action, message: message || null },
      { auth: true },
    )
    return res.respondQuotation
  }

  // the would-be first invoice as a base64 PDF; nothing is saved
  const previewPaymentPlan = async (code: string, input: PaymentPlanInput) => {
    const res = await gqlFetch<{ previewPaymentPlan: string }>(
      'query previewPaymentPlan($code: String!, $input: PaymentPlanInput!) { previewPaymentPlan(code: $code, input: $input) }',
      { code, input },
      { auth: true, timeout: 60000 },
    )
    return res.previewPaymentPlan
  }

  const choosePaymentPlan = async (code: string, input: PaymentPlanInput) => {
    const res = await gqlFetch<{ choosePaymentPlan: Order }>(
      `mutation choosePaymentPlan($code: String!, $input: PaymentPlanInput!) { choosePaymentPlan(code: $code, input: $input) { ${ORDER_FIELDS} } }`,
      { code, input },
      { auth: true },
    )
    return res.choosePaymentPlan
  }

  // the customer's answer to the mockup or sample waiting for approval
  const reviewProgress = async (code: string, progressId: number, approve: boolean, note?: string) => {
    const res = await gqlFetch<{ reviewProgress: Order }>(
      `mutation reviewProgress($code: String!, $id: Int!, $approve: Boolean!, $note: String) {
        reviewProgress(code: $code, progress_id: $id, approve: $approve, note: $note) { ${ORDER_FIELDS} }
      }`,
      { code, id: progressId, approve, note: note || null },
      { auth: true },
    )
    return res.reviewProgress
  }

  const getMyOrders = async (page: number, limit: number, status?: string) => {
    const res = await gqlFetch<{ getMyOrders: OrderPage }>(
      `query getMyOrders($page: Int, $limit: Int, $status: String) {
        getMyOrders(pagination: { page: $page, limit: $limit }, status: $status) { items { ${LIST_FIELDS} } page_info { total_items } }
      }`,
      { page, limit, status: status || null },
      { auth: true },
    )
    return res.getMyOrders
  }

  // the profile page: order counts, money paid and the running orders that changed last
  const getMyOrderSummary = async () => {
    const res = await gqlFetch<{ getMyOrderSummary: MyOrderSummary }>(
      `query getMyOrderSummary {
        getMyOrderSummary { total active completed total_paid active_orders { ${LIST_FIELDS} updated_at } }
      }`,
      {},
      { auth: true },
    )
    return res.getMyOrderSummary
  }

  // token: the order's access_token from the /orders/<token> URL
  const getMyOrder = async (token: string) => {
    const res = await gqlFetch<{ getMyOrder: Order }>(
      `query getMyOrder($token: String!) { getMyOrder(token: $token) { ${ORDER_FIELDS} } }`, { token }, { auth: true })
    return res.getMyOrder
  }

  const cancelMyOrder = async (code: string, reason?: string) => {
    const res = await gqlFetch<{ cancelMyOrder: Order }>(
      `mutation cancelMyOrder($code: String!, $reason: String) { cancelMyOrder(code: $code, reason: $reason) { ${ORDER_FIELDS} } }`,
      { code, reason: reason || null },
      { auth: true },
    )
    return res.cancelMyOrder
  }

  const submitPaymentProof = async (code: string, input: { invoice_id?: number; amount: number; paid_on: string; payer_name?: string; note?: string; proof: { file_name: string; content_type?: string; content: string } }) => {
    const res = await gqlFetch<{ submitPaymentProof: Order }>(
      `mutation submitPaymentProof($code: String!, $input: PaymentProofInput!) { submitPaymentProof(code: $code, input: $input) { ${ORDER_FIELDS} } }`,
      { code, input },
      { auth: true, timeout: 60000 },
    )
    return res.submitPaymentProof
  }

  // opens the Midtrans payment page for what is left on one invoice of the order
  const startOnlinePayment = async (code: string, invoiceId?: number) => {
    const res = await gqlFetch<{ startOnlinePayment: { redirect_url: string; expires_at: string; amount: number } }>(
      `mutation startOnlinePayment($code: String!, $invoice: Int) {
        startOnlinePayment(code: $code, invoice_id: $invoice) { redirect_url expires_at amount }
      }`,
      { code, invoice: invoiceId ?? null },
      { auth: true, timeout: 30000 },
    )
    return res.startOnlinePayment
  }

  // console
  const getOrders = async (page: number, limit: number, filters: { status?: string; type?: string; keyword?: string }) => {
    const res = await gqlFetch<{ getOrders: OrderPage }>(
      `query getOrders($page: Int, $limit: Int, $status: String, $type: String, $keyword: String) {
        getOrders(pagination: { page: $page, limit: $limit }, status: $status, type: $type, keyword: $keyword) { items { ${LIST_FIELDS} } page_info { total_items } }
      }`,
      { page, limit, status: filters.status || null, type: filters.type || null, keyword: filters.keyword || null },
      { auth: true },
    )
    return res.getOrders
  }

  const getOrderStatusCounts = async () => {
    const res = await gqlFetch<{ getOrderStatusCounts: { status: string; count: number }[] }>(
      'query getOrderStatusCounts { getOrderStatusCounts { status count } }', {}, { auth: true })
    return res.getOrderStatusCounts
  }

  const getOrder = async (id: number) => {
    const res = await gqlFetch<{ getOrder: Order }>(`query getOrder($id: Int!) { getOrder(id: $id) { ${ORDER_FIELDS} } }`, { id }, { auth: true })
    return res.getOrder
  }

  const setOrderShippingFee = async (id: number, fee: number, note: string, notify: boolean) => {
    const res = await gqlFetch<{ setOrderShippingFee: Order }>(
      `mutation setOrderShippingFee($id: Int!, $fee: Int64!, $note: String, $notify: Boolean) {
        setOrderShippingFee(id: $id, shipping_fee: $fee, shipping_note: $note, notify: $notify) { ${ORDER_FIELDS} }
      }`,
      { id, fee, note, notify },
      { auth: true, timeout: 60000 },
    )
    return res.setOrderShippingFee
  }

  const updateOrderStatus = async (id: number, status: string, trackingNumber?: string, note?: string) => {
    const res = await gqlFetch<{ updateOrderStatus: Order }>(
      `mutation updateOrderStatus($id: Int!, $status: String!, $tracking: String, $note: String) {
        updateOrderStatus(id: $id, status: $status, tracking_number: $tracking, note: $note) { ${ORDER_FIELDS} }
      }`,
      { id, status, tracking: trackingNumber || null, note: note || null },
      { auth: true },
    )
    return res.updateOrderStatus
  }

  // completes the order's current production step; files are data URLs (pictures become WebP)
  const addOrderProgress = async (id: number, stage: ProductionStep, note: string, files: EmailAttachmentInput[]) => {
    const res = await gqlFetch<{ addOrderProgress: Order }>(
      `mutation addOrderProgress($id: Int!, $stage: String!, $note: String, $files: [EmailAttachmentInput!]) {
        addOrderProgress(order_id: $id, stage: $stage, note: $note, files: $files) { ${ORDER_FIELDS} }
      }`,
      { id, stage, note: note || null, files: files.length ? files : null },
      { auth: true, timeout: 90000 },
    )
    return res.addOrderProgress
  }

  const cancelOrder = async (id: number, reason: string) => {
    const res = await gqlFetch<{ cancelOrder: Order }>(
      `mutation cancelOrder($id: Int!, $reason: String!) { cancelOrder(id: $id, reason: $reason) { ${ORDER_FIELDS} } }`,
      { id, reason },
      { auth: true },
    )
    return res.cancelOrder
  }

  const createQuotationFromOrder = async (orderId: number) => {
    const res = await gqlFetch<{ createQuotationFromOrder: { id: number; number: string } }>(
      'mutation createQuotationFromOrder($id: Int!) { createQuotationFromOrder(id: $id) { id number } }', { id: orderId }, { auth: true })
    return res.createQuotationFromOrder
  }

  const verifyPayment = async (paymentId: number) => {
    await gqlFetch('mutation verifyInvoicePayment($id: Int!) { verifyInvoicePayment(payment_id: $id) { id } }', { id: paymentId }, { auth: true })
  }

  const rejectPayment = async (paymentId: number, reason: string) => {
    await gqlFetch('mutation rejectInvoicePayment($id: Int!, $reason: String!) { rejectInvoicePayment(payment_id: $id, reason: $reason) { id } }', { id: paymentId, reason }, { auth: true })
  }

  return {
    previewCheckout, placeOrder, requestQuotation, respondQuotation, startOnlinePayment, getMyOrders, getMyOrderSummary, getMyOrder, cancelMyOrder, submitPaymentProof,
    previewPaymentPlan, choosePaymentPlan, reviewProgress,
    getOrders, getOrderStatusCounts, getOrder, setOrderShippingFee, updateOrderStatus, cancelOrder, createQuotationFromOrder, verifyPayment, rejectPayment,
    addOrderProgress,
  }
}
