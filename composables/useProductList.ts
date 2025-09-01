import { ref, computed, watch } from 'vue'
import { useProductService } from '~/services/product.service'

export const useProductList = () => {
  // Use the existing product service in list mode (auto-fetch and watch params)
  const {
    datas,
    loading,
    error,
    setParams,
    getProducts,
  } = useProductService(true)

  // Keyword filter (by name/slug)
  const keyword = ref('')

  // Push keyword into service params (service already watches params and refetches)
  watch(keyword, (v) => {
    setParams({ keyword: v || undefined })
    // Trigger fetch if needed (service auto-fetches on param change)
    getProducts()
  }, { immediate: true })

  // Expose a clean list
  const products = computed(() => (datas.value as any[]) || [])

  // Optional local filtered output by name (in case the page wants immediate filtering UX)
  const filteredByName = computed(() => {
    const kw = (keyword.value || '').trim().toLowerCase()
    if (!kw) return products.value
    return products.value.filter((p: any) =>
      (p?.name || '').toLowerCase().includes(kw) ||
      (p?.slug || '').toLowerCase().includes(kw)
    )
  })

  return {
    products,
    filteredByName,
    loading,
    error,
    keyword,
    setKeyword: (v: string) => { keyword.value = v },
    refetch: () => getProducts(),
  }
}
