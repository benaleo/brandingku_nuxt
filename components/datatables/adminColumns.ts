import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Button } from '@/components/ui/button'
import type { AdminUser } from '~/types/access.type'

export const adminColumns = (edit: (user: AdminUser) => void, remove: (user: AdminUser) => void, canEdit: (user: AdminUser) => boolean, canDelete: (user: AdminUser) => boolean): ColumnDef<AdminUser>[] => [
  { accessorKey: 'name', header: 'Nama' },
  { accessorKey: 'email', header: 'Email' },
  { id: 'role', header: 'Role', accessorFn: row => row.role.name },
  { accessorKey: 'is_active', header: 'Status', cell: ({ row }) => row.original.is_active ? 'Aktif' : 'Nonaktif' },
  { id: 'actions', header: 'Aksi', cell: ({ row }) => h('div', { class: 'flex gap-2' }, [
    canEdit(row.original) ? h(Button, { variant: 'outline', size: 'sm', onClick: () => edit(row.original) }, () => 'Edit') : null,
    canDelete(row.original) ? h(Button, { variant: 'destructive', size: 'sm', onClick: () => remove(row.original) }, () => 'Hapus') : null,
  ]) },
]
