import type { CreateSharedPlanInput, SharedPlanDetail, SharedPlanPage } from '@popcorn-time/shared';
import { deleteJson, getJson, postJson, putJson } from '@/services/http-client';
export const getSharedPlans = (view: 'invitations' | 'active' | 'history', signal?: AbortSignal) =>
  getJson<SharedPlanPage>('/shared-plans', { signal, query: { view, page: 1, pageSize: 30 } });
export const getSharedPlan = (id: string, signal?: AbortSignal) =>
  getJson<SharedPlanDetail>(`/shared-plans/${id}`, { signal });
export const createSharedPlan = (input: CreateSharedPlanInput) =>
  postJson<SharedPlanDetail>('/shared-plans', input);
export const acceptSharedPlan = (id: string) =>
  postJson<SharedPlanDetail>(`/shared-plans/${id}/accept`);
export const declineOrLeaveSharedPlan = (id: string) =>
  deleteJson(`/shared-plans/${id}/participants/me`);
export const updateSharedProgress = (
  id: string,
  input: { movieMinute?: number; currentSeason?: number; lastWatchedEpisode?: number },
) => putJson<SharedPlanDetail>(`/shared-plans/${id}/progress`, input);
export const completeSharedPlan = (
  id: string,
  input: { watchedAt: Date; rating: number | null; comment: string | null },
) => postJson<SharedPlanDetail>(`/shared-plans/${id}/complete`, input);
export const cancelSharedPlan = (id: string) =>
  postJson<SharedPlanDetail>(`/shared-plans/${id}/cancel`);
export const inviteToSharedPlan = (id: string, usernames: string[]) =>
  postJson<SharedPlanDetail>(`/shared-plans/${id}/invitations`, { usernames });
