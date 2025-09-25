import { z } from 'zod';

const refreshTokens = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});


export const authValidation = {
  refreshTokens,
};

