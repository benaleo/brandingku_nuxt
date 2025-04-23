import type {ColumnDef, Header, Row} from '@tanstack/vue-table'
import {Button} from '~/components/ui/button'
import {h} from 'vue'
import DialogViewImage from "~/components/elements/DialogViewImage.vue";
import GeneralColumnAction from "~/components/datatables/GeneralColumnAction.vue";
import ActionImageUpdate from "~/components/elements/ActionImageUpdate.vue";

export interface Product {
    id: string
    name: string
    slug: string
    description: string
    price: number
    discount: number
    discount_type: string
    quantity: number
    image: string
    highlight_image: string
    highlight_description: string
    is_highlight: boolean
    is_recommended: boolean
    is_upsell: boolean
    category_name: string
    category_id: string
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
        accessorKey: 'image',
        header: () => h('div', {class: 'text-left'}, 'Image'),
        cell: ({row}) => {
            const src: string = row.getValue('image') ?? '/images/no-image.jpg'
            return h('div', {class: 'flex items-ceter justify-start overflow-hidden h-16'}, [
                h(DialogViewImage, {src: src, alt: 'Product Image', class: 'max-h-16 object-cover'})
            ])
        },
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
                    handleUpdate: (fileUrl: string, file: File) => handleImageUpdate?.(data.id, fileUrl, file)
                })
            ]);
        }
    },
]