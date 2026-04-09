export type WishlistProduct = {
  id: number
  slug: string
  name: string
  image: string | null
  category?: {
    name: string
  } | null
}

export type WishlistItem = {
  product: WishlistProduct
}

export const useWishlist = () => {
  const { gqlFetch } = useGql()

  const token = useCookie<string | null>('token', { sameSite: 'lax' })

  const items = useState<WishlistItem[]>('wishlist_items', () => [])
  const loading = useState<boolean>('wishlist_loading', () => false)
  const error = useState<string | null>('wishlist_error', () => null)

  const base64UrlToUtf8 = (input: string) => {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)

    if (typeof globalThis.atob === 'function') {
      const binary = globalThis.atob(padded)
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
      return new TextDecoder().decode(bytes)
    }

    return Buffer.from(padded, 'base64').toString('utf-8')
  }

  const getUserIdFromToken = (rawToken: string | null): number | null => {
    if (!rawToken) return null
    try {
      const parts = rawToken.split('.')
      if (parts.length !== 3) return null
      const payload = parts[1]
      if (!payload) return null
      const decoded = JSON.parse(base64UrlToUtf8(payload)) as { user_id?: number }
      return typeof decoded.user_id === 'number' ? decoded.user_id : null
    } catch {
      return null
    }
  }

  const getWishlistsQuery = `
    query getWishlists($user_id:Int!){
      getWishlists(user_id:$user_id){
        product{
          id,
          slug,
          name,
          image,
          category{
            name
          }
        }
      }
    }
  `

  const createWishlistMutation = `
    mutation createWishlist($user_id:Int!, $product_id:Int!){
      createWishlist(user_id:$user_id, product_id:$product_id){
        product{
          id,
          slug,
          name,
          image,
          category{
            name
          }
        }
      }
    }
  `

  const deleteWishlistMutation = `
    mutation deleteWishlist($user_id:Int!, $product_id:Int!){
      deleteWishlist(user_id:$user_id, product_id:$product_id)
    }
  `

  const fetchWishlists = async () => {
    const userId = getUserIdFromToken(token.value)
    if (!userId) {
      items.value = []
      return
    }

    loading.value = true
    error.value = null
    try {
      const data = await gqlFetch<{ getWishlists: WishlistItem[] }>(
        getWishlistsQuery,
        { user_id: userId },
        { auth: true },
      )
      items.value = data.getWishlists || []
    } catch (e: any) {
      error.value = e?.message || String(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const createWishlist = async (productId: number) => {
    const userId = getUserIdFromToken(token.value)
    if (!userId) throw new Error('Not authenticated')

    error.value = null
    const data = await gqlFetch<{ createWishlist: WishlistItem }>(
      createWishlistMutation,
      { user_id: userId, product_id: productId },
      { auth: true },
    )

    const created = data.createWishlist
    if (!created?.product?.slug) return created

    const exists = items.value.some((it) => it?.product?.id === created.product.id)
    if (!exists) items.value = [created, ...items.value]

    return created
  }

  const deleteWishlist = async (productId: number) => {
    const userId = getUserIdFromToken(token.value)
    if (!userId) throw new Error('Not authenticated')

    error.value = null

    const before = items.value
    items.value = items.value.filter((it) => it?.product?.id !== productId)

    try {
      await gqlFetch<{ deleteWishlist: boolean }>(
        deleteWishlistMutation,
        { user_id: userId, product_id: productId },
        { auth: true },
      )
    } catch (e) {
      items.value = before
      throw e
    }
  }

  return {
    token,
    items,
    loading,
    error,
    fetchWishlists,
    createWishlist,
    deleteWishlist,
  }
}
