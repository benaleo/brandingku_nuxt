import type {ColumnDef, Header, Row} from '@tanstack/vue-table'
import {Button} from '~/components/ui/button'
import {h} from 'vue'

export interface Product {
    id: string
    name: string
    slug: string
    description: string
    price: number
    discount: number
    discount_type: string
    quantity: number
    thumbnail: string
    is_recommended: boolean
    is_upsell: boolean
    category_name: string
    created_at: string
    created_by: string
    updated_at: string
    updated_by: string
}

let index = 1

export const productColumns: ColumnDef<Product>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: () => {
            return index++
        }
    },
    {
        accessorKey: 'name',
        header: 'Nama Produk',
    },
    {
        accessorKey: 'price',
        header: 'Harga',
        cell: ({row}) => {
            return `Rp${row.original.price.toLocaleString()}`
        }
    },
    {
        accessorKey: 'stock',
        header: 'Stok',
        cell: ({row}) => {
            return `${row.original.quantity}`
        }
    },
    {
        accessorKey: 'update_at',
        header: 'Waktu Dibuat',
        cell: ({row}) => {
            return new Date(row.original.updated_at).toLocaleString()
        }
    },
    {
        id: 'actions',
        cell: () => {
            return h(Button, {variant: 'destructive'}, {default: () => 'Hapus'})
        }
    }
]