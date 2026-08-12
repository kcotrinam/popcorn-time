import { z } from 'zod';
import { usernameSchema } from '../auth/auth.schemas.js';
export const setupUsernameSchema = z.object({ username: usernameSchema }).strict();
export const lookupUsernameSchema = z.object({ username: usernameSchema });
export type SetupUsernameInput = z.infer<typeof setupUsernameSchema>;
