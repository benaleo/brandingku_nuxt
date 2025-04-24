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