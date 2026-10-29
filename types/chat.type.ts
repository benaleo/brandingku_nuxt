export interface ChatMessage {
  id: number;
  chat_session_id: number;
  sender_type: "guest" | "user" | "bot" | "admin";
  sender_id: number | null;
  sender_name: string;
  message: string;
  created_at: string;
}

export interface ChatSession {
  id: number;
  guest_id: string | null;
  user_id: number | null;
  name: string;
  contact_method: string | null;
  contact_value: string | null;
  lang: string;
  stage: string;
  status: "bot" | "human";
  assigned_admin_id: number | null;
  last_message_at: string;
  unread_admin: number;
  unread_guest: number;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
}

export interface ChatSessionConnection {
  items: ChatSession[];
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
