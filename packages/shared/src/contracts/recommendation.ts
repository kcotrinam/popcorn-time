import type { CatalogMediaType, CatalogProvider } from './catalog.js';
import type { LibraryItem } from './library.js';
export type RecommendationStatus = 'PENDING' | 'ACCEPTED';
export type RecommendationDirection = 'received' | 'sent';
export type PublicUser = { username: string; displayName: string; avatarUrl: string | null };
export type Recommendation = {
  id: string;
  provider: CatalogProvider;
  externalId: number;
  mediaType: CatalogMediaType;
  title: string;
  posterUrl: string | null;
  releaseYear: number | null;
  status: RecommendationStatus;
  createdAt: string;
  acceptedAt: string | null;
  sender?: PublicUser;
  recipient?: PublicUser;
};
export type RecommendationPage = {
  results: Recommendation[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalResults: number;
};
export type AcceptRecommendationResult = {
  recommendation: Recommendation;
  libraryItem: LibraryItem;
  created: boolean;
};
