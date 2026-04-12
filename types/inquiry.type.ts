export interface Inquiry {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  model: string;
  status: string;
  created_at: string;
  created_by: string;
}

export interface InquiryConnection {
  items: Inquiry[];
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
