import type { CatalogMediaType } from '@popcorn-time/shared';

export type ExploreTab = 'all' | 'movie' | 'tv' | 'anime' | 'documentary';
export type CatalogSort =
  | 'popularity.desc'
  | 'popularity.asc'
  | 'vote_average.desc'
  | 'primary_release_date.desc';

export const exploreTabs: ReadonlyArray<{ value: ExploreTab; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'movie', label: 'Películas' },
  { value: 'tv', label: 'Series' },
  { value: 'anime', label: 'Anime' },
  { value: 'documentary', label: 'Documentales' },
];

export const sortOptions: ReadonlyArray<{ value: CatalogSort; label: string }> = [
  { value: 'popularity.desc', label: 'Popularidad' },
  { value: 'popularity.asc', label: 'Menor popularidad' },
  { value: 'vote_average.desc', label: 'Mejor rating' },
  { value: 'primary_release_date.desc', label: 'Fecha de lanzamiento' },
];

export const ratingOptions = [0, 5, 6, 7, 8, 9] as const;

export function tabToParams(tab: ExploreTab): {
  type: 'all' | CatalogMediaType;
  category?: 'anime' | 'documentary';
} {
  if (tab === 'movie') return { type: 'movie' };
  if (tab === 'tv') return { type: 'tv' };
  if (tab === 'anime') return { type: 'all', category: 'anime' };
  if (tab === 'documentary') return { type: 'all', category: 'documentary' };
  return { type: 'all' };
}
