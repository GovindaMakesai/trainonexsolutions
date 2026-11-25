import { body } from 'express-validator';
import { BUDGET_OPTIONS } from '../models/ContactMessage';

export const contactRules = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.'),
  body('company').optional({ values: 'falsy' }).trim().isLength({ max: 120 }).withMessage('Company name is too long.'),
  body('budget')
    .optional({ values: 'falsy' })
    .isIn([...BUDGET_OPTIONS])
    .withMessage('Choose a budget range.'),
  body('message').trim().isLength({ min: 10, max: 5000 }).withMessage('Message must be between 10 and 5,000 characters.'),
  body('website').optional({ values: 'falsy' }).isString(),
];
