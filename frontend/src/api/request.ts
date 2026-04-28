import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const request = axios.create({
  baseURL: API_BASE_URL,
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('manual_canvas_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
