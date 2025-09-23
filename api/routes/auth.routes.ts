import express from 'express';
import { authController } from '../controllers/index.js';
import { validate } from '../middleware/validate.middleware.js';
import { authValidation } from '../validation/index.js';

const router = express.Router();

// --- NEW: Route for registering a new user ---
// This endpoint is for the "Sign Up" form.
router.post(
  '/register',
  validate(authValidation.register),
  authController.register
);

// --- NEW: Route for logging in an existing user ---
// This is for the "Login" form and uses Firebase for verification.
router.post(
  '/firebase-login', 
  validate(authValidation.firebaseLogin),
  authController.firebaseLogin
);

// --- Token Refresh Route (Unchanged) ---
// This remains for managing user sessions.
router.post(
  '/refresh-token',
  validate(authValidation.refreshTokens),
  authController.refreshTokens,
);

export default router;

