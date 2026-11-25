import { api, setToken } from '@/lib/api';
import type { AdminUser } from '@/types';

type LoginResponse = {
  success: boolean;
  message: string;
  data: { admin: AdminUser; token: string };
};

export async function login(email: string, password: string) {
  const { data } = await api.post<LoginResponse>('/api/auth/login', { email, password });
  setToken(data.data.token);
  return data.data.admin;
}

export async function logout() {
  try {
    await api.post('/api/auth/logout');
  } finally {
    setToken(null);
  }
}

export async function fetchMe() {
  const { data } = await api.get<{ success: boolean; data: AdminUser }>('/api/auth/me');
  return data.data;
}
