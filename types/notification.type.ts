import type { OrderStatus } from '~/types/order.type'

export interface AppNotification {
  id: number
  kind: 'order_status' | 'discussion'
  // the order event action for order_status (e.g. quoted, shipped); empty otherwise
  action: string
  subject_type: string
  subject_id: number
  // e.g. the order code
  subject_label: string
  // event note or message excerpt
  body: string
  link: string
  read: boolean
  created_at: string
}

// a quotation request still in progress; always counted on the bell
export interface NotificationQuotation {
  order_id: number
  code: string
  access_token: string
  status: OrderStatus
  first_item: string
  item_count: number
  updated_at: string
}

export interface NotificationFeed {
  quotations: NotificationQuotation[]
  items: AppNotification[]
  unread_count: number
  // quotations + unread_count
  badge_count: number
}
