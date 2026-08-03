import type {
  CatalogCard,
  CatalogCredit,
  CatalogDetail,
  CatalogGenre,
  CatalogMediaType,
} from '@popcorn-time/shared';
import type { TmdbDetail, TmdbPage, TmdbResult } from './tmdb.types.js';
const imageBase = 'https://image.tmdb.org/t/p/w500';
const backdropBase = 'https://image.tmdb.org/t/p/w1280';
const imageUrl = (path: string | null | undefined, base: string) =>
  path && /^\/[A-Za-z0-9._/-]+$/.test(path) ? `${base}${path}` : null;
const dateFor = (result: TmdbResult) => result.release_date ?? result.first_air_date ?? null;
const yearFor = (date: string | null) =>
  date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? Number(date.slice(0, 4)) : null;
const titleFor = (result: TmdbResult, type: CatalogMediaType) =>
  type === 'movie' ? (result.title ?? '') : (result.name ?? '');
const originalTitleFor = (result: TmdbResult, type: CatalogMediaType) =>
  type === 'movie' ? (result.original_title ?? null) : (result.original_name ?? null);
export function normalizeCard(result: TmdbResult, mediaType: CatalogMediaType): CatalogCard | null {
  if (!Number.isInteger(result.id) || result.id <= 0) return null;
  const title = titleFor(result, mediaType);
  if (!title) return null;
  const releaseDate = dateFor(result);
  return {
    provider: 'tmdb',
    externalId: result.id,
    mediaType,
    title,
    originalTitle: originalTitleFor(result, mediaType),
    overview: result.overview || null,
    posterUrl: imageUrl(result.poster_path, imageBase),
    backdropUrl: imageUrl(result.backdrop_path, backdropBase),
    releaseDate,
    releaseYear: yearFor(releaseDate),
    externalRating: typeof result.vote_average === 'number' ? result.vote_average : null,
    voteCount: typeof result.vote_count === 'number' ? result.vote_count : 0,
    genreIds: Array.isArray(result.genre_ids) ? result.genre_ids.filter(Number.isInteger) : [],
  };
}
export function normalizePage(page: TmdbPage, forcedType?: CatalogMediaType) {
  const cards = page.results.flatMap((result) => {
    const type =
      forcedType ??
      (result.media_type === 'movie' || result.media_type === 'tv' ? result.media_type : null);
    return type
      ? [normalizeCard(result, type)].filter((card): card is CatalogCard => card !== null)
      : [];
  });
  return {
    results: cards,
    page: page.page,
    totalPages: page.total_pages,
    totalResults: page.total_results,
  };
}
export function normalizeDetail(
  detail: TmdbDetail,
  mediaType: CatalogMediaType,
): CatalogDetail | null {
  const card = normalizeCard(detail, mediaType);
  if (!card) return null;
  const genres: CatalogGenre[] = (detail.genres ?? [])
    .filter((genre) => Number.isInteger(genre.id) && Boolean(genre.name))
    .map((genre) => ({ id: genre.id, name: genre.name }));
  const credits: CatalogCredit[] = (detail.credits?.cast ?? []).slice(0, 10).flatMap((person) =>
    person.name
      ? [
          {
            name: person.name,
            role: person.character ?? person.job ?? 'Cast',
            profileUrl: imageUrl(person.profile_path, imageBase),
          },
        ]
      : [],
  );
  const alternativeTitles = [
    ...new Set(
      (detail.alternative_titles?.titles ?? []).flatMap((item) => (item.title ? [item.title] : [])),
    ),
  ].slice(0, 10);
  return {
    ...card,
    genres,
    alternativeTitles,
    runtimeMinutes:
      mediaType === 'movie' ? (detail.runtime ?? null) : (detail.episode_run_time?.[0] ?? null),
    numberOfEpisodes: mediaType === 'tv' ? (detail.number_of_episodes ?? null) : null,
    numberOfSeasons: mediaType === 'tv' ? (detail.number_of_seasons ?? null) : null,
    status: detail.status ?? null,
    originCountries:
      mediaType === 'movie'
        ? (detail.production_countries ?? []).flatMap((country) =>
            country.iso_3166_1 ? [country.iso_3166_1] : [],
          )
        : (detail.origin_country ?? []),
    originalLanguage: detail.original_language ?? null,
    credits,
  };
}
