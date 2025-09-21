import express from 'express';
import { authController } from '../controllers/index.js';
import { validate } from '../middleware/validate.middleware.js';
import { authValidation } from '../validation/index.js';

const router = express.Router();

// Your existing email/password routes
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

// --- ADD THIS NEW ROUTE FOR FIREBASE LOGIN ---
/**
 * This endpoint receives a firebaseToken from the frontend after a successful OTP verification.
 * It uses the authController.firebaseLogin function to securely verify this token,
 * find or create a user, and return your app's own session tokens.
 */
router.post(
    '/firebase-login', 
    validate(authValidation.firebaseLogin), // Note: You will need to create this validation schema next
    authController.firebaseLogin
);

export default router;

