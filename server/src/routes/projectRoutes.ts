import { Router } from 'express';
import {
  createProject,
  deleteProject,
  getAdminProject,
  getPublishedProject,
  listAdminProjects,
  listPublishedProjects,
  updateProject,
  updateProjectStatus,
} from '../controllers/projectController';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { handleProjectUpload } from '../middleware/upload';
import { validate } from '../middleware/validate';
import { idRule, projectRules, statusRules } from '../validators/projectValidators';

export const projectRouter = Router();
projectRouter.get('/', listPublishedProjects);
projectRouter.get('/:slug', getPublishedProject);

export const adminProjectRouter = Router();
adminProjectRouter.use(requireAuth, requireAdmin);
adminProjectRouter.get('/', listAdminProjects);
adminProjectRouter.post('/', handleProjectUpload, projectRules, validate, createProject);
adminProjectRouter.get('/:id', idRule, validate, getAdminProject);
adminProjectRouter.put('/:id', handleProjectUpload, idRule, projectRules, validate, updateProject);
adminProjectRouter.patch('/:id/status', statusRules, validate, updateProjectStatus);
adminProjectRouter.delete('/:id', idRule, validate, deleteProject);
