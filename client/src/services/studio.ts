import { api } from '@/lib/api';
import type { ContactMessage, DashboardStats, Pagination } from '@/types';

export async function getStats() {
  const { data } = await api.get<{ success: boolean; data: DashboardStats }>('/api/admin/stats');
  return data.data;
}

export async function sendContact(payload: {
  name: string;
  email: string;
  company?: string;
  budget?: string;
  message: string;
  website?: string;
}) {
  const { data } = await api.post<{ success: boolean; message: string }>('/api/contact', payload);
  return data;
}

export async function getMessages(page: number) {
  const { data } = await api.get<{
    success: boolean;
    data: { messages: ContactMessage[]; pagination: Pagination };
  }>(`/api/admin/messages?page=${page}&limit=8`);
  return data.data;
}

export async function markMessageRead(id: string) {
  const { data } = await api.patch(`/api/admin/messages/${id}/read`);
  return data;
}

export async function deleteMessage(id: string) {
  const { data } = await api.delete<{ success: boolean; message: string }>(`/api/admin/messages/${id}`);
  return data;
}
