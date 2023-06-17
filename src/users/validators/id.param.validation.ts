import {ValidationChain, param} from 'express-validator';

export const idParamValidation: ValidationChain[] = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID parameter'),
]