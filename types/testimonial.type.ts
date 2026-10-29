// landing_page, or product (shown on the page of product_id)
export type TestimonialPlacement = 'landing_page' | 'product'

export type Testimonial = {
    id: string
    name: string
    job: string
    content: string
    // 1 to 5 in half steps
    rating: number
    orders: number
    // a customer's testimonial starts hidden until an admin activates it
    is_active: boolean
    placement: TestimonialPlacement
    product_id: number | null
    product_name: string
    // set when a customer wrote it after a completed order
    order_id: number | null
    // customers choose whether it may be shown; console testimonials always may
    public_consent: boolean
    created_at: string
}

export type TestimonialRequest = {
    id?: string
    name: string
    job: string
    content: string
    rating: number
    orders: number
    is_active: boolean
    placement: TestimonialPlacement
    product_id: number | null
}
