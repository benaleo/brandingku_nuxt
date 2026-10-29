// price per piece from min_qty pieces; the tier with the largest min_qty not above the quantity applies
export type BrandingTier = { min_qty: number; price: number }

export type BrandingMethod = {
  id: number
  name: string
  description: string
  is_active: boolean
  orders: number
  created_at?: string
  updated_at?: string
}

export type BrandingMethodInput = { name: string; description: string; is_active: boolean; orders: number }

export type CategoryBrandingPrice = { branding_method_id: number; tiers: BrandingTier[] }

// the price a category's products get: its own or the nearest parent's (category_id null: none)
export type BrandingDefault = { branding_method_id: number; category_id: number | null; category_name: string; tiers: BrandingTier[] }

export type ProductBranding = {
  branding_method_id: number
  name: string
  description: string
  tiers: BrandingTier[]
  // tiers are the product's own price, not the category's
  custom_price: boolean
  is_active: boolean
}

export type ProductBrandingInput = { branding_method_id: number; custom_tiers?: BrandingTier[] }

// a branding chosen for a cart or checkout line, priced at the line's quantity
export type LineBranding = { branding_method_id: number; name: string; unit_price: number; min_qty: number; available: boolean }

export type OrderItemBranding = { branding_method_id: number; name: string; unit_price: number }
