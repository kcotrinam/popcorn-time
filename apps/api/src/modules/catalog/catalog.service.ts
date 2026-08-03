import type { CatalogDetail, CatalogGenre, CatalogPage } from '@popcorn-time/shared';
import { AppError } from '../../errors/app-error.js';
import { ErrorCode } from '../../errors/error-codes.js';
import { TtlCache } from './catalog.cache.js';
import type { DetailParams, DiscoverQuery, GenresQuery, SearchQuery } from './catalog.schemas.js';
import { normalizeDetail, normalizePage } from './catalog.repository.js';
import { tmdbEndpoints, TmdbNotFoundError } from './tmdb.client.js';
const cache = new TtlCache<CatalogPage | CatalogGenre[] | CatalogDetail>(60_000);
const cached = async <T extends CatalogPage | CatalogGenre[] | CatalogDetail>(
  key: string,
  loader: () => Promise<T>,
): Promise<T> => {
  const value = cache.get(key);
  if (value) return value as T;
  const loaded = await loader();
  cache.set(key, loaded);
  return loaded;
};
const discoverParams = (query: DiscoverQuery, type: 'movie' | 'tv') => ({
  page: query.page,
  sort_by: query.sort,
  with_genres:
    [
      query.genreId,
      query.category === 'documentary' ? 99 : query.category === 'anime' ? 16 : undefined,
    ]
      .filter((value): value is number => value !== undefined)
      .join(',') || undefined,
  with_original_language: query.category === 'anime' ? 'ja' : undefined,
  'vote_average.gte': query.minRating,
  [type === 'movie' ? 'primary_release_year' : 'first_air_date_year']: query.year,
});
export const catalogService = {
  async search(query: SearchQuery): Promise<CatalogPage> {
    return cached(`search:${JSON.stringify(query)}`, async () => {
      const page = await tmdbEndpoints.search(query.type === 'all' ? 'multi' : query.type, {
        query: query.query,
        page: query.page,
        include_adult: 'false',
      });
      return normalizePage(page, query.type === 'all' ? undefined : query.type);
    });
  },
  async discover(query: DiscoverQuery): Promise<CatalogPage> {
    return cached(`discover:${JSON.stringify(query)}`, async () => {
      if (query.type !== 'all')
        return normalizePage(
          await tmdbEndpoints.discover(query.type, discoverParams(query, query.type)),
          query.type,
        );
      const [movies, shows] = await Promise.all([
        tmdbEndpoints.discover('movie', discoverParams(query, 'movie')),
        tmdbEndpoints.discover('tv', discoverParams(query, 'tv')),
      ]);
      const results = [
        ...normalizePage(movies, 'movie').results,
        ...normalizePage(shows, 'tv').results,
      ];
      const unique = [
        ...new Map(results.map((item) => [`${item.mediaType}:${item.externalId}`, item])).values(),
      ];
      return {
        results: unique,
        page: query.page,
        totalPages: Math.max(movies.total_pages, shows.total_pages),
        totalResults: movies.total_results + shows.total_results,
      };
    });
  },
  async genres(query: GenresQuery): Promise<CatalogGenre[]> {
    return cached(`genres:${query.type}`, async () =>
      (await tmdbEndpoints.genres(query.type)).genres
        .filter((genre) => Number.isInteger(genre.id) && Boolean(genre.name))
        .map((genre) => ({ id: genre.id, name: genre.name })),
    );
  },
  async detail(params: DetailParams): Promise<CatalogDetail> {
    return cached(`detail:${params.type}:${params.id}`, async () => {
      try {
        const result = normalizeDetail(
          await tmdbEndpoints.detail(params.type, params.id),
          params.type,
        );
        if (!result)
          throw new AppError(
            502,
            ErrorCode.UPSTREAM_BAD_RESPONSE,
            'Catalog service returned an invalid response',
          );
        return result;
      } catch (error) {
        if (error instanceof TmdbNotFoundError)
          throw new AppError(404, ErrorCode.NOT_FOUND, 'Catalog item was not found');
        throw error;
      }
    });
  },
  clearCache: () => cache.clear(),
};
