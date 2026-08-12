import { z } from 'zod';
export const createRecommendationSchema = z
  .object({
    recipientUsername: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .regex(/^[A-Za-z0-9_]+$/),
    provider: z.literal('tmdb'),
    externalId: z.number().int().positive(),
    mediaType: z.enum(['movie', 'tv']),
  })
  .strict();
export const recommendationParamsSchema = z.object({ id: z.uuid() });
export const recommendationQuerySchema = z.object({
  direction: z.enum(['received', 'sent']).default('received'),
  status: z.enum(['PENDING', 'ACCEPTED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(24),
});
export type RecommendationQuery = z.infer<typeof recommendationQuerySchema>;
