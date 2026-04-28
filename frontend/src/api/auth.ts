import { request } from './request';

export async function login(email: string, password: string) {
  const { data } = await request.post('/auth/login', { email, password });
  localStorage.setItem('manual_canvas_token', data.access_token);
  return data;
}

export async function register(email: string, password: string, nickname?: string) {
  const { data } = await request.post('/auth/register', { email, password, nickname });
  return data;
}
