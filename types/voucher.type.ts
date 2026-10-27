export type VoucherType = 'percentage' | 'fixed'
export type VoucherScope = 'all' | 'categories' | 'products'
export type VoucherStatus = 'active' | 'scheduled' | 'expired' | 'exhausted' | 'inactive'

export type VoucherTargetRef = { id: number; name: string }

export type Voucher = {
  id: number
  code: string
  name: string
  description: string
  type: VoucherType
  // basis points for percentage vouchers (1000 = 10%), rupiah for fixed ones
  value: number
  max_discount: number
  min_subtotal: number
  starts_at?: string | null
  ends_at?: string | null
  usage_limit: number
  per_user_limit: number
  used_count: number
  scope: VoucherScope
  categories: VoucherTargetRef[]
  products: VoucherTargetRef[]
  is_active: boolean
  status: VoucherStatus
  created_at: string
  updated_at: string
}

export type VoucherInput = {
  code: string
  name: string
  description?: string
  type: VoucherType
  value: number
  max_discount?: number
  min_subtotal?: number
  starts_at?: string | null
  ends_at?: string | null
  usage_limit?: number
  per_user_limit?: number
  scope: VoucherScope
  category_ids?: number[]
  product_ids?: number[]
  is_active: boolean
}

export type VoucherRedemption = {
  id: number
  user_id: number
  user_email: string
  order_id?: number | null
  invoice_id?: number | null
  invoice_number?: string | null
  discount_amount: number
  status: 'reserved' | 'used' | 'released'
  created_at: string
}
