import { z } from 'zod';

const contact = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    message: z.string().min(10, 'Message must be at least 10 characters long'),
  }),
});

export const formValidation = {
  contact,
};