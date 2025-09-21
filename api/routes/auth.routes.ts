import express from 'express';
import { authController } from '../controllers/index.js';
import { validate } from '../middleware/validate.middleware.js';
import { authValidation } from '../validation/index.js';

const router = express.Router();

// Refresh tokens endpoint
router.post(
  '/refresh-token',
  validate(authValidation.refreshTokens),
  authController.refreshTokens,
);

// Firebase OTP login endpoint
router.post(
    '/firebase-login', 
    validate(authValidation.firebaseLogin),
    authController.firebaseLogin
);

// Complete user registration endpoint
router.post(
  '/complete-registration/:userId',
  validate(authValidation.completeRegistration),
  authController.completeRegistration
);

export default router;