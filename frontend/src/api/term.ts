import { request } from './request';
import type { Term } from '../types/term';

export async function fetchTerms(projectId: string): Promise<Term[]> {
  const { data } = await request.get(`/projects/${projectId}/terms`);
  return data;
}

export async function createTerm(projectId: string, payload: Omit<Term, 'id' | 'project_id'>): Promise<Term> {
  const { data } = await request.post(`/projects/${projectId}/terms`, payload);
  return data;
}

export async function extractTerms(projectId: string) {
  const { data } = await request.post(`/projects/${projectId}/terms/extract`);
  return data;
}
