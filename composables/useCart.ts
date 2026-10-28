import { computed } from 'vue'
import { useGql } from './useGql'
import type { LineBranding } from '~/types/branding.type'

export type CartItem = {
  id: number
  product_id: number
  product_additional_id: number
  quantity: number
  note: string
  product_name: string
  product_slug: string
  product_image: string
  variant_name: string
  moq: number
  stock: number
  // 0 means the price is given on request
  unit_price: number
  original_unit_price: number
  brandings: LineBranding[]
  // sum of the available brandings per piece
  branding_unit_price: number
  // (unit_price + branding_unit_price) * quantity
  line_total: number
  available: boolean
}

export type Cart = {
  items: CartItem[]
  item_count: number
  subtotal: number
  has_price_on_request: boolean
}

type GuestLine = { product_additional_id: number; quantity: number; note?: string; branding_ids?: number[] }

const GUEST_KEY = 'bk_guest_cart'
const MAX_LINES = 50
const CART_FIELDS = `
  items {
    id product_id product_additional_id quantity note
    product_name product_slug product_image variant_name
    moq stock unit_price original_unit_price line_total available
    branding_unit_price brandings { branding_method_id name unit_price min_qty available }
  }
  item_count subtotal has_price_on_request
`
const emptyCart = (): Cart => ({ items: [], item_count: 0, subtotal: 0, has_price_on_request: false })

// guests keep their cart in localStorage; it moves into the account on the next refresh after login
const readGuest = (): GuestLine[] => {
  if (!import.meta.client) return []
  try {
    const list = JSON.parse(localStorage.getItem(GUEST_KEY) || '[]')
    return Array.isArray(list)
      ? list.filter((l: any) => Number(l?.product_additional_id) > 0 && Number(l?.quantity) > 0)
        .map((l: any) => ({
          product_additional_id: Number(l.product_additional_id),
          quantity: Number(l.quantity),
          note: l.note ? String(l.note) : undefined,
          branding_ids: Array.isArray(l.branding_ids) ? l.branding_ids.map(Number).filter((id: number) => id > 0) : undefined,
        }))
      : []
  } catch {
    return []
  }
}

const writeGuest = (lines: GuestLine[]) => {
  if (!import.meta.client) return
  try {
    if (lines.length) localStorage.setItem(GUEST_KEY, JSON.stringify(lines))
    else localStorage.removeItem(GUEST_KEY)
  } catch {
    // storage blocked: the guest cart only lives for this page view
  }
}

// read at call time: other useCookie refs only sync asynchronously after login
const currentToken = (): string | null => {
  if (!import.meta.client) return null
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/)
  if (!match?.[1]) return null
  try {
    const value = decodeURIComponent(match[1])
    return value && value !== 'null' && value !== 'undefined' ? value.replace(/^"|"$/g, '') : null
  } catch {
    return null
  }
}

export const useCart = () => {
  const { gqlFetch } = useGql()
  const cart = useState<Cart>('cart', emptyCart)
  const loading = useState<boolean>('cart-loading', () => false)
  const count = computed(() => cart.value.item_count)

  const authed = <T>(query: string, variables: Record<string, any>, token: string) =>
    gqlFetch<T>(query, variables, { headers: { Authorization: `Bearer ${token}` } })

  const preview = async (lines: GuestLine[]) => {
    if (!lines.length) return emptyCart()
    const res = await gqlFetch<{ previewCart: Cart }>(
      `query previewCart($items: [CartItemInput!]!) { previewCart(items: $items) { ${CART_FIELDS} } }`,
      { items: lines },
    )
    return res.previewCart
  }

  // drop guest lines whose variant the server no longer knows
  const pruneGuest = (lines: GuestLine[], priced: Cart) => {
    const known = new Set(priced.items.map(i => i.product_additional_id))
    const kept = lines.filter(l => known.has(l.product_additional_id))
    if (kept.length !== lines.length) writeGuest(kept)
  }

  const refresh = async () => {
    if (!import.meta.client) return
    loading.value = true
    try {
      const token = currentToken()
      const guest = readGuest()
      if (!token) {
        const priced = await preview(guest)
        pruneGuest(guest, priced)
        cart.value = priced
      } else if (guest.length) {
        const res = await authed<{ mergeCart: Cart }>(
          `mutation mergeCart($items: [CartItemInput!]!) { mergeCart(items: $items) { ${CART_FIELDS} } }`,
          { items: guest },
          token,
        )
        writeGuest([])
        cart.value = res.mergeCart
      } else {
        const res = await authed<{ getCart: Cart }>(`query getCart { getCart { ${CART_FIELDS} } }`, {}, token)
        cart.value = res.getCart
      }
    } finally {
      loading.value = false
    }
  }

  // a guest line is a variant with one set of brandings, like a server cart line
  const sameLine = (l: GuestLine, variantId: number, key: string) =>
    l.product_additional_id === variantId && brandingKey(l.branding_ids) === key
  const itemKey = (item: CartItem) => brandingKey(item.brandings.map(b => b.branding_method_id))

  const add = async (productAdditionalId: number, quantity: number, note?: string, brandingIds: number[] = []) => {
    const token = currentToken()
    if (token) {
      const res = await authed<{ addToCart: Cart }>(
        `mutation addToCart($id: Int!, $qty: Int!, $note: String, $brandings: [Int!]) {
          addToCart(product_additional_id: $id, quantity: $qty, note: $note, branding_ids: $brandings) { ${CART_FIELDS} }
        }`,
        { id: productAdditionalId, qty: quantity, note: note ?? null, brandings: brandingIds.length ? brandingIds : null },
        token,
      )
      cart.value = res.addToCart
      return
    }
    const lines = readGuest()
    const key = brandingKey(brandingIds)
    const line = lines.find(l => sameLine(l, productAdditionalId, key))
    if (line) {
      line.quantity += quantity
      if (note) line.note = note
    } else {
      if (lines.length >= MAX_LINES) throw new Error(`Keranjang maksimal ${MAX_LINES} produk`)
      lines.push({ product_additional_id: productAdditionalId, quantity, note, branding_ids: brandingIds.length ? [...brandingIds] : undefined })
    }
    writeGuest(lines)
    cart.value = await preview(lines)
  }

  // note: undefined keeps the current note
  const update = async (item: CartItem, quantity: number, note?: string) => {
    const token = currentToken()
    if (token) {
      const res = await authed<{ updateCartItem: Cart }>(
        `mutation updateCartItem($id: Int!, $qty: Int!, $note: String) { updateCartItem(id: $id, quantity: $qty, note: $note) { ${CART_FIELDS} } }`,
        { id: item.id, qty: quantity, note: note ?? null },
        token,
      )
      cart.value = res.updateCartItem
      return
    }
    const lines = readGuest()
    const line = lines.find(l => sameLine(l, item.product_additional_id, itemKey(item)))
    if (line) {
      line.quantity = quantity
      if (note !== undefined) line.note = note
    }
    writeGuest(lines)
    cart.value = await preview(lines)
  }

  const remove = async (item: CartItem) => {
    const token = currentToken()
    if (token) {
      const res = await authed<{ removeCartItem: Cart }>(
        `mutation removeCartItem($id: Int!) { removeCartItem(id: $id) { ${CART_FIELDS} } }`,
        { id: item.id },
        token,
      )
      cart.value = res.removeCartItem
      return
    }
    const lines = readGuest().filter(l => !sameLine(l, item.product_additional_id, itemKey(item)))
    writeGuest(lines)
    cart.value = await preview(lines)
  }

  return { cart, count, loading, refresh, add, update, remove }
}

// GraphQL errors arrive as "[GQL] Request failed: <message>"
export const cartErrorMessage = (e: any, fallback: string) =>
  String(e?.message || fallback).replace(/^\[GQL\] Request failed:\s*/, '') || fallback
