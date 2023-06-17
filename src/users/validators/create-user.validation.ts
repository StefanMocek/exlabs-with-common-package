import {ValidationChain, body} from 'express-validator';

export const createUserValidation: ValidationChain[] = [
  body('email')
    .not().isEmpty()
    .isEmail()
    .withMessage('a valid email is required'),

  body('role')
    .isIn(['admin', 'user'])
    .withMessage('A valid role is required'),
];