// an account as a buyer in the console; superadmins are never listed
export interface Customer {
  id: number
  name: string
  email: string
  phone: string
  address: string
  avatar: string
  // the role name, e.g. user or admin
  role: string
  is_active: boolean
  order_count: number
  // orders not completed, cancelled, expired or rejected yet
  open_order_count: number
  last_order_at: string | null
  created_at: string
}

// admin-only address book entry of a customer
export interface CustomerAddress {
  id: number
  user_id: number
  label: string
  recipient_name: string
  phone: string
  address: string
  city: string
  postal_code: string
  created_at: string
  updated_at: string
}

export type CustomerAddressInput = {
  label?: string
  recipient_name: string
  phone: string
  address: string
  city: string
  postal_code?: string
}
