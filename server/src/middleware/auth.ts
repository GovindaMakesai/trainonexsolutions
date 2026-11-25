import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Admin } from '../models/Admin';
import { AppError } from '../utils/AppError';

type TokenPayload = { id: string; role: string };

export function signToken(id: string, role: string): string {
  return jwt.sign({ id, role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function authCookieOptions() {
  const production = env.nodeEnv === 'production';
  return {
    httpOnly: true,
    secure: production,
    sameSite: (production ? 'none' : 'lax') as 'none' | 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

export function clearAuthCookie(res: Response): void {
  const production = env.nodeEnv === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: production,
    sameSite: production ? 'none' : 'lax',
    path: '/',
  });
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.get('Authorization');
    const bearer = header?.startsWith('Bearer ') ? header.slice(7).trim() : undefined;
    const token = bearer || req.cookies?.token;

    if (!token || typeof token !== 'string') {
      throw new AppError('Please sign in to continue.', 401);
    }

    const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;
    if (!decoded?.id) throw new AppError('Please sign in to continue.', 401);

    const admin = await Admin.findById(decoded.id);
    if (!admin) throw new AppError('Please sign in to continue.', 401);

    req.admin = {
      id: String(admin.id),
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError('Your session has expired. Please sign in again.', 401));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.admin || req.admin.role !== 'admin') {
    next(new AppError('You do not have access to this area.', 403));
    return;
  }
  next();
}
