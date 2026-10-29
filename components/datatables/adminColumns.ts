import { h } from 'vue'
import { Pencil, Trash2 } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'
import { Button } from '@/components/ui/button'
import type { AdminUser } from '~/types/access.type'

export const adminColumns = (edit: (user: AdminUser) => void, remove: (user: AdminUser) => void, canEdit: (user: AdminUser) => boolean, canDelete: (user: AdminUser) => boolean): ColumnDef<AdminUser>[] => [
  { accessorKey: 'name', header: 'Nama' },
  { accessorKey: 'email', header: 'Email' },
  { id: 'role', header: 'Role', accessorFn: row => row.role.name },
  { accessorKey: 'is_active', header: 'Status', cell: ({ row }) => row.original.is_active ? 'Aktif' : 'Nonaktif' },
  { id: 'actions', header: 'Aksi', cell: ({ row }) => h('div', { class: 'flex gap-2' }, [
    h(Button, { variant: 'outline', size: 'sm', disabled: !canEdit(row.original), title: canEdit(row.original) ? 'Edit admin' : 'Akun dilindungi atau tidak ada izin edit', onClick: () => edit(row.original) }, () => [h(Pencil, { class: 'size-4' }), 'Edit']),
    h(Button, { variant: 'destructive', size: 'sm', disabled: !canDelete(row.original), title: canDelete(row.original) ? 'Hapus admin (soft delete)' : 'Akun dilindungi atau tidak ada izin hapus', onClick: () => remove(row.original) }, () => [h(Trash2, { class: 'size-4' }), 'Hapus']),
  ]) },
]
