import { request } from './request';
import type { CanvasElement } from '../types/element';
import type { ManualPage, PageVersion } from '../types/page';

export async function fetchPages(projectId: string): Promise<ManualPage[]> {
  const { data } = await request.get(`/projects/${projectId}/pages`);
  return data;
}

export async function createPage(projectId: string, pageSize = 'A4'): Promise<ManualPage> {
  const { data } = await request.post(`/projects/${projectId}/pages`, { page_size: pageSize });
  return data;
}

export async function savePageElements(pageId: string, elements: CanvasElement[]): Promise<ManualPage> {
  const { data } = await request.put(`/pages/${pageId}/elements`, { elements });
  return data;
}

export async function fetchPageVersion(pageId: string, language: string): Promise<PageVersion> {
  const { data } = await request.get(`/pages/${pageId}/versions/${language}`);
  return data;
}
