import type {ColumnDef} from '@tanstack/vue-table'
import {h} from "vue";
import GeneralColumnAction from "~/components/datatables/GeneralColumnAction.vue";
import type {Testimonial} from "~/types/testimonial.type";
// Removed Button import; using simple anchor link for navigation

export const testimonialColumns: ColumnDef<Testimonial>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({row}) => {
            const index = row.index + 1
            return index
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
        accessorKey: 'job',
        header: () => h('div', {class: 'text-left'}, 'Pekerjaan'),
        cell: ({row}) => {
            return h('div', {class: 'text-left'}, row.getValue('job'))
        },
    },
    {
        accessorKey: 'content',
        header: () => h('div', {class: 'text-left'}, 'Konten'),
        cell: ({row}) => {
            const content = row.getValue('content') as string
            return h('div', {class: 'text-left max-w-[300px] truncate'}, content)
        },
    },
    {
        accessorKey: 'rating',
        header: () => h('div', {class: 'text-left'}, 'Rating'),
        cell: ({row}) => {
            const rating = row.getValue('rating') as number
            return h('div', {class: 'text-left flex items-center gap-1'}, [
                h('span', {}, String(rating)),
                h('span', {class: 'text-yellow-500'}, '★'.repeat(rating))
            ])
        },
    },
    {
        accessorKey: 'orders',
        header: () => h('div', {class: 'text-left'}, 'Urutan'),
        cell: ({row}) => {
            return h('div', {class: 'text-left'}, String(row.getValue('orders')))
        },
    },
    {
        accessorKey: 'is_active',
        header: () => h('div', {class: 'text-left'}, 'Status'),
        cell: ({row}) => {
            const isActive = row.getValue('is_active') as boolean
            return h('div', {class: 'text-left'}, [
                h('span', {
                    class: `px-2 py-1 rounded-full text-xs font-medium ${
                        isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }`
                }, isActive ? 'Aktif' : 'Tidak Aktif')
            ])
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({row, table}) => {
            const data = row.original;
            const handleDelete = table.options.meta?.handleDelete;

            return h('div', {class: 'relative flex items-center gap-2'}, [
                h(GeneralColumnAction, {
                    data,
                    isDelete: true,
                    isView: true,
                    isEdit: true,
                    handleDelete: () => handleDelete?.(data.id)
                }),
            ]);
        }
    },
]
