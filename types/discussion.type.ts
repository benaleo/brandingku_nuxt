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
