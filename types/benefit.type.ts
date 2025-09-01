export type Benefit = {
    id: string
    name: string
    logo: string
    question: string
    answer: string
    orders: number
    is_active: boolean
}

export type BenefitRequest = {
    id?: string
    name: string
    logo: string
    question: string
    answer: string
    orders: number
    is_active: boolean
}