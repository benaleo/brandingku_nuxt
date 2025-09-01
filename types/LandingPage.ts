export type FeaturedCategory = {
    name: string,
    slug: string,
    description: string,
    image: string
}

export type Client = {
    id: string,
    name: string,
    logo: string,
    orders: number
    updated_at: string
}