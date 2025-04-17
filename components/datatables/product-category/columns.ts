import type { ColumnDef } from '@tanstack/vue-table'

export type ProductCategory = {
    id: string
    name: string
}

export const productCategoryColumns: ColumnDef<ProductCategory>[] = [
    {
        accessorKey: 'id',
        header: () => h('div', { class: 'text-right' }, 'Id'),
        cell: ({ row }) => {
            return h('div', { class: 'text-right font-medium' }, row.getValue('id'))
        },
    },
    {
        accessorKey: 'name',
        header: () => h('div', { class: 'text-left' }, 'Name'),
        cell: ({ row }) => {
            return h('div', { class: 'text-left font-medium' }, row.getValue('name'))
        },
    },
]