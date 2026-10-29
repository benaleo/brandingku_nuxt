import type {ColumnDef} from '@tanstack/vue-table'
import {h} from 'vue'
import type {Customer} from '~/types/customer.type'

export const customerColumns: ColumnDef<Customer>[] = [
    {
        accessorKey: 'name',
        header: () => h('div', {class: 'text-left'}, 'Nama'),
        cell: ({row}) => {
            const c = row.original
            const src = !c.avatar ? '' : c.avatar.startsWith('http') ? c.avatar : `${useRuntimeConfig().public.STORAGE_URL}${c.avatar}`
            return h('div', {class: 'flex items-center gap-3 text-left'}, [
                src
                    ? h('img', {src, alt: c.name, loading: 'lazy', class: 'size-9 shrink-0 rounded-full object-cover'})
                    : h('span', {class: 'flex size-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700', 'aria-hidden': 'true'}, (c.name || '?').charAt(0).toUpperCase()),
                h('div', {class: 'min-w-0'}, [
                    h('p', {class: 'font-medium'}, c.name),
                    h('p', {class: 'text-xs text-muted-foreground'}, c.email),
                ]),
            ])
        },
    },
    {
        accessorKey: 'phone',
        header: () => h('div', {class: 'text-left'}, 'Telepon'),
        cell: ({row}) => h('div', {class: 'text-left whitespace-nowrap'}, row.original.phone || '-'),
    },
    {
        accessorKey: 'role',
        header: () => h('div', {class: 'text-left'}, 'Role'),
        cell: ({row}) => h('span', {
            class: `rounded-full px-2 py-0.5 text-xs font-medium ${row.original.role === 'user' ? 'bg-sky-100 text-sky-800' : 'bg-violet-100 text-violet-800'}`,
        }, row.original.role === 'user' ? 'Customer' : row.original.role),
    },
    {
        accessorKey: 'order_count',
        header: () => h('div', {class: 'text-left'}, 'Pesanan'),
        cell: ({row}) => {
            const c = row.original
            return h('div', {class: 'text-left whitespace-nowrap'}, [
                h('span', {class: 'font-medium'}, String(c.order_count)),
                c.open_order_count ? h('span', {class: 'ml-1 text-xs text-amber-700'}, `(${c.open_order_count} berjalan)`) : null,
            ])
        },
    },
    {
        accessorKey: 'last_order_at',
        header: () => h('div', {class: 'text-left'}, 'Pesanan terakhir'),
        cell: ({row}) => h('span', {class: 'whitespace-nowrap'}, row.original.last_order_at ? formatDateTime(row.original.last_order_at) : '-'),
    },
    {
        accessorKey: 'created_at',
        header: () => h('div', {class: 'text-left'}, 'Terdaftar'),
        cell: ({row}) => h('span', {class: 'whitespace-nowrap'}, formatDateTime(row.original.created_at)),
    },
    {
        accessorKey: 'is_active',
        header: () => h('div', {class: 'text-left'}, 'Status'),
        cell: ({row}) => h('span', {
            class: `rounded-full px-2 py-0.5 text-xs font-medium ${row.original.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`,
        }, row.original.is_active ? 'Aktif' : 'Tidak aktif'),
    },
]
