import '@tanstack/vue-table'

declare module '@tanstack/vue-table' {
  interface TableMeta<TData extends object> {
    handleDelete?: (id: string) => void | Promise<void>
  }
}
