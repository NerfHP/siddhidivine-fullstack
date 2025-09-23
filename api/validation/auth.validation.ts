import { z } from 'zod';

// Validation schema for the new password-based login form.
const login = z.object({
  body: z.object({
    phone: z.string().length(10, "Phone number must be exactly 10 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

// Updated registration validation to include the new password fields.
const completeRegistration = z.object({
  params: z.object({
    userId: z.string().cuid('Invalid user ID format'),
  }),
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    address: z.string().min(10, "Address must be at least 10 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    alternativePhone: z.string().length(10, "Alternative phone must be 10 digits").optional().or(z.literal('')),
  }),
});


// Validation for the token refresh endpoint (unchanged).
const refreshTokens = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

// Validation for the Firebase OTP login step (unchanged).
const firebaseLogin = z.object({
  body: z.object({
    firebaseToken: z.string(),
  }),
});


export const authValidation = {
  login,
  refreshTokens,
  firebaseLogin,
  completeRegistration,
};

