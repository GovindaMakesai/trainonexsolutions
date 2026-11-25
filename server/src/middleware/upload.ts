import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { AppError } from '../utils/AppError';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 9 },
  fileFilter(_req, file, callback) {
    if (!ALLOWED.has(file.mimetype)) {
      callback(new Error('Only JPEG, PNG, WebP, and GIF images are allowed.'));
      return;
    }
    callback(null, true);
  },
});

const parser = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'gallery', maxCount: 8 },
]);

export function handleProjectUpload(req: Request, res: Response, next: NextFunction): void {
  parser(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        next(new AppError('Each image must be 5MB or smaller.', 400));
        return;
      }
      if (error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE') {
        next(new AppError('Upload one thumbnail and up to 8 gallery images.', 400));
        return;
      }
      next(new AppError(error.message, 400));
      return;
    }

    const message = error instanceof Error ? error.message : 'Upload failed.';
    next(new AppError(message, 400));
  });
}

export type ProjectFiles = {
  thumbnail?: Express.Multer.File[];
  gallery?: Express.Multer.File[];
};

export function getProjectFiles(req: Request): ProjectFiles {
  if (!req.files || Array.isArray(req.files)) return {};
  return req.files as ProjectFiles;
}
