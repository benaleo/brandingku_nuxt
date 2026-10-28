import { useOrderService } from '~/services/order.service'
import type { OrderStatus } from '~/types/order.type'

// unfinished transactions for the console sidebar badge; shared so order pages can refresh it
export const useOpenOrderCount = () => {
  const count = useState<number>('open-order-count', () => 0)
  const { getOrderStatusCounts } = useOrderService()

  const refresh = async () => {
    try {
      const rows = await getOrderStatusCounts()
      count.value = rows
        .filter(r => !FINISHED_ORDER_STATUSES.includes(r.status as OrderStatus))
        .reduce((sum, r) => sum + r.count, 0)
    } catch {
      // silent: the badge keeps its last known value
    }
  }

  return { count, refresh }
}
