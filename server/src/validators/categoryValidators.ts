import { body, param } from 'express-validator';

export const categoryRules = [
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Category name must be between 2 and 60 characters.'),
  body('slug')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Use a slug made of lowercase letters, numbers, and hyphens.'),
];

export const categoryIdRule = [param('id').isMongoId().withMessage('Invalid category id.')];
