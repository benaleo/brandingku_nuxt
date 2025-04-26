import type {ColumnDef} from '@tanstack/vue-table'
import {h} from "vue";
import GeneralColumnAction from "~/components/datatables/GeneralColumnAction.vue";
import ActionImageUpdate from "~/components/elements/ActionImageUpdate.vue";
import DialogViewImage from "~/components/elements/DialogViewImage.vue";
import type {ProductCategory} from "~/types/products.type";


export const productCategoryColumns: ColumnDef<ProductCategory>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({row}) => {
            const index = row.index + 1
            return index
        }
    },
    {
        accessorKey: 'image',
        header: () => h('div', {class: 'text-left'}, 'Image'),
        cell: ({row}) => {
            const src: string = row.getValue('image') ?? '/images/no-image.jpg'
            return h('div', {class: 'flex items-ceter justify-center overflow-hidden h-16'}, [
                h(DialogViewImage, {src: src, alt: 'Product Image', class: 'max-h-16 object-cover'})
            ])
        },
    },
    {
        accessorKey: 'name',
        header: () => h('div', {class: 'text-left'}, 'Nama'),
        cell: ({row}) => {
            return h('div', {class: 'text-left font-medium'}, row.getValue('name'))
        },
    },
    {
        accessorKey: 'sub_categories',
        header: () => h('div', {class: 'text-left'}, 'Sub Categories'),
        cell: ({row}) => {
            const subCategories : string[] = row.getValue('sub_categories') ?? []
            return h('div', {
                class: 'text-left font-medium rounded-md flex items-top flex-wrap space-x-1 space-y-1',
            }, subCategories.map((subCategory: string, index: number) => [
                h('span', {class: 'bg-black text-white px-2 py-1 rounded-md max-h-fit', key: `sub-category-${index}`}, subCategory),
                index < subCategories.length - 1 ? h('span', {class: '', key: `sub-category-comma-${index}`}, '') : null
            ]).flat())
        },
    },
    {
        accessorKey: 'updated_at',
        header: 'Timestamp',
        cell: ({row}) => {
            return h('div', {class: 'text-left'}, new Date(row.original.updated_at).toLocaleString())
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({row, table}) => {
            const data = row.original;
            const handleDelete = table.options.meta?.handleDelete;
            const handleImageUpdate = table.options.meta?.handleImageUpdate;

            return h('div', {class: 'relative'}, [
                h(GeneralColumnAction, {
                    data,
                    isDelete: true,
                    handleDelete: () => handleDelete?.(data.id)
                }),
                h(ActionImageUpdate, {
                    handleUpdate: (fileUrl: string, file: File) => handleImageUpdate?.(data.id, fileUrl, file)
                })
            ]);
        }
    },
]