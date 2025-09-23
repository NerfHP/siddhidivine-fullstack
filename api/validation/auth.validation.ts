import { z } from 'zod';

// Validation for the new user registration form.
const register = z.object({
  body: z.object({
    firebaseToken: z.string(),
    userData: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email address"),
        phone: z.string().length(10, "Phone number must be exactly 10 digits"),
        address: z.string().min(10, "Address must be at least 10 characters"),
        // Password is not validated here as it's handled securely on the client-side by Firebase.
    }),
  }),
});

// Validation for the Firebase login step (for existing users).
const firebaseLogin = z.object({
  body: z.object({
    firebaseToken: z.string(),
  }),
});

// Validation for the token refresh endpoint (unchanged).
const refreshTokens = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

export const authValidation = {
  register,
  firebaseLogin,
  refreshTokens,
};

