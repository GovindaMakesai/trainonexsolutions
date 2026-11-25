import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { Project } from '../models/Project';
import { ContactMessage } from '../models/ContactMessage';
import { asyncHandler } from '../utils/asyncHandler';

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalProjects, publishedProjects, draftProjects, categories, unreadMessages, recentProjects] =
    await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: 'published' }),
      Project.countDocuments({ status: 'draft' }),
      Category.countDocuments(),
      ContactMessage.countDocuments({ read: false }),
      Project.find().sort({ updatedAt: -1 }).limit(5).populate('category', 'name slug'),
    ]);

  res.json({
    success: true,
    data: {
      totalProjects,
      publishedProjects,
      draftProjects,
      categories,
      unreadMessages,
      recentProjects,
    },
  });
});
