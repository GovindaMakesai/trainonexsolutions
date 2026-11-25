import { Router } from 'express';
import { createMessage, deleteMessage, listMessages, markMessageRead } from '../controllers/contactController';
import { contactLimiter } from '../middleware/rateLimit';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idRule } from '../validators/projectValidators';
import { contactRules } from '../validators/contactValidators';

export const contactRouter = Router();
contactRouter.post('/', contactLimiter, contactRules, validate, createMessage);

export const adminMessageRouter = Router();
adminMessageRouter.use(requireAuth, requireAdmin);
adminMessageRouter.get('/', listMessages);
adminMessageRouter.patch('/:id/read', idRule, validate, markMessageRead);
adminMessageRouter.delete('/:id', idRule, validate, deleteMessage);
