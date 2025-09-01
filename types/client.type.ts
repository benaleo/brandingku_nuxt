export type Client = {
    id: string
    name: string
    logo: string
    orders: number
    is_active: boolean
}

export type ClientRequest = {
    id?: string
    name: string
    logo: string
    orders: number
    is_active: boolean
}