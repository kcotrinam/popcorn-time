import { z } from 'zod';
export const healthResponseSchema = z.object({
  status: z.enum(['ok', 'error']),
  services: z.object({ api: z.enum(['up', 'down']), database: z.enum(['up', 'down']) }),
  timestamp: z.iso.datetime(),
});
