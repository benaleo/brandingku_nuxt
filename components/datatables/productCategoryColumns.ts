import type {ColumnDef} from '@tanstack/vue-table'
import {h} from "vue";
import GeneralColumnAction from "~/components/datatables/GeneralColumnAction.vue";
import ActionImageUpdate from "~/components/elements/ActionImageUpdate.vue";
import DialogViewImage from "~/components/elements/DialogViewImage.vue";

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

let indexRef = 1

export const productCategoryColumns: ColumnDef<ProductCategory>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: () => {
            return indexRef++
        }
    },
    {
        accessorKey: 'image',
        header: () => h('div', {class: 'text-left'}, 'Image'),
        cell: ({row}) => {
            const src: string = row.getValue('image') ?? '/images/no-image.jpg'
            return h('div', {class: 'flex items-ceter justify-center overflow-hidden h-16'}, [
                h(DialogViewImage, {src: src, alt: 'Product Image', class: 'max-h-16 object-cover'})
            ])
        },
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
        header: 'Timestamp',
        cell: ({row}) => {
            return new Date(row.original.updated_at).toLocaleString()
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({row, table}) => {
            const data = row.original;
            const handleDelete = table.options.meta?.handleDelete;
            const handleImageUpdate = table.options.meta?.handleImageUpdate;

            return h('div', {class: 'relative'}, [
                h(GeneralColumnAction, {
                    data,
                    isDelete: true,
                    handleDelete: () => handleDelete?.(data.id)
                }),
                h(ActionImageUpdate, {
                    handleUpdate: (file: File) => handleImageUpdate?.(data.id, file)
                })
            ]);
        }
    },
]