import type { Testimonial, TestimonialPlacement } from '~/types/testimonial.type'

export type ClaimResolution = 'refund' | 'replace'
export type ClaimStatus = 'submitted' | 'approved' | 'rejected' | 'resolved'

export interface GuaranteeClaimFile {
  file_name: string
  // image/webp for pictures (converted on upload), application/pdf, or application/octet-stream
  content_type: string
  size: number
  path: string
}

export interface GuaranteeClaim {
  id: number
  order_id: number
  order_code: string
  customer_name: string
  // what the customer asked for, or how the admin settled it on approval
  resolution: ClaimResolution
  reason: string
  files: GuaranteeClaimFile[]
  status: ClaimStatus
  decision_note: string
  // e.g. the refund transfer or the replacement's tracking number
  resolution_note: string
  decided_at: string | null
  resolved_at: string | null
  created_at: string
}

export interface ReviewableProduct {
  product_id: number
  name: string
  slug: string
  image: string
  // the customer's testimonial of it, hidden until an admin activates it
  testimonial: Testimonial | null
}

export interface OrderAftercare {
  completed_at: string | null
  // 0 means orders have no guarantee
  guarantee_days: number
  guarantee_until: string | null
  can_claim_guarantee: boolean
  // newest first
  claims: GuaranteeClaim[]
  can_review: boolean
  products: ReviewableProduct[]
  // the customer's testimonial for the landing page
  landing_testimonial: Testimonial | null
}

export interface ReviewSummary {
  count: number
  average: number
  // 5 stars down to 1; a half star counts with the whole star below it
  distribution: { stars: number; count: number }[]
}

export type ReviewInput = { placement: TestimonialPlacement; product_id?: number | null; rating: number; content: string; public_consent: boolean }
