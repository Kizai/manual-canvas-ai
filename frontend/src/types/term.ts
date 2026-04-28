export interface Term {
  id: string;
  project_id: string;
  source_term: string;
  target_language: string;
  target_term: string;
  term_type?: string | null;
  description?: string | null;
  confirmed: boolean;
}
