import { body, ValidationChain } from 'express-validator';

export const updateUserValidation: ValidationChain[] = [
  body().custom((value, { req }) => {
    const allowedFields = ['firstName', 'lastName', 'role'];
    const invalidFields = Object.keys(req.body).filter((field) => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      throw new Error(`Invalid fields: ${invalidFields.join(', ')}`);
    }

    return true;
  }),
  body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role'),
];
