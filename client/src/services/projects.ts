import { api } from '@/lib/api';
import type { Category, Pagination, Project } from '@/types';

type ProjectList = {
  success: boolean;
  data: { projects: Project[]; pagination: Pagination };
};

type ProjectResponse = {
  success: boolean;
  message?: string;
  data: Project;
};

export async function getPublishedProjects(params: URLSearchParams) {
  const { data } = await api.get<ProjectList>(`/api/projects?${params.toString()}`);
  return data.data;
}

export async function getPublishedProject(slug: string) {
  const { data } = await api.get<ProjectResponse>(`/api/projects/${slug}`);
  return data.data;
}

export async function getAdminProjects(params: URLSearchParams) {
  const { data } = await api.get<ProjectList>(`/api/admin/projects?${params.toString()}`);
  return data.data;
}

export async function getAdminProject(id: string) {
  const { data } = await api.get<ProjectResponse>(`/api/admin/projects/${id}`);
  return data.data;
}

export async function saveProject(id: string | null, form: FormData, onProgress?: (value: number) => void) {
  const config = {
    onUploadProgress: (event: { loaded: number; total?: number }) => {
      if (!event.total || !onProgress) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    },
  };
  const response = id
    ? await api.put<ProjectResponse>(`/api/admin/projects/${id}`, form, config)
    : await api.post<ProjectResponse>('/api/admin/projects', form, config);
  return response.data;
}

export async function updateProjectStatus(id: string, status: Project['status']) {
  const { data } = await api.patch<ProjectResponse>(`/api/admin/projects/${id}/status`, { status });
  return data;
}

export async function deleteProject(id: string) {
  const { data } = await api.delete<{ success: boolean; message: string }>(`/api/admin/projects/${id}`);
  return data;
}

export async function getCategories() {
  const { data } = await api.get<{ success: boolean; data: Category[] }>('/api/categories');
  return data.data;
}

export async function getAdminCategories() {
  const { data } = await api.get<{ success: boolean; data: Category[] }>('/api/admin/categories');
  return data.data;
}

export async function saveCategory(id: string | null, payload: { name: string; slug?: string }) {
  const response = id
    ? await api.put<{ success: boolean; message: string; data: Category }>(`/api/admin/categories/${id}`, payload)
    : await api.post<{ success: boolean; message: string; data: Category }>('/api/admin/categories', payload);
  return response.data;
}

export async function deleteCategory(id: string) {
  const { data } = await api.delete<{ success: boolean; message: string }>(`/api/admin/categories/${id}`);
  return data;
}
