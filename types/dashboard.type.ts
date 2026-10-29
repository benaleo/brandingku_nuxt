// one figure for the period and the same-length period before it
export interface DashboardMetric { current: number; previous: number }

export interface DashboardPoint {
  // start of the bucket (a day, week or month in WIB)
  date: string
  revenue: number
  orders: number
}

export interface DashboardProduct { product_id: number; name: string; image: string; quantity: number; revenue: number }

export interface DashboardOrder {
  id: number
  code: string
  type: 'purchase' | 'quotation'
  status: string
  customer_name: string
  total: number
  created_at: string
}

export interface DashboardAttention {
  payment_proofs: number
  awaiting_shipping_fee: number
  quotation_requests: number
  quotation_revisions: number
  guarantee_claims: number
  pending_testimonials: number
  open_inquiries: number
  unread_chats: number
}

export interface Dashboard {
  days: number
  bucket: 'day' | 'week' | 'month'
  revenue: DashboardMetric
  orders: DashboardMetric
  new_customers: DashboardMetric
  paid_orders: DashboardMetric
  open_orders: number
  quotations: DashboardMetric
  quotations_won: number
  series: DashboardPoint[]
  orders_by_status: { key: string; count: number }[]
  top_products: DashboardProduct[]
  recent_orders: DashboardOrder[]
  attention: DashboardAttention
}
