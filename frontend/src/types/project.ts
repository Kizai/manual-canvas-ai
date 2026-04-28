export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  source_language: string;
  target_languages: string[];
  default_page_size: string;
  created_at: string;
  updated_at: string;
}
