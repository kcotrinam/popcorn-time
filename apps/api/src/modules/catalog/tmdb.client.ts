import { env } from '../../config/index.js';
import { AppError } from '../../errors/app-error.js';
import { ErrorCode } from '../../errors/error-codes.js';
import type { TmdbDetail, TmdbGenresResponse, TmdbPage } from './tmdb.types.js';

const baseUrl = 'https://api.themoviedb.org/3';
export class TmdbNotFoundError extends Error {}
export class TmdbClient {
  async get<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
    if (!env.TMDB_API_ACCESS_TOKEN)
      throw new AppError(
        503,
        ErrorCode.UPSTREAM_SERVICE_UNAVAILABLE,
        'Catalog service is unavailable',
      );
    const url = new URL(`${baseUrl}${path}`);
    for (const [key, value] of Object.entries(params))
      if (value !== undefined) url.searchParams.set(key, String(value));
    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${env.TMDB_API_ACCESS_TOKEN}`,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(8_000),
      });
    } catch {
      throw new AppError(
        503,
        ErrorCode.UPSTREAM_SERVICE_UNAVAILABLE,
        'Catalog service is unavailable',
      );
    }
    if (response.status === 404) throw new TmdbNotFoundError();
    if (response.status >= 500)
      throw new AppError(
        503,
        ErrorCode.UPSTREAM_SERVICE_UNAVAILABLE,
        'Catalog service is unavailable',
      );
    if (!response.ok)
      throw new AppError(
        502,
        ErrorCode.UPSTREAM_BAD_RESPONSE,
        'Catalog service returned an invalid response',
      );
    try {
      return (await response.json()) as T;
    } catch {
      throw new AppError(
        502,
        ErrorCode.UPSTREAM_BAD_RESPONSE,
        'Catalog service returned an invalid response',
      );
    }
  }
}
export const tmdbClient = new TmdbClient();
export const tmdbEndpoints = {
  search: (type: 'multi' | 'movie' | 'tv', params: Record<string, string | number | undefined>) =>
    tmdbClient.get<TmdbPage>(`/search/${type}`, params),
  discover: (type: 'movie' | 'tv', params: Record<string, string | number | undefined>) =>
    tmdbClient.get<TmdbPage>(`/discover/${type}`, params),
  genres: (type: 'movie' | 'tv') => tmdbClient.get<TmdbGenresResponse>(`/genre/${type}/list`),
  detail: (type: 'movie' | 'tv', id: number) =>
    tmdbClient.get<TmdbDetail>(`/${type}/${id}`, {
      append_to_response: 'credits,alternative_titles',
    }),
};
