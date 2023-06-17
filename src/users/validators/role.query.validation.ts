import {ValidationChain, query} from 'express-validator';

export const roleQueryValidation: ValidationChain[] = [
  query('role')
    .optional()
    .custom((value) => {
      if (!value) {
        return true;
      };

      if (value === 'admin' || value === 'user') {
        return true;
      };

      throw new Error('Invalid role query');
    }),
];