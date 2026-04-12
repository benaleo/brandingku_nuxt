import type {ColumnDef} from '@tanstack/vue-table'
import {h} from 'vue'
import GeneralColumnAction from "~/components/datatables/GeneralColumnAction.vue";
import type {Inquiry} from "~/types/inquiry.type";
import { Badge } from '@/components/ui/badge'

export const inquiryColumns: ColumnDef<Inquiry>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({row}) => {
            return row.index + 1
        }
    },
    {
        accessorKey: 'model',
        header: 'Model',
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({row}) => {
            const status = row.getValue('status') as string;
            const statusColors: Record<string, string> = {
                'pending': 'bg-yellow-100 text-yellow-800',
                'read': 'bg-blue-100 text-blue-800',
                'resolved': 'bg-green-100 text-green-800',
                'closed': 'bg-gray-100 text-gray-800',
            };
            const colorClass = statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
            return h(Badge, {class: colorClass}, status);
        }
    },
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: ({row}) => {
            return new Date(row.original.created_at).toLocaleString()
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
