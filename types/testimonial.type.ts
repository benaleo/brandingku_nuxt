export type Testimonial = {
    id: string
    name: string
    job: string
    content: string
    rating: number
    orders: number
    is_active: boolean
}

export type TestimonialRequest = {
    id?: string
    name: string
    job: string
    content: string
    rating: number
    orders: number
    is_active: boolean
}
