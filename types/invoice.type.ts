export type InvoiceType = 'invoice' | 'quotation' | 'deal' | 'dp' | 'final'
// approved: a quotation the customer agreed to
export type InvoiceStatus = 'draft' | 'sent' | 'approved' | 'paid' | 'void' | 'cancelled' | 'overdue'
export type TaxMode = 'none' | 'exclusive' | 'inclusive'

export type InvoiceItem = {
  id?: number
  product_id?: number | null
  product_additional_id?: number | null
  description: string
  quantity: number
  unit_price: number
  discount_bps: number
  line_total?: number
}

export type InvoicePayment = {
  id: number
  amount: number
  method: string
  proof_path: string
  payer_name: string
  note: string
  paid_on: string
  status: string
  reject_reason?: string | null
  verified_by: string
  verified_at?: string | null
  created_at: string
}

export type InvoiceEvent = { id: number; action: string; actor: string; note: string; created_at: string }

export type InvoiceLink = { id: number; number: string; type: InvoiceType; status: InvoiceStatus; total: number; amount_due: number }

export type Invoice = {
  id: number
  number: string
  type: InvoiceType
  status: InvoiceStatus
  parent?: InvoiceLink | null
  children: InvoiceLink[]
  order_id?: number | null
  user_id?: number | null
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_company: string
  customer_address: string
  customer_npwp: string
  issue_date: string
  due_date: string
  subtotal: number
  discount_total: number
  shipping_fee: number
  tax_mode: TaxMode
  tax_rate_bps: number
  tax_base: number
  tax_total: number
  total: number
  deduction: number
  amount_due: number
  paid_amount: number
  notes: string
  terms: string
  public_token: string
  sent_at?: string | null
  paid_at?: string | null
  void_reason?: string | null
  created_by: string
  items: InvoiceItem[]
  payments: InvoicePayment[]
  events: InvoiceEvent[]
  created_at: string
  updated_at: string
}

export type InvoiceInput = {
  type?: InvoiceType
  customer_name: string
  customer_email?: string
  customer_phone?: string
  customer_company?: string
  customer_address?: string
  customer_npwp?: string
  issue_date?: string
  due_date?: string
  items: Omit<InvoiceItem, 'id' | 'line_total'>[]
  discount_total?: number
  shipping_fee?: number
  tax_mode?: TaxMode
  tax_rate_bps?: number
  notes?: string
  terms?: string
}

export type InvoiceStatusSummary = { status: InvoiceStatus; count: number; amount_due: number }

export type PublicInvoice = Omit<Invoice, 'id' | 'parent' | 'children' | 'order_id' | 'user_id' | 'public_token' | 'sent_at' | 'paid_at' | 'void_reason' | 'created_by' | 'payments' | 'events' | 'created_at' | 'updated_at'> & {
  parent_number?: string | null
  company_name: string
  company_npwp: string
  company_address: string
  company_phone: string
  company_email: string
  bank_accounts: { bank: string; number: string; name: string }[]
}
