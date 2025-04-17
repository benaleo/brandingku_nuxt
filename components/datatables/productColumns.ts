import type {ColumnDef, Header, Row} from '@tanstack/vue-table'
import {Button} from '~/components/ui/button'
import {h} from 'vue'

export interface Product {
    id: number
    name: string
    price: number
    stock: number
    createdAt: string
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
            return `${row.original.stock}`
        }
    },
    {
        accessorKey: 'createdAt',
        header: 'Tanggal Dibuat',
        cell: ({row}) => {
            return new Date(row.original.createdAt).toLocaleDateString()
        }
    },
    {
        id: 'actions',
        cell: () => {
            return h(Button, {variant: 'destructive'}, {default: () => 'Hapus'})
        }
    }
]