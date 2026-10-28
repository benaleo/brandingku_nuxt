// a record kind that has a discussion thread; the backend decides who may join each one
export type DiscussionSubject = 'order'

export type DiscussionRole = 'customer' | 'staff'

export interface DiscussionMessage {
  id: number
  subject_type: DiscussionSubject
  subject_id: number
  author_name: string
  author_role: DiscussionRole
  message: string
  created_at: string
}
