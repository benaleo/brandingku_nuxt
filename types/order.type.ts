import type { LineBranding, OrderItemBranding } from './branding.type'

export type OrderStatus =
  | 'awaiting_shipping_fee'
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'
  | 'expired'
  // quotation requests
  | 'requested'
  | 'quoted'
  | 'revision_requested'
  | 'accepted'
  | 'rejected'

export type OrderItem = {
  id: number
  product_id: number
  product_additional_id: number
  product_name: string
  product_slug: string
  product_image: string
  variant_name: string
  quantity: number
  unit_price: number
  original_unit_price: number
  brandings: OrderItemBranding[]
  branding_unit_price: number
  // (unit_price + branding_unit_price) * quantity
  line_total: number
  note: string
}

export type OrderPayment = {
  id: number
  amount: number
  method: string
  proof_path: string
  payer_name: string
  note: string
  paid_on: string
  status: 'pending' | 'verified' | 'rejected'
  reject_reason?: string | null
  created_at: string
}

export type OrderInvoice = {
  id: number
  number: string
  status: string
  public_token: string
  due_date: string
  subtotal: number
  discount_total: number
  shipping_fee: number
  tax_mode: 'none' | 'exclusive' | 'inclusive'
  tax_rate_bps: number
  tax_base: number
  tax_total: number
  total: number
  amount_due: number
  paid_amount: number
  payments: OrderPayment[]
  bank_accounts: { bank: string; number: string; name: string }[]
}

export type OrderDocument = {
  id: number
  number: string
  type: 'invoice' | 'quotation' | 'deal' | 'dp' | 'final'
  status: string
  public_token: string
  issue_date: string
  due_date: string
  total: number
  amount_due: number
  paid_amount: number
  payments: OrderPayment[]
}

// production steps an admin reports on a quotation order after its first payment
export type ProductionStep = 'mockup' | 'sample' | 'mass_production' | 'qc' | 'ready_to_ship'

export type OrderProgressFile = {
  file_name: string
  // image/webp for pictures, application/pdf, or application/octet-stream
  content_type: string
  size: number
  path: string
}

export type OrderProgress = {
  id: number
  stage: ProductionStep
  note: string
  files: OrderProgressFile[]
  // mockup and sample: '' while waiting for the customer
  decision: '' | 'approved' | 'revision'
  decision_note: string
  decided_at?: string | null
  created_at: string
}

export type PaymentPlanOptions = {
  deal_number: string
  deal_total: number
  // half the deal, rounded up
  min_dp_amount: number
}

export type PaymentPlanInput = {
  plan: 'dp' | 'full'
  dp_percent_bps?: number | null
  dp_amount?: number | null
}

export type Order = {
  id: number
  code: string
  // unguessable id of the customer's order page: /orders/<access_token>
  access_token: string
  type: 'purchase' | 'quotation'
  status: OrderStatus
  user_id: number
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_company: string
  delivery_method: 'delivery' | 'pickup'
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  shipping_city: string
  shipping_postal_code: string
  shipping_fee: number
  shipping_note: string
  tracking_number: string
  notes: string
  subtotal: number
  discount_total: number
  voucher_code: string
  expires_at?: string | null
  paid_at?: string | null
  cancelled_at?: string | null
  cancel_reason?: string | null
  can_cancel: boolean
  can_submit_payment: boolean
  can_respond_quotation: boolean
  can_pay_online: boolean
  design_file_path: string
  design_file_name: string
  documents: OrderDocument[]
  payable_documents: OrderDocument[]
  items: OrderItem[]
  events: { id: number; action: string; actor: string; note: string; created_at: string }[]
  invoice?: OrderInvoice | null
  // quotation requests: the customer's first payment, empty until chosen
  payment_plan: '' | 'dp' | 'full'
  // the admin's next production step, 'done' when ready to ship; empty until the first payment
  production_stage: '' | ProductionStep | 'done'
  progress: OrderProgress[]
  // set while the customer may choose how to pay first
  payment_options?: PaymentPlanOptions | null
  // the customer may approve the latest mockup or sample
  can_review_progress: boolean
  // production done and everything paid
  can_ship: boolean
  created_at: string
  updated_at: string
}

export type CheckoutItemInput = { product_additional_id: number; quantity: number; note?: string; branding_ids?: number[] }

export type CheckoutLine = {
  product_id: number
  product_additional_id: number
  product_name: string
  product_slug: string
  product_image: string
  variant_name: string
  quantity: number
  moq: number
  stock: number
  unit_price: number
  original_unit_price: number
  brandings: LineBranding[]
  branding_unit_price: number
  line_total: number
  note: string
  problem: string
}

export type CheckoutPreview = {
  lines: CheckoutLine[]
  subtotal: number
  discount: number
  voucher_code: string
  voucher_message: string
  tax_mode: 'none' | 'exclusive' | 'inclusive'
  tax_rate_bps: number
  tax_base: number
  tax_total: number
  total: number
  can_pay: boolean
}

export type CheckoutInput = {
  items?: CheckoutItemInput[]
  voucher_code?: string
  delivery_method: 'delivery' | 'pickup'
  customer_name: string
  customer_phone: string
  customer_company?: string
  shipping_name?: string
  shipping_phone?: string
  shipping_address?: string
  shipping_city?: string
  shipping_postal_code?: string
  notes?: string
}
