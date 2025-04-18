import type {ColumnDef} from '@tanstack/vue-table'
import {h} from "vue";
import GeneralColumnAction from "~/components/datatables/GeneralColumnAction.vue";

// Remove unused TableMeta augmentation to resolve TS error


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
        accessorKey: 'updated_at',
        header: 'Waktu Dibuat',
        cell: ({row}) => {
            return new Date(row.original.updated_at).toLocaleString()
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({row, table}) => {
            // Get handleDelete from table meta (provided by parent component)
            const data = row.original;
            const handleDelete = table.options.meta?.handleDelete;
            
            return h('div', {class: 'relative'}, h(GeneralColumnAction, {
                data,
                isDelete: true,
                handleDelete: () => handleDelete?.(data.id)
            }));
        }
    },
]