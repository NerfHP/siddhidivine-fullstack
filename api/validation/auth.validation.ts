import { z } from 'zod';

// --- REMOVED: The 'login', 'firebaseLogin', and 'completeRegistration' schemas are obsolete ---
// Clerk handles all user input validation on the frontend with its pre-built components.

// This schema is also no longer used with Clerk's session management,
// but we will keep it for now to prevent breaking any other potential imports.
// It can be safely removed later during a final cleanup.
const refreshTokens = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});


export const authValidation = {
  refreshTokens,
};

