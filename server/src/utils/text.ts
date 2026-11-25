import { AppError } from './AppError';

export function sanitizeText(value: unknown): string {
  return String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/\u0000/g, '')
    .trim();
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function parseTechnologies(input: unknown): string[] {
  let values: string[] = [];

  if (Array.isArray(input)) {
    values = input.map((item) => String(item));
  } else if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      values = [];
    } else if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (!Array.isArray(parsed)) throw new Error('invalid');
        values = parsed.map((item) => String(item));
      } catch {
        throw new AppError('Technologies must be a list of names.', 422);
      }
    } else {
      values = trimmed.split(',');
    }
  }

  const clean: string[] = [];
  const seen = new Set<string>();

  for (const raw of values) {
    const item = sanitizeText(raw).slice(0, 40);
    if (!item) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    clean.push(item);
    if (clean.length >= 12) break;
  }

  return clean;
}

export function parsePublicIdList(input: unknown): string[] {
  if (input === undefined || input === '') return [];
  if (Array.isArray(input)) return input.map((item) => String(item));
  if (typeof input !== 'string') return [];
  try {
    const parsed = JSON.parse(input) as unknown;
    if (!Array.isArray(parsed)) throw new Error('invalid');
    return parsed.map((item) => String(item));
  } catch {
    throw new AppError('Gallery selection could not be read.', 400);
  }
}
