import express from 'express';
import { authController } from '../controllers/index.js';
import { validate } from '../middleware/validate.middleware.js';
import { authValidation } from '../validation/index.js';

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