import type { CanvasElement } from './element';

export interface ManualPage {
  id: string;
  project_id: string;
  page_no: number;
  width: number;
  height: number;
  unit: string;
  background_color: string;
  elements_json: CanvasElement[];
}

export interface PageVersion {
  id: string;
  page_id: string;
  project_id: string;
  language: string;
  elements_json: CanvasElement[];
  status: string;
}
