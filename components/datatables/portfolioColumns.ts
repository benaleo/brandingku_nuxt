import type {ColumnDef} from '@tanstack/vue-table'
import {h} from 'vue'
import DialogViewImage from "~/components/elements/DialogViewImage.vue";
import GeneralColumnAction from "~/components/datatables/GeneralColumnAction.vue";
import type {Portfolio} from "~/types/portfolio.type";
import { CircleCheck,CircleX } from 'lucide-vue-next';

export const portfolioColumns: ColumnDef<Portfolio>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({row}) => {
            return row.index + 1
        }
    },
    {
        accessorKey: 'title',
        header: 'Title',
    },
    {
        accessorKey: 'category',
        header: 'Category',
    },
    {
        accessorKey: 'client',
        header: 'Client',
        cell: ({row}) => {
            return row.getValue('client') || '-'
        }
    },
    {
        accessorKey: 'galleries',
        header: 'Images',
        cell: ({row}) => {
            const galleries = row.getValue('galleries') as any[];
            const config = useRuntimeConfig();
            const STORAGE_URL = config.public.STORAGE_URL;
            
            if (!galleries || galleries.length === 0) {
                return h('div', {class: 'text-gray-500'}, 'No images');
            }
            
            // Show first image as thumbnail
            const firstImage = galleries[0];
            const src = firstImage?.file || '/images/no-image.jpg';
            
            return h('div', {class: 'flex items-center gap-2'}, [
                h(DialogViewImage, {src: src.startsWith('http') ? src : `${STORAGE_URL}/${src}`, alt: 'Portfolio Image', class: 'w-12 h-12 object-cover rounded'}),
                h('span', {class: 'text-sm text-gray-600'}, `${galleries.length} image${galleries.length > 1 ? 's' : ''}`)
            ]);
        },
    },
    {
        accessorKey: 'is_active',
        header: 'Active',
        cell: ({row}) => {
            return h('div', {class: 'flex items-center justify-center'}, [
                row.getValue('is_active') ?
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

            return h('div', {class: 'relative flex items-center gap-2 flex-wrap md:flex-nowrap'}, [
                h(GeneralColumnAction, {
                    data,
                    isDelete: true,
                    isEdit: true,
                    isView: true,
                    handleDelete: () => handleDelete?.(data.id.toString())
                })
            ]);
        }
    },
]
