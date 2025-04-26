import type {ColumnDef} from '@tanstack/vue-table'
import {h} from 'vue'
import DialogViewImage from "~/components/elements/DialogViewImage.vue";
import GeneralColumnAction from "~/components/datatables/GeneralColumnAction.vue";
import ActionBulkImageUpdate from '../elements/ActionBulkImageUpdate.vue';
import type {Product} from "~/types/products.type";



export const productColumns: ColumnDef<Product>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({row}) => {
            return row.index + 1
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
            const handleProductGalleries = table.options.meta?.handleProductGalleries;

            return h('div', {class: 'relative'}, [
                h(GeneralColumnAction, {
                    data,
                    isDelete: true,
                    handleDelete: () => handleDelete?.(data.id)
                }),
                h(ActionBulkImageUpdate, {
                    productId: data.id,
                    galleries: data.galleries,
                    handleUpdate: (fileUrls, removeIds) => handleProductGalleries?.(data.id, fileUrls, removeIds)
                })
            ]);
        }
    },
]