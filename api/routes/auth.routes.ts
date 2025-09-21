import express from 'express';
import { authController } from '../controllers/index.js';
import { validate } from '../middleware/validate.middleware.js';
import { authValidation } from '../validation/index.js';

const router = express.Router();

// The old email/password register route is no longer needed for the main user flow.
// It can be kept if you have a separate, manual way to create users (e.g., an admin panel).
// router.post('/register', validate(authValidation.register), authController.register);

// This route is still necessary for your app's session management.
router.post(
  '/refresh-token',
  validate(authValidation.refreshTokens),
  authController.refreshTokens,
);

// --- THIS IS THE NEW, PRIMARY LOGIN ROUTE ---
/**
 * This endpoint receives a firebaseToken from the frontend after a successful OTP verification.
 * It uses the authController.firebaseLogin function to securely verify this token,
 * find or create a user, and return your app's own session tokens.
 */
router.post(
    '/firebase-login', 
    validate(authValidation.firebaseLogin),
    authController.firebaseLogin
);

export default router;

