export type Lead = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string;
  role: string;
  website: string;
  budget: "low" | "medium" | "high" | null;
  intent: "exploring" | "interested" | "urgent" | null;
  source: string | null;
  score: number | null;
  score_reason: string | null;
  stage: "New" | "Contacted" | "Replied" | "Converted";
  email_message: string | null;
  linkedin_message: string | null;
  followup_message: string | null;
  created_at: string;
};

export type LeadPortalPayload = {
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  website: string;
  budget: "low" | "medium" | "high" | "";
  intent: "exploring" | "interested" | "urgent" | "";
};

export type Service = {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  price: number;
  currency: string;
  booking_url: string | null;
  image_path: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ServiceFormPayload = {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  price: number;
  currency: string;
  booking_url: string;
  is_active: boolean;
};

export type PaginatedServices = {
  items: Service[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
};
