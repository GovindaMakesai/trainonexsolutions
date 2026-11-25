import { Router } from 'express';
import { getStats } from '../controllers/dashboardController';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { adminCategoryRouter, categoryRouter } from './categoryRoutes';
import { adminMessageRouter, contactRouter } from './messageRoutes';
import { adminProjectRouter, projectRouter } from './projectRoutes';
import { authRouter } from './authRoutes';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/projects', projectRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/contact', contactRouter);
apiRouter.get('/admin/stats', requireAuth, requireAdmin, getStats);
apiRouter.use('/admin/projects', adminProjectRouter);
apiRouter.use('/admin/categories', adminCategoryRouter);
apiRouter.use('/admin/messages', adminMessageRouter);
