import type {
  CreateLibraryItemInput,
  CreateManualLibraryItemInput,
  LibraryItem,
  LibraryMembershipResponse,
  LibraryPage,
  LibraryStatus,
  SaveLibraryExperienceInput,
} from '@popcorn-time/shared';
import {
  deleteJson,
  getJson,
  patchJson,
  postJson,
  putJson,
  type QueryParams,
} from '@/services/http-client';

export type LibraryFilters = {
  status?: LibraryStatus;
  query?: string;
  genreId?: number;
  year?: number;
  categories?: string[];
  sort: 'addedAt.desc' | 'addedAt.asc' | 'title.asc' | 'releaseYear.desc' | 'watchedAt.desc';
  page: number;
  pageSize: number;
};
export const getLibrary = (filters: LibraryFilters, signal?: AbortSignal) => {
  const { categories, ...rest } = filters;
  return getJson<LibraryPage>('/users/me/library', {
    signal,
    query: { ...rest, categories: categories?.join(',') } as QueryParams,
  });
};
export const addToLibrary = (input: CreateLibraryItemInput) =>
  postJson<{ item: LibraryItem; created: boolean }>('/users/me/library', input);
export const addManualToLibrary = (input: CreateManualLibraryItemInput) =>
  postJson<{ item: LibraryItem; created: boolean }>('/users/me/library/manual', input);
export type LibraryMembershipReference = Pick<CreateLibraryItemInput, 'externalId' | 'mediaType'>;
export const getLibraryMemberships = (items: LibraryMembershipReference[], signal?: AbortSignal) =>
  getJson<LibraryMembershipResponse>('/users/me/library/membership', {
    signal,
    query: {
      provider: 'tmdb',
      items: items.map((item) => `${item.mediaType}:${item.externalId}`).join(','),
    },
  });
export const updateLibraryStatus = (id: string, status: LibraryStatus) =>
  patchJson<LibraryItem>(`/users/me/library/${id}`, { status });
export const saveLibraryExperience = (id: string, input: SaveLibraryExperienceInput) =>
  putJson<LibraryItem>(`/users/me/library/${id}/experience`, input);
export const removeLibraryItem = (id: string) => deleteJson(`/users/me/library/${id}`);
