import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError';

export function validate(req: Request, _res: Response, next: NextFunction): void {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }

  const errors = result.array().map((issue) => ({
    field: 'path' in issue ? String(issue.path) : 'form',
    message: issue.msg as string,
  }));

  next(new AppError('Please correct the highlighted fields.', 422, errors));
}
