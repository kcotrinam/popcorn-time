import { z } from 'zod';
const id = z.string().uuid();
const username = z
  .string()
  .trim()
  .min(3)
  .max(30)
  .regex(/^[A-Za-z0-9_]+$/);
export const planParamsSchema = z.object({ id });
export const participantParamsSchema = planParamsSchema.extend({ userId: id });
export const createPlanSchema = z
  .object({
    provider: z.literal('tmdb'),
    externalId: z.number().int().positive(),
    mediaType: z.enum(['movie', 'tv']),
    usernames: z.array(username).min(1).max(9),
  })
  .strict();
export const inviteSchema = z.object({ usernames: z.array(username).min(1).max(9) }).strict();
export const listPlansSchema = z.object({
  view: z.enum(['invitations', 'active', 'history']).default('active'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
export const progressSchema = z
  .object({
    movieMinute: z.number().int().min(0).optional(),
    currentSeason: z.number().int().positive().optional(),
    lastWatchedEpisode: z.number().int().positive().optional(),
  })
  .strict();
export const completeSchema = z
  .object({
    watchedAt: z.coerce.date(),
    rating: z.number().min(1).max(10).multipleOf(0.5).nullable().optional(),
    comment: z.string().trim().max(2000).nullable().optional(),
  })
  .strict();
export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type PlanQuery = z.infer<typeof listPlansSchema>;
export type ProgressInput = z.infer<typeof progressSchema>;
export type CompleteInput = z.infer<typeof completeSchema>;
