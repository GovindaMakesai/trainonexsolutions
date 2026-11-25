import { body, param } from 'express-validator';

const urlRule = (field: string, label: string) =>
  body(field)
    .optional({ values: 'falsy' })
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage(`Enter a full ${label} starting with http:// or https://.`);

export const projectRules = [
  body('title').trim().isLength({ min: 3, max: 120 }).withMessage('Title must be between 3 and 120 characters.'),
  body('slug')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Use a slug made of lowercase letters, numbers, and hyphens.'),
  body('shortDescription')
    .trim()
    .isLength({ min: 10, max: 300 })
    .withMessage('Short description must be between 10 and 300 characters.'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 20000 })
    .withMessage('Case study must be between 20 and 20,000 characters.'),
  body('category').isMongoId().withMessage('Choose a category.'),
  urlRule('projectUrl', 'project URL'),
  urlRule('githubUrl', 'GitHub URL'),
  body('status').isIn(['draft', 'published']).withMessage('Status must be draft or published.'),
];

export const statusRules = [
  param('id').isMongoId().withMessage('Invalid project id.'),
  body('status').isIn(['draft', 'published']).withMessage('Status must be draft or published.'),
];

export const idRule = [param('id').isMongoId().withMessage('Invalid id.')];
