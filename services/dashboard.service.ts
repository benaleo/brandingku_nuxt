import { useGql } from '~/composables/useGql'
import type { Dashboard } from '~/types/dashboard.type'

const METRIC = 'current previous'

export const useDashboardService = () => {
  const { gqlFetch } = useGql()
  // days: 7, 30, 90 or 365
  const getDashboard = async (days: number) => {
    const res = await gqlFetch<{ getDashboard: Dashboard }>(
      `query getDashboard($days: Int) {
        getDashboard(days: $days) {
          days bucket open_orders quotations_won
          revenue { ${METRIC} } orders { ${METRIC} } new_customers { ${METRIC} } paid_orders { ${METRIC} } quotations { ${METRIC} }
          series { date revenue orders }
          orders_by_status { key count }
          top_products { product_id name image quantity revenue }
          recent_orders { id code type status customer_name total created_at }
          attention { payment_proofs awaiting_shipping_fee quotation_requests quotation_revisions guarantee_claims pending_testimonials open_inquiries unread_chats }
        }
      }`,
      { days },
      { auth: true },
    )
    return res.getDashboard
  }
  return { getDashboard }
}
