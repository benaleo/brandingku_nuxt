import type {ColumnDef} from '@tanstack/vue-table'
import {h} from 'vue'
import GeneralColumnAction from "~/components/datatables/GeneralColumnAction.vue";
import type {ChatSession} from "~/types/chat.type";
import { Badge } from '@/components/ui/badge'

const rowOffsetOf = (table: any): number => Number(table?.options?.meta?.rowOffset ?? 0)

export const chatSessionColumns: ColumnDef<ChatSession>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({row, table}) => {
            return row.index + 1 + rowOffsetOf(table)
        }
    },
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        id: 'contact',
        header: 'Contact',
        cell: ({row, table}) => {
            const data = row.original;
            if (!data.contact_value) return '-'
            return `${data.contact_value}${data.contact_method ? ` (${data.contact_method})` : ''}`
        }
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({row, table}) => {
            const status = row.getValue('status') as string;
            const statusColors: Record<string, string> = {
                'bot': 'bg-blue-100 text-blue-800',
                'human': 'bg-green-100 text-green-800',
            };
            const colorClass = statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
            return h(Badge, {class: colorClass}, status === 'human' ? 'Human' : 'Bot');
        }
    },
    {
        id: 'unread',
        header: 'Unread',
        cell: ({row, table}) => {
            const count = row.original.unread_admin || 0
            if (!count) return '-'
            return h(Badge, {class: 'bg-red-100 text-red-800'}, String(count));
        }
    },
    {
        accessorKey: 'last_message_at',
        header: 'Last Message',
        cell: ({row, table}) => {
            return formatDateTime(row.original.last_message_at)
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({row, table}) => {
            const data = row.original;

            return h('div', {class: 'relative flex items-center gap-2 flex-wrap md:flex-nowrap'}, [
                h(GeneralColumnAction, {
                    data: { id: String(data.id) },
                    isDelete: false,
                    isEdit: false,
                    isView: true,
                    handleDelete: () => {}
                })
            ]);
        }
    },
]
