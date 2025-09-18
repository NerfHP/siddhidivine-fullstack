import { z } from 'zod';

const register = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
  }),
});

const login = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

const refreshTokens = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

export const authValidation = {
  register,
  login,
  refreshTokens,
};