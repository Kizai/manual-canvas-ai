import { request } from './request';
import type { Project } from '../types/project';

export async function fetchProjects(): Promise<Project[]> {
  const { data } = await request.get('/projects');
  return data;
}

export async function createProject(payload: Partial<Project> & { name: string }): Promise<Project> {
  const { data } = await request.post('/projects', payload);
  return data;
}

export async function fetchProject(projectId: string): Promise<Project> {
  const { data } = await request.get(`/projects/${projectId}`);
  return data;
}
