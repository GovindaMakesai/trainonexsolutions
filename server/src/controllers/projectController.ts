import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { IImageAsset, Project } from '../models/Project';
import { getProjectFiles } from '../middleware/upload';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { deleteImage, uploadImage } from '../utils/images';
import { getPagination, paginationMeta } from '../utils/pagination';
import { slugify, uniqueProjectSlug } from '../utils/slug';
import { escapeRegex, parsePublicIdList, parseTechnologies, sanitizeText } from '../utils/text';

const categoryPopulate = { path: 'category', select: 'name slug' };

async function resolveSlug(title: string, requested: string, ignoreId?: string) {
  if (!requested) return uniqueProjectSlug(title, ignoreId);
  const slug = slugify(requested);
  if (!slug) throw new AppError('Enter a valid slug.', 422);
  const taken = await Project.exists({ slug, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) });
  if (taken) throw new AppError('That slug is already in use.', 409);
  return slug;
}

async function assertCategory(id: string) {
  const category = await Category.findById(id);
  if (!category) throw new AppError('Choose a valid category.', 422);
  return category;
}

async function storeUploads(files: Express.Multer.File[]): Promise<IImageAsset[]> {
  const stored: IImageAsset[] = [];
  try {
    for (const file of files) {
      stored.push(await uploadImage(file.buffer, file.mimetype));
    }
    return stored;
  } catch (error) {
    await Promise.all(stored.map((image) => deleteImage(image.publicId)));
    throw error;
  }
}

async function cleanup(images: IImageAsset[]) {
  await Promise.all(images.map((image) => deleteImage(image.publicId)));
}

export const listPublishedProjects = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req.query, 9);
  const filter: Record<string, unknown> = { status: 'published' };
  const categorySlug = typeof req.query.category === 'string' ? req.query.category : '';

  if (categorySlug) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(categorySlug)) {
      res.json({
        success: true,
        data: { projects: [], pagination: paginationMeta(1, limit, 0) },
      });
      return;
    }
    const category = await Category.findOne({ slug: categorySlug });
    if (!category) {
      res.json({
        success: true,
        data: { projects: [], pagination: paginationMeta(1, limit, 0) },
      });
      return;
    }
    filter.category = category.id;
  }

  const [projects, total] = await Promise.all([
    Project.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate(categoryPopulate),
    Project.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { projects, pagination: paginationMeta(page, limit, total) },
  });
});

export const getPublishedProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findOne({ slug: req.params.slug, status: 'published' }).populate(categoryPopulate);
  if (!project) throw new AppError('Project not found.', 404);
  res.json({ success: true, data: project });
});

export const listAdminProjects = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req.query, 8);
  const filter: Record<string, unknown> = {};
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

  if (status === 'draft' || status === 'published') filter.status = status;
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: pattern }, { shortDescription: pattern }, { slug: pattern }];
  }

  const [projects, total] = await Promise.all([
    Project.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).populate(categoryPopulate),
    Project.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { projects, pagination: paginationMeta(page, limit, total) },
  });
});

export const getAdminProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id).populate(categoryPopulate);
  if (!project) throw new AppError('Project not found.', 404);
  res.json({ success: true, data: project });
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const title = sanitizeText(req.body.title);
  const shortDescription = sanitizeText(req.body.shortDescription);
  const description = sanitizeText(req.body.description);
  const status = req.body.status === 'published' ? 'published' : 'draft';
  const technologies = parseTechnologies(req.body.technologies);
  const projectUrl = sanitizeText(req.body.projectUrl);
  const githubUrl = sanitizeText(req.body.githubUrl);

  await assertCategory(String(req.body.category));
  const slug = await resolveSlug(title, sanitizeText(req.body.slug));
  const files = getProjectFiles(req);
  const uploaded: IImageAsset[] = [];
    let createdId = '';

    try {
      let thumbnail: IImageAsset | undefined;
      if (files.thumbnail?.[0]) {
        thumbnail = await uploadImage(files.thumbnail[0].buffer, files.thumbnail[0].mimetype);
        uploaded.push(thumbnail);
      }

      const gallery = await storeUploads(files.gallery || []);
      uploaded.push(...gallery);

      if (gallery.length > 8) {
        throw new AppError('Gallery is limited to 8 images.', 422);
      }
      if (description.length < 20) {
        throw new AppError('Case study must be at least 20 characters.', 422, [
          { field: 'description', message: 'Case study must be at least 20 characters.' },
        ]);
      }
      if (status === 'published' && !thumbnail) {
        throw new AppError('Add a thumbnail before publishing.', 422, [
          { field: 'thumbnail', message: 'Add a thumbnail before publishing.' },
        ]);
      }

      const project = await Project.create({
        title,
        slug,
        shortDescription,
        description,
        thumbnail,
        gallery,
        category: req.body.category,
        technologies,
        projectUrl: projectUrl || undefined,
        githubUrl: githubUrl || undefined,
        status,
      });
      createdId = String(project.id);

      await project.populate(categoryPopulate);
      res.status(201).json({ success: true, message: 'Project created.', data: project });
    } catch (error) {
      if (createdId) await Project.findByIdAndDelete(createdId);
      await cleanup(uploaded);
      throw error;
    }
  });

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new AppError('Project not found.', 404);

  const title = sanitizeText(req.body.title);
  const shortDescription = sanitizeText(req.body.shortDescription);
  const description = sanitizeText(req.body.description);
  const status = req.body.status === 'published' ? 'published' : 'draft';
  const technologies = parseTechnologies(req.body.technologies);
  const projectUrl = sanitizeText(req.body.projectUrl);
  const githubUrl = sanitizeText(req.body.githubUrl);
  const slug = await resolveSlug(title, sanitizeText(req.body.slug), String(project.id));

  await assertCategory(String(req.body.category));

  const files = getProjectFiles(req);
  const uploaded: IImageAsset[] = [];
  const removed: IImageAsset[] = [];

  try {
    let thumbnail = project.thumbnail;
    if (files.thumbnail?.[0]) {
      const nextThumb = await uploadImage(files.thumbnail[0].buffer, files.thumbnail[0].mimetype);
      uploaded.push(nextThumb);
      if (thumbnail?.publicId) removed.push(thumbnail);
      thumbnail = nextThumb;
    } else if (req.body.removeThumbnail === 'true' && thumbnail) {
      removed.push(thumbnail);
      thumbnail = undefined;
    }

    const galleryWasSent = req.body.keepGallery !== undefined && req.body.keepGallery !== '';
    const keep = new Set(galleryWasSent ? parsePublicIdList(req.body.keepGallery) : project.gallery.map((image) => image.publicId));
    const keptGallery = project.gallery.filter((image) => keep.has(image.publicId));
    removed.push(...project.gallery.filter((image) => !keep.has(image.publicId)));

    const addedGallery = await storeUploads(files.gallery || []);
    uploaded.push(...addedGallery);
    const gallery = [...keptGallery, ...addedGallery];

    if (gallery.length > 8) throw new AppError('Gallery is limited to 8 images.', 422);
    if (description.length < 20) {
      throw new AppError('Case study must be at least 20 characters.', 422, [
        { field: 'description', message: 'Case study must be at least 20 characters.' },
      ]);
    }
    if (status === 'published' && !thumbnail?.url) {
      throw new AppError('Add a thumbnail before publishing.', 422, [
        { field: 'thumbnail', message: 'Add a thumbnail before publishing.' },
      ]);
    }

    project.title = title;
    project.slug = slug;
    project.shortDescription = shortDescription;
    project.description = description;
    project.category = req.body.category;
    project.technologies = technologies;
    project.projectUrl = projectUrl || undefined;
    project.githubUrl = githubUrl || undefined;
    project.status = status;
    project.thumbnail = thumbnail;
    project.gallery = gallery;
    await project.save();
    await Promise.all(removed.map((image) => deleteImage(image.publicId)));
    await project.populate(categoryPopulate);

    res.json({ success: true, message: 'Project updated.', data: project });
  } catch (error) {
    await cleanup(uploaded);
    throw error;
  }
});

export const updateProjectStatus = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new AppError('Project not found.', 404);

  const status = req.body.status === 'published' ? 'published' : 'draft';
  if (status === 'published' && !project.thumbnail?.url) {
    throw new AppError('Add a thumbnail before publishing.', 422);
  }

  project.status = status;
  await project.save();
  await project.populate(categoryPopulate);

  res.json({
    success: true,
    message: status === 'published' ? 'Project published.' : 'Project moved to drafts.',
    data: project,
  });
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new AppError('Project not found.', 404);

  const images = [...project.gallery];
  if (project.thumbnail) images.push(project.thumbnail);
  await project.deleteOne();
  await Promise.all(images.map((image) => deleteImage(image.publicId)));

  res.json({ success: true, message: 'Project deleted.' });
});
