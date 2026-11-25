import { NextFunction, Request, Response } from 'express';

function stripOperators(value: unknown): void {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach(stripOperators);
    return;
  }

  for (const key of Object.keys(value as Record<string, unknown>)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete (value as Record<string, unknown>)[key];
      continue;
    }
    stripOperators((value as Record<string, unknown>)[key]);
  }
}

export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  stripOperators(req.body);
  stripOperators(req.params);
  try {
    stripOperators(req.query);
  } catch {
    // Some Express versions expose query as a getter-only object.
  }
  next();
}

export function requireAjaxHeader(req: Request, res: Response, next: NextFunction): void {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    next();
    return;
  }

  if (req.get('X-Requested-With') !== 'XMLHttpRequest') {
    res.status(403).json({ success: false, message: 'This request was blocked.' });
    return;
  }

  next();
}
