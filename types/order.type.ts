export type OrderStatus =
  | 'awaiting_shipping_fee'
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'
  | 'expired'

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

export type Order = {
  id: number
  code: string
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
  items: OrderItem[]
  events: { id: number; action: string; actor: string; note: string; created_at: string }[]
  invoice?: OrderInvoice | null
  created_at: string
  updated_at: string
}

export type CheckoutItemInput = { product_additional_id: number; quantity: number; note?: string }

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
