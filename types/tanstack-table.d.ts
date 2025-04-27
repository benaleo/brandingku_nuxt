import '@tanstack/vue-table'

declare module '@tanstack/vue-table' {
  interface TableMeta<TData extends object> {
    handleDelete?: (id: string) => void | Promise<void>
    handleImageUpdate?: (id: string, fileUrl: string, file: File, oldImageUrl?: string) => void | Promise<void>
    handleProductGalleries?: (ids: string, fileUrl: string[], removeIds: string[]) => void | Promise<void>
  }
}