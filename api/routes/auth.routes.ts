import express from 'express';
import { authController } from '../controllers/index.js';
import { validate } from '../middleware/validate.middleware.js';
import { authValidation } from '../validation/index.js';

const router = express.Router();

// --- NEW: Standard Login Route for existing users ---
// This endpoint is for the "Login" tab in your popup.
router.post(
  '/login',
  validate(authValidation.login),
  authController.login
);

// --- Firebase OTP Route for new users ---
// This is the first step for the "Sign Up" tab.
router.post(
  '/firebase-login', 
  validate(authValidation.firebaseLogin),
  authController.firebaseLogin
);

// --- Complete Registration Route ---
// This is the second step for the "Sign Up" tab, where the user sets their password.
router.post(
  '/complete-registration/:userId',
  validate(authValidation.completeRegistration),
  authController.completeRegistration
);

// --- Token Refresh Route (Unchanged) ---
router.post(
  '/refresh-token',
  validate(authValidation.refreshTokens),
  authController.refreshTokens,
);

export default router;

