import { z } from 'zod';

const mediaType = z.enum(['movie', 'tv']);
const status = z.enum(['WATCHLIST', 'WATCHED']);
export const createLibraryItemSchema = z
  .object({
    provider: z.literal('tmdb'),
    externalId: z.number().int().positive(),
    mediaType,
  })
  .strict();
export const updateLibraryItemSchema = z.object({ status }).strict();
export const libraryItemParamsSchema = z.object({ id: z.uuid() });
export const libraryQuerySchema = z.object({
  status: status.optional(),
  mediaType: mediaType.optional(),
  query: z.string().trim().min(1).max(100).optional(),
  genreId: z.coerce.number().int().positive().optional(),
  year: z.coerce
    .number()
    .int()
    .min(1888)
    .max(new Date().getFullYear() + 1)
    .optional(),
  sort: z
    .enum(['addedAt.desc', 'addedAt.asc', 'title.asc', 'releaseYear.desc', 'watchedAt.desc'])
    .default('addedAt.desc'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(24),
});
const membershipReferenceSchema = z
  .string()
  .regex(/^(movie|tv):[1-9]\d*$/, 'Each item must use movie:<id> or tv:<id>')
  .transform((value) => {
    const [mediaType, externalId] = value.split(':') as ['movie' | 'tv', string];
    return { mediaType, externalId: Number(externalId) };
  });
export const libraryMembershipQuerySchema = z
  .object({
    provider: z.literal('tmdb'),
    items: z
      .string()
      .min(1)
      .transform((value) => value.split(','))
      .pipe(z.array(membershipReferenceSchema).min(1).max(30)),
  })
  .superRefine((value, context) => {
    const keys = value.items.map((item) => `${item.mediaType}:${item.externalId}`);
    if (new Set(keys).size !== keys.length)
      context.addIssue({ code: 'custom', message: 'Duplicate media references are not allowed' });
  });
export type CreateLibraryItemInput = z.infer<typeof createLibraryItemSchema>;
export type UpdateLibraryItemInput = z.infer<typeof updateLibraryItemSchema>;
export type LibraryItemParams = z.infer<typeof libraryItemParamsSchema>;
export type LibraryQuery = z.infer<typeof libraryQuerySchema>;
export type LibraryMembershipQuery = z.infer<typeof libraryMembershipQuerySchema>;
