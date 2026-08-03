import type {
  CatalogDetail,
  CatalogGenre,
  CatalogMediaType,
  CatalogPage,
} from '@popcorn-time/shared';
import { getJson } from '@/services/http-client';
import type { CatalogSort, ExploreTab } from './catalog.constants';
import { tabToParams } from './catalog.constants';

export type CatalogFilters = {
  genreId?: number;
  year?: number;
  minRating?: number;
  sort: CatalogSort;
};

export type CatalogRequest = CatalogFilters & { tab: ExploreTab; page: number; query?: string };

export function getCatalog(request: CatalogRequest, signal?: AbortSignal): Promise<CatalogPage> {
  const { tab, page, query, genreId, year, minRating, sort } = request;
  const mapped = tabToParams(tab);
  if (query && query.length >= 2) {
    return getJson<CatalogPage>('/catalog/search', {
      signal,
      query: { query, type: mapped.type, page },
    });
  }
  return getJson<CatalogPage>('/catalog/discover', {
    signal,
    query: { type: mapped.type, category: mapped.category, genreId, year, minRating, sort, page },
  });
}

export const getGenres = async (type: CatalogMediaType, signal?: AbortSignal) =>
  (
    await getJson<{ results: CatalogGenre[] }>('/catalog/genres', {
      signal,
      query: { type },
    })
  ).results;

export const getCatalogDetail = (type: CatalogMediaType, id: number, signal?: AbortSignal) =>
  getJson<CatalogDetail>(`/catalog/${type}/${id}`, { signal });
