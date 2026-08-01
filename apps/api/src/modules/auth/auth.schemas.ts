import { z } from 'zod';

const email = z.string().trim().email().max(254);
const password = z.string().min(12).max(128);
export const registerSchema = z.object({
  email,
  password,
  displayName: z.string().trim().min(1).max(80),
});
export const loginSchema = z.object({ email, password: z.string().min(1).max(128) });
export const tokenSchema = z.object({ token: z.string().min(32).max(512) });
export const forgotPasswordSchema = z.object({ email });
export const resetPasswordSchema = tokenSchema.extend({ password });
export type RegisterInput = z.infer<typeof registerSchema>;
