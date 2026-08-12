import type { AcceptRecommendationResult, RecommendationPage } from '@popcorn-time/shared';
import { deleteJson, getJson, postJson, type QueryParams } from '@/services/http-client';
export const lookupUsername = (username: string, signal?: AbortSignal) =>
  getJson<{ user: { username: string; displayName: string; avatarUrl: string | null } | null }>(
    '/users/lookup',
    { signal, query: { username } },
  );
export const setupUsername = (username: string) =>
  import('@/services/http-client').then(({ putJson }) =>
    putJson<{ username: string }>('/users/me/username', { username }),
  );
export const createRecommendation = (input: {
  recipientUsername: string;
  provider: 'tmdb';
  externalId: number;
  mediaType: 'movie' | 'tv';
}) => postJson('/recommendations', input);
export const getRecommendations = (
  filters: {
    direction: 'received' | 'sent';
    status?: 'PENDING' | 'ACCEPTED';
    page: number;
    pageSize: number;
  },
  signal?: AbortSignal,
) => getJson<RecommendationPage>('/recommendations', { signal, query: filters as QueryParams });
export const acceptRecommendation = (id: string) =>
  postJson<AcceptRecommendationResult>(`/recommendations/${id}/accept`);
export const rejectRecommendation = (id: string) => deleteJson(`/recommendations/${id}`);
