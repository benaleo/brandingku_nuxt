import type {ColumnDef} from '@tanstack/vue-table'
import {h} from 'vue'
import {NuxtLink} from '#components'
import {Badge} from '@/components/ui/badge'
import type {Order} from '~/types/order.type'

export const orderColumns: ColumnDef<Order>[] = [
    {
        accessorKey: 'code',
        header: 'Kode',
        cell: ({row}) => h(NuxtLink, {
            to: `/console/secret/orders/${row.original.id}/detail`,
            class: 'font-medium text-green-700 hover:underline whitespace-nowrap',
        }, () => row.original.code),
    },
    {
        accessorKey: 'customer_name',
        header: 'Customer',
        cell: ({row}) => h('div', {class: 'min-w-0'}, [
            h('div', {class: 'font-medium'}, row.original.customer_name),
            h('div', {class: 'text-xs text-muted-foreground'}, row.original.customer_company || row.original.customer_email),
        ]),
    },
    {
        id: 'items',
        header: 'Produk',
        cell: ({row}) => {
            const items = row.original.items
            const first = items[0] ? `${items[0].product_name} (${items[0].variant_name}) × ${items[0].quantity}` : ''
            return h('div', {class: 'max-w-64 truncate text-sm'}, items.length > 1 ? `${first} +${items.length - 1}` : first)
        },
    },
    {
        id: 'delivery',
        header: 'Kirim',
        cell: ({row}) => row.original.delivery_method === 'pickup' ? 'Ambil' : (row.original.shipping_city || 'Kirim'),
    },
    {
        id: 'total',
        header: 'Total',
        cell: ({row}) => h('span', {class: 'whitespace-nowrap font-medium'},
            formatRupiah(row.original.invoice?.total ?? row.original.subtotal - row.original.discount_total)),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({row}) => {
            const o = row.original
            const pendingProofs = (o.invoice?.payments || []).filter(p => p.status === 'pending').length
            return h('div', {class: 'flex flex-wrap items-center gap-1'}, [
                h(Badge, {class: ORDER_STATUS_STYLE[o.status]}, () => ORDER_STATUS_LABELS[o.status] || o.status),
                pendingProofs ? h(Badge, {class: 'bg-orange-100 text-orange-800'}, () => `${pendingProofs} bukti`) : null,
            ])
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Dibuat',
        cell: ({row}) => h('span', {class: 'whitespace-nowrap'}, formatDateTime(row.original.created_at)),
    },
]
