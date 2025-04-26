import type { ColumnDef } from '@tanstack/vue-table'
import { h } from "vue";
import GeneralColumnAction from "~/components/datatables/GeneralColumnAction.vue";
import ActionImageUpdate from "~/components/elements/ActionImageUpdate.vue";

export type ProductAttribute = {
    id: string
    created_at: string
    updated_at: string
    created_by: string
    updated_by: string
    name: string
    category: string
    is_active: boolean
}


export const productAttributeColumns: ColumnDef<ProductAttribute>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({row}) => {
            return row.index + 1
        }
    },
    {
        accessorKey: 'category',
        header: () => h('div', { class: 'text-left' }, 'Kategori'),
        cell: ({ row }) => {
            return h('div', { class: 'text-left font-medium' }, row.getValue('category'))
        },
    },
    {
        accessorKey: 'name',
        header: () => h('div', { class: 'text-left' }, 'Nama'),
        cell: ({ row }) => {
            return h('div', { class: 'text-left font-medium' }, row.getValue('name'))
        },
    },
    {
        accessorKey: 'is_active',
        header: () => h('div', { class: 'text-left' }, 'Status'),
        cell: ({ row }) => {
            return h('div', { class: 'text-left font-medium' }, row.getValue('is_active') ? 'Active' : 'Inactive')
        },
    },
    {
        accessorKey: 'updated_at',
        header: 'Timestamp',
        cell: ({ row }) => {
            return new Date(row.original.updated_at).toLocaleString()
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row, table }) => {
            const data = row.original;
            const handleDelete = table.options.meta?.handleDelete;

            return h('div', { class: 'relative' }, [
                h(GeneralColumnAction, {
                    data,
                    isDelete: true,
                    handleDelete: () => handleDelete?.(data.id)
                })
            ]);
        }
    },
]