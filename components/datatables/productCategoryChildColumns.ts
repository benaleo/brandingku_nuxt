import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import DialogViewImage from '~/components/elements/DialogViewImage.vue'
import AppConfirmDeleteDialog from '~/components/elements/AppConfirmDeleteDialog.vue'
import type { ProductCategory } from '~/types/products.type'
import GeneralColumnAction from './GeneralColumnAction.vue'

export const productCategoryChildColumns: ColumnDef<ProductCategory>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: 'image',
    header: () => h('div', { class: 'text-left' }, 'Image'),
    cell: ({ row }) => {
      const STORAGE_URL = useRuntimeConfig().public.STORAGE_URL
      const raw: string | null = row.getValue('image')
      const src: string = raw ? `${STORAGE_URL}${raw}` : '/images/no-image.jpg'
      return h('div', { class: 'flex items-ceter justify-center overflow-hidden h-16' }, [
        h(DialogViewImage, { src, alt: 'Child Category Image', class: 'max-h-16 object-cover' }),
      ])
    },
  },
  {
    accessorKey: 'name',
    header: () => h('div', { class: 'text-left' }, 'Nama'),
    cell: ({ row }) => h('div', { class: 'text-left font-medium' }, row.getValue('name')),
  },
  {
    accessorKey: 'updated_at',
    header: 'Timestamp',
    cell: ({ row }) => h('div', { class: 'text-left' }, new Date(row.original.updated_at).toLocaleString()),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row, table }) => {
      const data = row.original;
                  const handleDelete = table.options.meta?.handleDelete;
                  const handleImageUpdate = table.options.meta?.handleImageUpdate;
      
                  return h('div', {class: 'relative flex items-center gap-2'}, [
                      h(GeneralColumnAction, {
                          data,
                          isDelete: true,
                          isView: false,
                          isEdit: true,
                          handleDelete: () => handleDelete?.(data.id)
                      })
                  ]);
    },
  },
]
