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
}

export type ProductGallery = {
    id: string
    product_id: string
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
    sub_categories: string[]
    is_landing_page: boolean
    is_active: boolean
    parent_id?: number | null
}

export type ProductCategoryRequest = {
    name: string
    slug?: string | null
    description: string
    image?: string
    sub_categories?: string[]
    is_landing_page: boolean
    is_active: boolean
}