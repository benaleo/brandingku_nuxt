// a record kind that has a discussion thread; the backend decides who may join each one
export type DiscussionSubject = 'order'

export type DiscussionRole = 'customer' | 'staff'

export interface DiscussionAttachment {
  file_name: string
  // image/webp for pictures (converted on upload), application/pdf, or application/octet-stream
  content_type: string
  size: number
  path: string
}

export interface DiscussionMessage {
  id: number
  subject_type: DiscussionSubject
  subject_id: number
  author_name: string
  author_role: DiscussionRole
  // empty when the message is only a file
  message: string
  attachment: DiscussionAttachment | null
  created_at: string
}

// one thread in the console inbox
export interface DiscussionThread {
  subject_type: DiscussionSubject
  subject_id: number
  // e.g. the order code
  label: string
  customer_name: string
  last_message: DiscussionMessage
  unread: number
}

// a new message from the other side; link opens the thread for the receiving side
export interface DiscussionActivity {
  message: DiscussionMessage
  label: string
  link: string
}
