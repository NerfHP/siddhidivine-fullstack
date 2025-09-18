import express from 'express';
import { authController } from '../controllers';
import { validate } from '../middleware/validate.middleware';
import { authValidation } from '../validation';

const router = express.Router();

router.post(
  '/register',
  validate(authValidation.register),
  authController.register,
);
router.post('/login', validate(authValidation.login), authController.login);
router.post(
  '/refresh-token',
  validate(authValidation.refreshTokens),
  authController.refreshTokens,
);

export default router;