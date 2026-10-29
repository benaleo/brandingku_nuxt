import type {ColumnDef} from '@tanstack/vue-table'
import {h} from 'vue'
import {NuxtLink} from '#components'
import {Badge} from '@/components/ui/badge'
import GeneralColumnAction from '~/components/datatables/GeneralColumnAction.vue'
import type {Voucher} from '~/types/voucher.type'

const SCOPE_LABELS: Record<string, string> = {all: 'Semua produk', categories: 'Kategori tertentu', products: 'Produk tertentu'}

export const voucherColumns: ColumnDef<Voucher>[] = [
    {
        accessorKey: 'code',
        header: 'Kode',
        cell: ({row}) => h(NuxtLink, {
            to: `/console/secret/vouchers/${row.original.id}/edit`,
            class: 'font-mono font-semibold text-green-700 hover:underline',
        }, () => row.original.code),
    },
    {
        accessorKey: 'name',
        header: 'Nama',
        cell: ({row}) => h('div', {class: 'min-w-0'}, [
            h('div', {class: 'font-medium'}, row.original.name),
            h('div', {class: 'text-xs text-muted-foreground'}, SCOPE_LABELS[row.original.scope] || row.original.scope),
        ]),
    },
    {
        accessorKey: 'value',
        header: 'Potongan',
        cell: ({row}) => h('div', {class: 'whitespace-nowrap'}, [
            h('div', describeVoucherDiscount(row.original)),
            row.original.min_subtotal > 0
                ? h('div', {class: 'text-xs text-muted-foreground'}, `Min. ${formatRupiah(row.original.min_subtotal)}`)
                : null,
        ]),
    },
    {
        accessorKey: 'starts_at',
        header: 'Periode',
        cell: ({row}) => h('span', {class: 'text-sm'}, describeVoucherPeriod(row.original)),
    },
    {
        accessorKey: 'used_count',
        header: 'Pemakaian',
        cell: ({row}) => h('span', {class: 'whitespace-nowrap'},
            row.original.usage_limit > 0 ? `${row.original.used_count} / ${row.original.usage_limit}` : `${row.original.used_count}`),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({row}) => {
            const [label, colorClass] = VOUCHER_STATUS[row.original.status] || [row.original.status, 'bg-gray-100 text-gray-800']
            return h(Badge, {class: colorClass}, () => label)
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({row, table}) => {
            const handleDelete = (table.options.meta as any)?.handleDelete
            return h(GeneralColumnAction, {
                data: {id: String(row.original.id)},
                isDelete: true,
                isEdit: true,
                isView: false,
                handleDelete: () => handleDelete?.(row.original),
            })
        },
    },
]
