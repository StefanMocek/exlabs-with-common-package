import {Router} from 'express';
import {requireAuth, validateRequest} from '@exlabs-recruitment-task-sm-common/coomon/build';
import usersController from './users.controller';
import {createUserValidation, idParamValidation, roleQueryValidation, updateUserValidation} from './validators';

const router = Router();

router
  .route('/user')
  .post(createUserValidation, validateRequest, requireAuth, usersController.addUser);

router
  .route('/users')
  .get(roleQueryValidation, validateRequest, requireAuth, usersController.getAllUsers);

router
  .route('/user/:id')
  .get(idParamValidation, validateRequest, requireAuth, usersController.getSingleUser)
  .patch(idParamValidation, updateUserValidation, validateRequest, requireAuth, usersController.updateUser)
  .delete(idParamValidation, validateRequest, requireAuth, usersController.deleteUser);

export {router as usersRouter};
