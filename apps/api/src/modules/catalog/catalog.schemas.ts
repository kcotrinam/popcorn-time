import { z } from 'zod';

const mediaType = z.enum(['movie', 'tv']);
const page = z.coerce.number().int().min(1).max(500).default(1);
export const searchQuerySchema = z.object({
  query: z.string().trim().min(2).max(100),
  type: z.enum(['all', 'movie', 'tv']).default('all'),
  page,
});
export const discoverQuerySchema = z.object({
  type: z.enum(['all', 'movie', 'tv']).default('all'),
  genreId: z.coerce.number().int().positive().optional(),
  year: z.coerce
    .number()
    .int()
    .min(1888)
    .max(new Date().getFullYear() + 1)
    .optional(),
  minRating: z.coerce.number().min(0).max(10).optional(),
  sort: z
    .enum(['popularity.desc', 'popularity.asc', 'vote_average.desc', 'primary_release_date.desc'])
    .default('popularity.desc'),
  page,
  category: z.enum(['anime', 'documentary']).optional(),
});
export const genresQuerySchema = z.object({ type: mediaType });
export const detailParamsSchema = z.object({
  type: mediaType,
  id: z.coerce.number().int().positive(),
});
export const tvSeasonsParamsSchema = z.object({ id: z.coerce.number().int().positive() });
export const tvSeasonParamsSchema = tvSeasonsParamsSchema.extend({
  seasonNumber: z.coerce.number().int().positive(),
});
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type DiscoverQuery = z.infer<typeof discoverQuerySchema>;
export type GenresQuery = z.infer<typeof genresQuerySchema>;
export type DetailParams = z.infer<typeof detailParamsSchema>;
export type TvSeasonsParams = z.infer<typeof tvSeasonsParamsSchema>;
export type TvSeasonParams = z.infer<typeof tvSeasonParamsSchema>;
