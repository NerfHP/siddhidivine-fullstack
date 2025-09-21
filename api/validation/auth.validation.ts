import { z } from 'zod';

// The old email/password register schema is no longer needed for the main user flow.
// It can be kept if you have a separate, manual way to create users (e.g., an admin panel).
// For a pure OTP system, it's best to remove it to avoid confusion.
// const register = z.object({ ... });

// This is still needed for your app's session management.
const refreshTokens = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

// --- THIS IS THE NEW, REQUIRED SCHEMA FOR THE LOGIN POPUP ---
/**
 * Validates that the incoming request to the /firebase-login endpoint
 * contains a non-empty string for the firebaseToken.
 */
const firebaseLogin = z.object({
  body: z.object({
    firebaseToken: z.string().min(1, 'Firebase token is required'),
  }),
});

export const authValidation = {
  // register, // Removed to focus on OTP login
  refreshTokens,
  firebaseLogin, // The new primary login validation method
};

