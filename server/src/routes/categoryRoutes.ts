import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  listAdminCategories,
  listCategories,
  updateCategory,
} from '../controllers/categoryController';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { categoryIdRule, categoryRules } from '../validators/categoryValidators';

export const categoryRouter = Router();
categoryRouter.get('/', listCategories);

export const adminCategoryRouter = Router();
adminCategoryRouter.use(requireAuth, requireAdmin);
adminCategoryRouter.get('/', listAdminCategories);
adminCategoryRouter.post('/', categoryRules, validate, createCategory);
adminCategoryRouter.put('/:id', categoryIdRule, categoryRules, validate, updateCategory);
adminCategoryRouter.delete('/:id', categoryIdRule, validate, deleteCategory);
