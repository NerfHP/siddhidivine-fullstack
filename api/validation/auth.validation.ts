import { z } from 'zod';

// Refresh tokens validation
const refreshTokens = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

// Firebase login validation
const firebaseLogin = z.object({
  body: z.object({
    firebaseToken: z.string().min(1, 'Firebase token is required'),
  }),
});

// Complete registration validation
const completeRegistration = z.object({
  params: z.object({
    userId: z.string().min(1, 'User ID is required'),
  }),
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters'),
    email: z.string()
      .email('Please enter a valid email address')
      .max(100, 'Email must not exceed 100 characters'),
    address: z.string()
      .min(10, 'Address must be at least 10 characters')
      .max(200, 'Address must not exceed 200 characters'),
    alternativePhone: z.string()
      .regex(/^[0-9]{10}$/, 'Alternative phone must be 10 digits')
      .optional(),
  }),
});

export const authValidation = {
  refreshTokens,
  firebaseLogin,
  completeRegistration,
};