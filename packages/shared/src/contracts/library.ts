import type { CatalogMediaType, CatalogProvider } from './catalog.js';

export type LibraryStatus = 'WATCHLIST' | 'WATCHED';
export type ManualCategory = 'Anime' | 'Documentary' | 'Experimental' | 'Indie' | 'Family';
export type LibraryProvider = CatalogProvider | 'manual';
export type LibraryItem = {
  id: string;
  provider: LibraryProvider;
  externalId: number | null;
  mediaType: CatalogMediaType;
  status: LibraryStatus;
  title: string;
  originalTitle: string | null;
  originalLanguage: string | null;
  nationality: string | null;
  synopsis: string | null;
  posterUrl: string | null;
  releaseYear: number | null;
  genreIds: number[];
  manualCategories: ManualCategory[];
  watchedAt: string | null;
  personalRating: number | null;
  privateComment: string | null;
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
export type CreateManualLibraryItemInput = {
  title: string;
  originalTitle?: string;
  mediaType: CatalogMediaType;
  releaseYear?: number;
  originalLanguage?: string;
  nationality?: string;
  synopsis?: string;
  posterUrl?: string;
  categories: ManualCategory[];
  status: LibraryStatus;
};
export type UpdateLibraryItemInput = { status: LibraryStatus };
export type SaveLibraryExperienceInput = {
  rating?: number | null;
  comment?: string | null;
  watchedAt: string;
};
export type LibraryMembership = {
  externalId: number;
  mediaType: CatalogMediaType;
  status: LibraryStatus;
  libraryItemId: string;
  watchedAt: string | null;
  personalRating: number | null;
  privateComment: string | null;
};
export type LibraryMembershipResponse = { results: LibraryMembership[] };
