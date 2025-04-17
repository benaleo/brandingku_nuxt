import type {ColumnDef} from '@tanstack/vue-table'
import {h} from "vue";
import {Button} from "~/components/ui/button";

export type ProductCategory = {
    id: string
    created_at: string
    updated_at: string
    created_by: string
    updated_by: string
    name: string
    slug: string
    description: string
}

let index = 1

export const productCategoryColumns: ColumnDef<ProductCategory>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: () => {
            return index++
        }
    },
    {
        accessorKey: 'name',
        header: () => h('div', {class: 'text-left'}, 'Nama'),
        cell: ({row}) => {
            return h('div', {class: 'text-left font-medium'}, row.getValue('name'))
        },
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