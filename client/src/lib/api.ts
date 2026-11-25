import axios from 'axios';

const TOKEN_KEY = 'trainonex.admin.token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (!token) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, token);
}

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['X-Requested-With'] = 'XMLHttpRequest';
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status as number | undefined;
    const data = error.response?.data as { message?: string; errors?: { field: string; message: string }[] } | undefined;
    const url = String(error.config?.url || '');
    const message = !error.response
      ? 'We couldn’t reach the server. Check your connection and try again.'
      : data?.message || 'Something went wrong. Please try again.';

    if (status === 401 && !url.includes('/auth/login')) {
      setToken(null);
      onUnauthorized?.();
    }

    return Promise.reject({ message, errors: data?.errors, status });
  },
);
