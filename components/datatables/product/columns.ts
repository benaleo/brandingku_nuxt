import type { ColumnDef } from '@tanstack/vue-table'
import { Button } from '@/components/ui/button'

export interface Product {
  id: number
  name: string
  price: number
  stock: number
  createdAt: string
}

export const productColumns: ColumnDef<Product>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Nama Produk',
  },
  {
    accessorKey: 'price',
    header: 'Harga',
    cell: ({ row }) => {
      return `Rp${row.original.price.toLocaleString()}`
    }
  },
  {
    accessorKey: 'stock',
    header: 'Stok',
  },
  {
    accessorKey: 'createdAt',
    header: 'Tanggal Dibuat',
    cell: ({ row }) => {
      return new Date(row.original.createdAt).toLocaleDateString()
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return h(Button, {
        variant: 'ghost',
        onClick: () => {
          // Handle action
        }
      }, 'Edit')
    }
  }
]
