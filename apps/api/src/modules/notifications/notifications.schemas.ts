import { z } from 'zod';
export const notificationParamsSchema = z.object({ id: z.uuid() });
export const notificationQuerySchema = z.object({
  filter: z.enum(['all', 'unread']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type NotificationQuery = z.infer<typeof notificationQuerySchema>;
