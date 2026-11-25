import { body } from 'express-validator';

export const loginRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.'),
  body('password').isString().notEmpty().withMessage('Enter your password.'),
];
