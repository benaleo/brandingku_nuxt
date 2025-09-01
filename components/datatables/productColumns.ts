import type {ColumnDef} from '@tanstack/vue-table'
import {h} from 'vue'
import DialogViewImage from "~/components/elements/DialogViewImage.vue";
import GeneralColumnAction from "~/components/datatables/GeneralColumnAction.vue";
import ActionBulkImageUpdate from '../elements/ActionBulkImageUpdate.vue';
import type {Product} from "~/types/products.type";
import { CircleCheck,CircleX } from 'lucide-vue-next';



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
            const config = useRuntimeConfig();
            const STORAGE_URL = config.public.STORAGE_URL;
            const src: string = row.getValue('image') ?? '/images/no-image.jpg'
            return h('div', {class: 'flex items-ceter justify-start overflow-hidden h-16'}, [
                h(DialogViewImage, {src: STORAGE_URL + src, alt: 'Product Image', class: 'max-h-16 object-cover'})
            ])
        },
    },
    {
        accessorKey: 'name',
        header: 'Nama Produk',
    },
    {
        accessorKey: 'is_highlight',
        header: 'Highlight',
        cell: ({row}) => {
            return h('div', {class: 'flex items-center justify-center'}, [
                row.getValue('is_highlight') ?
                    h(CircleCheck, {class: 'text-green-500'}) :
                    h(CircleX, {class: 'text-red-500'})
            ])
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
            const handleProductGalleries = table.options.meta?.handleProductGalleries;

            return h('div', {class: 'relative flex items-center gap-2 flex-wrap md:flex-nowrap'}, [
                h(GeneralColumnAction, {
                    data,
                    isDelete: true,
                    isEdit: true,
                    isView: true,
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