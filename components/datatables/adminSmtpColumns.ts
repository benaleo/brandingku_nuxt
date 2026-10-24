import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import GeneralColumnAction from '~/components/datatables/GeneralColumnAction.vue'
import type { AdminSmtp } from '~/types/admin-smtp.type'

export const adminSmtpColumns: ColumnDef<AdminSmtp>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => h('div', { class: 'min-w-0' }, [
            h('div', { class: 'font-medium' }, row.original.email),
            row.original.sender_name ? h('div', { class: 'text-xs text-muted-foreground' }, row.original.sender_name) : null,
        ]),
    },
    {
        accessorKey: 'host',
        header: 'Server',
        cell: ({ row }) => h('div', {}, [
            h('div', {}, `${row.original.host}:${row.original.port}`),
            h('div', { class: 'text-xs text-muted-foreground' }, [row.original.provider, row.original.branch].filter(Boolean).join(' · ')),
        ]),
    },
    {
        accessorKey: 'available_today',
        header: 'Kuota hari ini',
        cell: ({ row }) => {
            const { available_today: left, quota } = row.original
            const pct = quota > 0 ? Math.round((left / quota) * 100) : 0
            return h('div', { class: 'min-w-28' }, [
                h('div', { class: 'text-sm' }, `${left} / ${quota}`),
                h('div', { class: 'mt-1 h-1.5 w-full rounded-full bg-muted' }, [
                    h('div', { class: 'h-1.5 rounded-full', style: { width: `${pct}%`, backgroundColor: pct > 20 ? '#22c55e' : '#ef4444' } }),
                ]),
            ])
        },
    },
    {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => h('span', {
            class: `rounded-full px-2 py-0.5 text-xs font-medium ${row.original.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`,
        }, row.original.is_active ? 'Aktif' : 'Nonaktif'),
    },
    {
        accessorKey: 'updated_at',
        header: 'Timestamp',
        cell: ({ row }) => formatDateTime(row.original.updated_at),
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row, table }) => {
            const data = row.original
            const handleDelete = table.options.meta?.handleDelete
            return h(GeneralColumnAction, {
                data: { ...data, id: String(data.id) },
                isDelete: true,
                isEdit: true,
                isView: true,
                handleDelete: () => handleDelete?.(String(data.id)),
            })
        },
    },
]
