import { useGql } from '~/composables/useGql'
import type { EmailAttachmentInput } from '~/types/admin-smtp.type'
import type { ClaimResolution, GuaranteeClaim, OrderAftercare, ReviewInput, ReviewSummary } from '~/types/aftercare.type'

const TESTIMONIAL_FIELDS = 'id name job content rating orders is_active placement product_id product_name order_id public_consent created_at'
const CLAIM_FIELDS = `id order_id order_code customer_name resolution reason status decision_note resolution_note decided_at resolved_at created_at
  files { file_name content_type size path }`
const AFTERCARE_FIELDS = `completed_at guarantee_days guarantee_until can_claim_guarantee can_review
  claims { ${CLAIM_FIELDS} }
  products { product_id name slug image testimonial { ${TESTIMONIAL_FIELDS} } }
  landing_testimonial { ${TESTIMONIAL_FIELDS} }`

export type ClaimInput = { resolution: ClaimResolution; reason: string; files: EmailAttachmentInput[] }

// guarantee claims and reviews (saved as testimonials) of completed orders
export const useAftercareService = () => {
  const { gqlFetch } = useGql()

  // token: the order's access_token from the /orders/<token> URL
  const getMyAftercare = async (token: string) => {
    const res = await gqlFetch<{ getMyOrder: { aftercare: OrderAftercare } }>(
      `query myAftercare($token: String!) { getMyOrder(token: $token) { id aftercare { ${AFTERCARE_FIELDS} } } }`, { token }, { auth: true })
    return res.getMyOrder.aftercare
  }
  const getOrderAftercare = async (id: number) => {
    const res = await gqlFetch<{ getOrder: { aftercare: OrderAftercare } }>(
      `query orderAftercare($id: Int!) { getOrder(id: $id) { id aftercare { ${AFTERCARE_FIELDS} } } }`, { id }, { auth: true })
    return res.getOrder.aftercare
  }

  // code: the order code; files are data URLs, so the upload can take a while
  const claimGuarantee = (code: string, input: ClaimInput) =>
    gqlFetch(`mutation claimGuarantee($code: String!, $input: GuaranteeClaimInput!) { claimGuarantee(code: $code, input: $input) { id } }`,
      { code, input }, { auth: true, timeout: 60000 })
  const submitReview = (code: string, input: ReviewInput) =>
    gqlFetch(`mutation submitReview($code: String!, $input: ReviewInput!) { submitReview(code: $code, input: $input) { id } }`,
      { code, input }, { auth: true })

  const getProductReviewSummary = async (productId: number) => {
    const res = await gqlFetch<{ getProductReviewSummary: ReviewSummary }>(
      `query reviewSummary($product: Int!) { getProductReviewSummary(product_id: $product) { count average } }`, { product: productId })
    return res.getProductReviewSummary
  }

  // console
  const getGuaranteeClaims = async (status: string) => {
    const res = await gqlFetch<{ getGuaranteeClaims: GuaranteeClaim[] }>(
      `query getGuaranteeClaims($status: String) { getGuaranteeClaims(status: $status) { ${CLAIM_FIELDS} } }`, { status }, { auth: true })
    return res.getGuaranteeClaims
  }
  const decideGuaranteeClaim = async (id: number, approve: boolean, resolution: ClaimResolution | null, note: string) => {
    const res = await gqlFetch<{ decideGuaranteeClaim: GuaranteeClaim }>(
      `mutation decideGuaranteeClaim($id: Int!, $approve: Boolean!, $resolution: String, $note: String) {
        decideGuaranteeClaim(id: $id, approve: $approve, resolution: $resolution, note: $note) { ${CLAIM_FIELDS} }
      }`, { id, approve, resolution, note }, { auth: true })
    return res.decideGuaranteeClaim
  }
  const resolveGuaranteeClaim = async (id: number, note: string) => {
    const res = await gqlFetch<{ resolveGuaranteeClaim: GuaranteeClaim }>(
      `mutation resolveGuaranteeClaim($id: Int!, $note: String!) { resolveGuaranteeClaim(id: $id, note: $note) { ${CLAIM_FIELDS} } }`,
      { id, note }, { auth: true })
    return res.resolveGuaranteeClaim
  }
  // sidebar badges: customers' testimonials waiting for moderation and new guarantee claims
  const getConsoleCounts = async (testimonials: boolean, claims: boolean) => {
    const fields = [testimonials && 'testimonialsPendingCount', claims && 'guaranteeClaimsOpenCount'].filter(Boolean)
    if (!fields.length) return { testimonialsPendingCount: 0, guaranteeClaimsOpenCount: 0 }
    const res = await gqlFetch<{ testimonialsPendingCount?: number; guaranteeClaimsOpenCount?: number }>(`query { ${fields.join(' ')} }`, {}, { auth: true })
    return { testimonialsPendingCount: res.testimonialsPendingCount ?? 0, guaranteeClaimsOpenCount: res.guaranteeClaimsOpenCount ?? 0 }
  }

  return {
    getMyAftercare, getOrderAftercare, claimGuarantee, submitReview, getProductReviewSummary,
    getGuaranteeClaims, decideGuaranteeClaim, resolveGuaranteeClaim, getConsoleCounts,
  }
}
