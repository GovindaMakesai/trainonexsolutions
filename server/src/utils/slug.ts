import { Project } from '../models/Project';
import { Category } from '../models/Category';

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);
}

export async function uniqueProjectSlug(base: string, ignoreId?: string): Promise<string> {
  const root = slugify(base) || 'project';
  let candidate = root;
  let suffix = 2;

  while (await Project.exists({ slug: candidate, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) })) {
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export async function uniqueCategorySlug(base: string, ignoreId?: string): Promise<string> {
  const root = slugify(base) || 'category';
  let candidate = root;
  let suffix = 2;

  while (await Category.exists({ slug: candidate, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) })) {
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
