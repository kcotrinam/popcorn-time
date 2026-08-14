import type { CatalogMediaType, CatalogProvider } from './catalog.js';
import type { PublicUser } from './recommendation.js';

export type SharedPlanStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type SharedPlanProgressStatus = 'NOT_STARTED' | 'WATCHING' | 'WATCHED';
export type SharedPlanParticipant = {
  user: PublicUser;
  role: 'CREATOR' | 'MEMBER';
  invitationStatus: 'PENDING' | 'ACCEPTED';
  progressStatus: SharedPlanProgressStatus;
  movieMinute: number | null;
  currentSeason: number | null;
  lastWatchedEpisode: number | null;
  progressPercent: number;
  invitedAt: string;
  acceptedAt: string | null;
  progressUpdatedAt: string | null;
  completedAt: string | null;
};
export type SharedPlan = {
  id: string;
  provider: CatalogProvider;
  externalId: number;
  mediaType: CatalogMediaType;
  title: string;
  posterUrl: string | null;
  releaseYear: number | null;
  movieRuntimeMinutes: number | null;
  status: SharedPlanStatus;
  creator: PublicUser;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
};
export type SharedPlanDetail = SharedPlan & { participants: SharedPlanParticipant[] };
export type SharedPlanPage = {
  results: SharedPlan[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalResults: number;
};
export type CreateSharedPlanInput = {
  provider: CatalogProvider;
  externalId: number;
  mediaType: CatalogMediaType;
  usernames: string[];
};
