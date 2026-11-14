import type {ColumnDef} from '@tanstack/vue-table'
import {h} from 'vue'
import DialogViewImage from "~/components/elements/DialogViewImage.vue";
import GeneralColumnAction from "~/components/datatables/GeneralColumnAction.vue";
import ActionBulkImageUpdate from '../elements/ActionBulkImageUpdate.vue';
import type {Product} from "~/types/products.type";
import { CircleCheck,CircleX } from 'lucide-vue-next';



// a clickable on/off badge; the page asks for confirmation and calls the API
const flagCell = (
    key: 'is_highlight' | 'is_active',
    value: unknown,
    product: Product,
    handler?: (product: Product) => void,
) => {
    const enabled = Boolean(value)
    const label = key === 'is_highlight' ? 'highlight' : 'aktif'
    return h('div', {class: 'flex items-center justify-center'}, [
        h('button', {
            type: 'button',
            class: 'rounded-full p-1 transition hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600',
            title: enabled ? `Nonaktifkan ${label}` : `Aktifkan ${label}`,
            'aria-label': enabled ? `Nonaktifkan ${label}` : `Aktifkan ${label}`,
            'aria-pressed': enabled ? 'true' : 'false',
            disabled: !handler,
            onClick: (event: MouseEvent) => {
                event.stopPropagation()
                handler?.(product)
            },
        }, [
            enabled
                ? h(CircleCheck, {class: 'text-green-500'})
                : h(CircleX, {class: 'text-red-500'}),
        ]),
    ])
}

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
            const image = row.getValue('image') as string | undefined
            const src = image ? STORAGE_URL + image : '/images/no-image.jpg'
            return h('div', {class: 'flex items-center justify-start overflow-hidden h-[60px]'}, [
                h(DialogViewImage, {src, alt: 'Product Image', class: 'max-w-[150px] max-h-[60px] object-contain'})
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
        cell: ({row, table}) => {
            return flagCell('is_highlight', row.getValue('is_highlight'), row.original, table.options.meta?.toggleHighlight)
        }
    },
    {
        accessorKey: 'is_active',
        header: 'Active',
        cell: ({row, table}) => {
            return flagCell('is_active', row.getValue('is_active'), row.original, table.options.meta?.toggleActive)
        }
    },
    {
        accessorKey: 'updated_at',
        header: 'Timestamp',
        cell: ({row}) => {
            return formatDateTime(row.original.updated_at)
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
                    handleUpdate: (createdGalleries, removeIds) => handleProductGalleries?.(data.id, createdGalleries, removeIds)
                })
            ]);
        }
    },
]
