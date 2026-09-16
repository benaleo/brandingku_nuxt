import '@tanstack/vue-table'
import type { ProductGallery } from '~/types/products.type'

declare module '@tanstack/vue-table' {
  interface TableMeta<TData extends object> {
    handleDelete?: (id: string) => void | Promise<void>
    handleImageUpdate?: (id: string, fileUrl: string, file: File, oldImageUrl?: string) => void | Promise<void>
    handleProductGalleries?: (id: string, createdGalleries: ProductGallery[], removeIds: string[]) => void | Promise<void>
  }
}
