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
