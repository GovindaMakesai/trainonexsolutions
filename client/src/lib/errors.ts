import type { ApiFailure, Category, Project } from '@/types';

export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string' && error.message) {
    return error.message;
  }
  return fallback;
}

export function getFieldErrors(error: unknown): ApiFailure['errors'] {
  if (typeof error === 'object' && error && 'errors' in error && Array.isArray(error.errors)) {
    return error.errors as ApiFailure['errors'];
  }
  return undefined;
}

export function categoryOf(project: Project): Category | null {
  return typeof project.category === 'string' ? null : project.category;
}

export function isHttpUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
