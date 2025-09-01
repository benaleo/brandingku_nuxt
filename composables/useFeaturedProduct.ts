import { ref, onMounted, computed } from 'vue'
import { useGql } from '~/composables/useGql'

export type FeaturedProductItem = {
  id: string
  name: string
  slug: string
  category?: string
  image?: string
  is_highlight: boolean
  is_recommended: boolean
  is_upsell: boolean
  price: number
  originalPrice?: number | null
}

export const useFeaturedProduct = () => {
  const { gqlFetch } = useGql()

  const data = ref<FeaturedProductItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchFeatured = async () => {
    loading.value = true
    error.value = null
    try {
      const query = `
        query GetProductsFeatured($page: Int!, $limit: Int!) {
          getProducts(pagination: { page: $page, limit: $limit }) {
            items {
              id
              name
              slug
              image
              category { id name }
              is_highlight
              is_recommended
              is_upsell
              galleries { id image orders }
              additionals {
                id
                name
                price
                moq
                stock
                discount
                discount_type
                attributes
              }
              created_at
              updated_at
            }
            page_info {
              current_page
              per_page
              total_items
              total_pages
              has_next_page
              has_previous_page
              start_item
              end_item
            }
          }
        }
      `
      const res = await gqlFetch<{ getProducts: { items: any[] } }>(query, { page: 1, limit: 20 }, { auth: true })
      const list = (res?.getProducts?.items || [])

      const items: FeaturedProductItem[] = list.map((p: any) => {
        const galleries = Array.isArray(p.galleries) ? [...p.galleries] : []
        galleries.sort((a: any, b: any) => (Number(a?.orders) || 0) - (Number(b?.orders) || 0))
        const image = galleries[0]?.image || p.image || undefined

        // compute pricing (min base vs min discounted across additionals)
        let minBase = Infinity
        let minAfter = Infinity
        for (const a of p.additionals || []) {
          const base = Number(a?.price) || 0
          minBase = Math.min(minBase, base)
          let after = base
          const discount = Number(a?.discount) || 0
          if (discount > 0) {
            if ((a?.discount_type || '').toUpperCase() === 'PERCENTAGE') {
              after = base - (base * discount) / 100
            } else {
              after = base - discount
            }
          }
          if (after < 0) after = 0
          minAfter = Math.min(minAfter, after)
        }
        if (!isFinite(minBase)) minBase = 0
        if (!isFinite(minAfter)) minAfter = minBase

        return {
          id: String(p.id),
          name: p.name,
          slug: p.slug,
          category: p?.category?.name,
          image,
          is_highlight: !!p.is_highlight,
          is_recommended: !!p.is_recommended,
          is_upsell: !!p.is_upsell,
          price: Number(minAfter.toFixed(2)),
          originalPrice: minAfter < minBase ? Number(minBase.toFixed(2)) : null,
        }
      })

      data.value = items
    } catch (e: any) {
      error.value = e?.message || 'Failed to fetch featured products'
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchFeatured)

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    refetch: fetchFeatured,
  }
}
