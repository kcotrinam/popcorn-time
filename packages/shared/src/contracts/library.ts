import type { CatalogMediaType, CatalogProvider } from './catalog.js';

export type LibraryStatus = 'WATCHLIST' | 'WATCHED';
export type LibraryItem = {
  id: string;
  provider: CatalogProvider;
  externalId: number;
  mediaType: CatalogMediaType;
  status: LibraryStatus;
  title: string;
  posterUrl: string | null;
  releaseYear: number | null;
  genreIds: number[];
  watchedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
export type LibraryPage = {
  results: LibraryItem[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalResults: number;
};
export type CreateLibraryItemInput = {
  provider: CatalogProvider;
  externalId: number;
  mediaType: CatalogMediaType;
};
export type UpdateLibraryItemInput = { status: LibraryStatus };
export type LibraryMembership = {
  externalId: number;
  mediaType: CatalogMediaType;
  status: LibraryStatus;
  libraryItemId: string;
};
export type LibraryMembershipResponse = { results: LibraryMembership[] };
