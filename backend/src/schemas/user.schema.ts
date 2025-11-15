import { z } from 'zod';

export const changePasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  username: z.string().min(2, 'Username must be at least 2 characters.'),
});
