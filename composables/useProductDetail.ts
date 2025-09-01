import { ref, onMounted, computed } from 'vue'
import { useGql } from '~/composables/useGql'

export type ProductDetail = {
  id: string
  name: string
  slug: string
  category?: string
  images: string[]
  price: number
  originalPrice?: number | null
  colors: string[]
  sizes: string[]
  details: { key: string; value: string }[]
  inStock: boolean
}

export const useProductDetail = (initialSlug: string) => {
  const { gqlFetch } = useGql()

  const data = ref<ProductDetail | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const slug = ref<string>(initialSlug || '')

  const fetchBySlug = async () => {
    if (!slug.value) {
      error.value = 'Invalid product slug'
      return
    }
    loading.value = true
    error.value = null
    try {
      const query = `
        query GetProductsForDetail {
          getProducts {
            id
            name
            slug
            description
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
        }
      `
      const res = await gqlFetch<{ getProducts: any[] }>(query, undefined, { auth: true })
      const list = res?.getProducts || []
      const p = list.find((x: any) => x?.slug === slug.value)
      if (!p) throw new Error('Product not found')

      // Sort galleries
      const galleries = Array.isArray(p.galleries) ? [...p.galleries] : []
      galleries.sort((a: any, b: any) => (Number(a?.orders) || 0) - (Number(b?.orders) || 0))
      const images: string[] = galleries.map((g: any) => g?.image).filter(Boolean)
      if (!images.length && p.image) images.push(p.image)

      // Compute pricing from additionals
      let minBase = Infinity
      let minAfter = Infinity
      let anyStock = false

      const allAttributes: { key: string; value: string }[] = []
      for (const a of p.additionals || []) {
        const base = Number(a?.price) || 0
        minBase = Math.min(minBase, base)
        let after = base
        const discount = Number(a?.discount) || 0
        if (discount > 0) {
          if ((a?.discount_type || '').toUpperCase() === 'PERCENTAGE') after = base - (base * discount) / 100
          else after = base - discount
        }
        if (after < 0) after = 0
        minAfter = Math.min(minAfter, after)

        if (Number(a?.stock) > 0) anyStock = true

        // Parse attributes JSON
        try {
          const parsed = JSON.parse(a?.attributes || '[]')
          if (Array.isArray(parsed)) {
            for (const it of parsed) {
              if (it && typeof it.key === 'string' && typeof it.value === 'string') {
                allAttributes.push({ key: it.key, value: it.value })
              }
            }
          }
        } catch (_) {
          /* ignore */
        }
      }
      if (!isFinite(minBase)) minBase = 0
      if (!isFinite(minAfter)) minAfter = minBase

      // Deduplicate attributes and derive colors/sizes
      const seen = new Set<string>()
      const details: { key: string; value: string }[] = []
      for (const kv of allAttributes) {
        const sig = `${kv.key}::${kv.value}`
        if (!seen.has(sig)) {
          seen.add(sig)
          details.push(kv)
        }
      }
      const colors = [...new Set(details.filter(kv => /color/i.test(kv.key)).map(kv => kv.value))]
      const sizes = [...new Set(details.filter(kv => /size/i.test(kv.key)).map(kv => kv.value))]

      data.value = {
        id: String(p.id),
        name: p.name,
        slug: p.slug,
        category: p?.category?.name,
        images,
        price: Number(minAfter.toFixed(2)),
        originalPrice: minAfter < minBase ? Number(minBase.toFixed(2)) : null,
        colors,
        sizes,
        details,
        inStock: anyStock,
      }
    } catch (e: any) {
      error.value = e?.message || 'Failed to fetch product detail'
      data.value = null
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchBySlug)

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    refetch: fetchBySlug,
    setSlug: (s: string) => { slug.value = s },
  }
}
