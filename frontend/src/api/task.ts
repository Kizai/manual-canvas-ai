import { request } from './request';
import type { ManualTask } from '../types/task';

export async function getTask(taskId: string): Promise<ManualTask> {
  const { data } = await request.get(`/tasks/${taskId}`);
  return data;
}

export async function translateProject(projectId: string, targetLanguage: string, pageIds?: string[]) {
  const { data } = await request.post(`/projects/${projectId}/translate`, { target_language: targetLanguage, page_ids: pageIds });
  return data;
}

export async function qualityCheck(projectId: string, targetLanguage: string, pageIds?: string[]) {
  const { data } = await request.post(`/projects/${projectId}/quality-check`, { target_language: targetLanguage, page_ids: pageIds });
  return data;
}

export async function exportPdf(projectId: string, language: string, pageIds?: string[]) {
  const { data } = await request.post(`/projects/${projectId}/export/pdf`, { language, page_ids: pageIds });
  return data;
}
