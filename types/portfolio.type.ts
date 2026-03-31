export interface Portfolio {
  id: number;
  category: string;
  title: string;
  subtitle?: string;
  client?: string;
  galleries: PortfolioGallery[];
  is_active: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioGallery {
  id: number;
  portfolio_id: number;
  file: string;
  created_at: string;
}

export interface PortfolioConnection {
  items: Portfolio[];
  page_info: {
    current_page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
    has_next_page: boolean;
    has_previous_page: boolean;
    start_item: number;
    end_item: number;
  };
}

export interface PortfolioSortInput {
  field?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginationInput {
  page: number;
  limit: number;
}
