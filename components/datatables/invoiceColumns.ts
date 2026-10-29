import type {ColumnDef} from '@tanstack/vue-table'
import {h} from 'vue'
import {NuxtLink} from '#components'
import {Badge} from '@/components/ui/badge'
import GeneralColumnAction from '~/components/datatables/GeneralColumnAction.vue'
import type {Invoice} from '~/types/invoice.type'

export const invoiceColumns: ColumnDef<Invoice>[] = [
    {
        accessorKey: 'number',
        header: 'Nomor',
        cell: ({row}) => h(NuxtLink, {
            to: `/console/secret/invoices/${row.original.id}/detail`,
            class: 'font-medium text-green-700 hover:underline whitespace-nowrap',
        }, () => row.original.number),
    },
    {
        accessorKey: 'type',
        header: 'Tipe',
        cell: ({row}) => INVOICE_TYPE_LABELS[row.original.type] || row.original.type,
    },
    {
        accessorKey: 'customer_name',
        header: 'Customer',
        cell: ({row}) => h('div', {class: 'min-w-0'}, [
            h('div', {class: 'font-medium'}, row.original.customer_name),
            row.original.customer_company ? h('div', {class: 'text-xs text-muted-foreground'}, row.original.customer_company) : null,
        ]),
    },
    {
        accessorKey: 'issue_date',
        header: 'Tanggal',
        cell: ({row}) => h('span', {class: 'whitespace-nowrap'}, formatInvoiceDate(row.original.issue_date)),
    },
    {
        accessorKey: 'due_date',
        header: 'Jatuh tempo',
        cell: ({row}) => isBillableType(row.original.type)
            ? h('span', {class: 'whitespace-nowrap'}, formatInvoiceDate(row.original.due_date))
            : '-',
    },
    {
        accessorKey: 'amount_due',
        header: 'Tagihan',
        cell: ({row}) => h('span', {class: 'whitespace-nowrap font-medium'}, formatRupiah(row.original.amount_due)),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({row}) => {
            const [label, colorClass] = INVOICE_STATUS[row.original.status] || [row.original.status, 'bg-gray-100 text-gray-800']
            return h(Badge, {class: colorClass}, () => label)
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({row}) => h(GeneralColumnAction, {
            data: {id: String(row.original.id)},
            isDelete: false,
            isEdit: false,
            isView: true,
            handleDelete: () => {},
        }),
    },
]
