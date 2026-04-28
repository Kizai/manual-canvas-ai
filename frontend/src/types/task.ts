export interface ManualTask {
  id: string;
  project_id?: string | null;
  task_type: string;
  status: string;
  progress: number;
  input_json?: Record<string, unknown> | null;
  output_json?: Record<string, unknown> | null;
  error_message?: string | null;
}
