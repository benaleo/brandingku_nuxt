export type Pagination<T> = {
    page: number
    limit: number
    total: number
    data: T[]
}

export type PageInfo = {
  current_page: number
  per_page: number
  total_items: number
  total_pages: number
  has_next_page: boolean
  has_previous_page: boolean
  start_item: number
  end_item: number
}