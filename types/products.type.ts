export type Product = {
    id: string
    name: string
    slug: string
    description: string
    image: string
    is_highlight: boolean
    is_recommended: boolean
    is_upsell: boolean
    galleries: ProductGallery[]
    colors?: ProductColor[]
    additionals: {
        id: string,
        name: string,
        price: number,
        moq: number,
        stock: number,
        discount: number,
        discount_type: string,
        attributes: string
    }[],
    created_at: string
    updated_at: string
}

export type ProductAdditional = {
    id?: string
    name: string
    price: number
    moq: number
    stock: number
    discount: number
    discount_type: string
    attributes: string
    // wholesale prices: from min_qty pieces the price per piece is price
    price_tiers?: PriceTier[]
    _uniqueKey?: string
}

export type PriceTier = {
    min_qty: number
    price: number
}

export type ProductColor = {
    id: string
    product_id: number
    name: string
    // storage path; empty means the product's main image is used for this colour
    image: string
    orders: number
}

// one colour card in the product form
export type ProductColorDraft = {
    key: number
    id?: string
    name: string
    // stored path, a preview URL for a newly picked file, or empty
    image: string
    file?: File | null
}

export type ProductGallery = {
    id: string
    product_id: number
    image: string
    orders: number
}

export type ProductCategory = {
    id: string
    created_at: string
    updated_at: string
    name: string
    slug: string
    description: string
    image: string
    cover?: string
    landing_image?: string
    sub_categories: string[]
    is_landing_page: boolean
    is_active: boolean
    parent_id?: number | null
    // downloadable catalog (pdf/word/excel), empty when none
    catalog_file?: string
    catalog_file_name?: string
    catalog_file_size?: number
    // a link elsewhere (e.g. Google Drive) used instead of a file
    catalog_url?: string
}

export type ProductCategoryRequest = {
    name: string
    slug?: string | null
    description: string
    image?: string
    cover?: string
    landing_image?: string
    sub_categories?: string[]
    is_landing_page: boolean
    is_active: boolean
}