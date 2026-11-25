import { Request, Response } from 'express';
import { Admin } from '../models/Admin';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { authCookieOptions, clearAuthCookie, signToken } from '../middleware/auth';

function publicAdmin(admin: { id: string; name: string; email: string; role: string }) {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  };
}

export const login = asyncHandler(async (req: Request, res: Response) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const password = String(req.body.password || '');
  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin) throw new AppError('Invalid email or password.', 401);

  const matches = await admin.comparePassword(password);
  if (!matches) throw new AppError('Invalid email or password.', 401);

  const token = signToken(String(admin.id), admin.role);
  res.cookie('token', token, authCookieOptions());

  res.json({
    success: true,
    message: 'Signed in.',
    data: {
      admin: publicAdmin({
        id: String(admin.id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      }),
      token,
    },
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Signed out.' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.admin) throw new AppError('Please sign in to continue.', 401);
  res.json({ success: true, data: req.admin });
});
