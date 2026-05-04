export interface Contact {
  id: string;
  name: string;
  phone: string;
  last_message_at: string | null;
  is_online: boolean;
  avatar_url?: string | null;
  last_message_preview?: string | null;
  unread_count?: number;
}

export interface Message {
  id: string;
  contact_id: string;
  content: string;
  direction: "incoming" | "outgoing";
  created_at: string;
  type: "text" | "template";
  status?: "sent" | "delivered" | "read";
  template_name?: string | null;
}

export interface AccountStatus {
  id: string;
  status: "GREEN" | "YELLOW" | "RED";
  updated_at: string;
  reason?: string | null;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  language?: string | null;
  category?: string | null;
}
