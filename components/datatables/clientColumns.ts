import type {ColumnDef} from '@tanstack/vue-table'
import {h} from "vue";
import GeneralColumnAction from "~/components/datatables/GeneralColumnAction.vue";
import DialogViewImage from "~/components/elements/DialogViewImage.vue";
import type {Client} from "~/types/client.type";
// Removed Button import; using simple anchor link for navigation


export const clientColumns: ColumnDef<Client>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({row}) => {
            const index = row.index + 1
            return index
        }
    },
    {
        accessorKey: 'logo',
        header: () => h('div', {class: 'text-center'}, 'Logo'),
        cell: ({row}) => {
            const STORAGE_URL = useRuntimeConfig().public.STORAGE_URL
            const src: string = row.getValue('logo') ? `${STORAGE_URL}${row.getValue('logo')}` : `/images/no-image.jpg`
            return h('div', {class: 'flex items-ceter justify-center overflow-hidden h-16'}, [
                h(DialogViewImage, {src: src, alt: 'Client Logo', class: 'max-h-16 object-cover'})
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
        accessorKey: 'orders',
        header: () => h('div', {class: 'text-left'}, 'Orders'),
        cell: ({row}) => {
            return h('div', {class: 'text-left'}, String(row.getValue('orders')))
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