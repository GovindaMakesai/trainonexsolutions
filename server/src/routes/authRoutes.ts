import { Router } from 'express';
import { login, logout, me } from '../controllers/authController';
import { loginLimiter } from '../middleware/rateLimit';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginRules } from '../validators/authValidators';

export const authRouter = Router();

authRouter.post('/login', loginLimiter, loginRules, validate, login);
authRouter.post('/logout', logout);
authRouter.get('/me', requireAuth, requireAdmin, me);
