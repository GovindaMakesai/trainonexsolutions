import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { Project } from '../models/Project';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { escapeRegex, sanitizeText } from '../utils/text';
import { slugify, uniqueCategorySlug } from '../utils/slug';

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ success: true, data: categories });
});

export const listAdminCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.aggregate([
    {
      $lookup: {
        from: 'projects',
        localField: '_id',
        foreignField: 'category',
        as: 'projects',
      },
    },
    { $addFields: { projectCount: { $size: '$projects' } } },
    { $project: { projects: 0 } },
    { $sort: { name: 1 } },
  ]);

  res.json({ success: true, data: categories });
});

async function assertUniqueName(name: string, ignoreId?: string) {
  const existing = await Category.findOne({
    name: new RegExp(`^${escapeRegex(name)}$`, 'i'),
    ...(ignoreId ? { _id: { $ne: ignoreId } } : {}),
  });
  if (existing) throw new AppError('A category with that name already exists.', 409);
}

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const name = sanitizeText(req.body.name);
  await assertUniqueName(name);
  const slug = req.body.slug ? slugify(sanitizeText(req.body.slug)) : await uniqueCategorySlug(name);
  if (!slug) throw new AppError('Enter a valid category slug.', 422);

  const taken = await Category.exists({ slug });
  if (taken) throw new AppError('That slug is already in use.', 409);

  const category = await Category.create({ name, slug });
  res.status(201).json({ success: true, message: 'Category created.', data: category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found.', 404);

  const name = sanitizeText(req.body.name);
  await assertUniqueName(name, String(category.id));

  const slug = req.body.slug ? slugify(sanitizeText(req.body.slug)) : await uniqueCategorySlug(name, String(category.id));
  if (!slug) throw new AppError('Enter a valid category slug.', 422);

  const taken = await Category.exists({ slug, _id: { $ne: category.id } });
  if (taken) throw new AppError('That slug is already in use.', 409);

  category.name = name;
  category.slug = slug;
  await category.save();

  res.json({ success: true, message: 'Category updated.', data: category });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found.', 404);

  const projectCount = await Project.countDocuments({ category: category.id });
  if (projectCount > 0) {
    throw new AppError('Move or delete the projects in this category before removing it.', 409);
  }

  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted.' });
});
