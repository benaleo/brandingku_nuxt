export type Product = {
    id: string
    name: string
    slug: string
    description: string
    image: string
    highlight_image: string
    highlight_description: string
    is_highlight: boolean
    is_recommended: boolean
    is_upsell: boolean
    category_name: string
    category_id: string
    galleries: ProductGalleriesList[]
    additionals: {
        id: string,
        price: number,
        moq: number,
        stock: number,
        discount: number,
        discount_type: string,
        attributes: {
            id: string
            category: string,
            name: string
        }[]
    }[],
    created_at: string
    created_by: string
    updated_at: string
    updated_by: string
}

export type ProductAdditional = {
    id?: string
    price: number
    moq: number
    stock: number
    discount: number
    discount_type: string
    attributes: ProductAttribute[]
}

export type ProductAttribute = {
    id?: string
    name: string
    category: string
}

export type ProductGalleriesList = {
    id: string
    url: string
}

export type ProductCategory = {
    id: string
    created_at: string
    updated_at: string
    created_by: string
    updated_by: string
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
    sub_categories?: string[]
    is_landing_page: boolean
    is_active: boolean
}