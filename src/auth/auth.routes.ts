import {Router} from 'express';
import AuthController from './auth.controller';
import {currentUser, validateRequest} from '@exlabs-recruitment-task-sm-common/coomon/build';
import {emailAndPwdValidation} from './validators/email-password-validator';

const router = Router();

router.post('/register',
  emailAndPwdValidation,
  validateRequest,
  AuthController.register);

router.post('/login',
  emailAndPwdValidation,
  validateRequest, 
  AuthController.login);

router.get('/current-user', currentUser(process.env.JWT_KEY!), AuthController.getCurrentUser);
router.get('/logout', currentUser(process.env.JWT_KEY!), AuthController.logout);

export {router as authRouter};
