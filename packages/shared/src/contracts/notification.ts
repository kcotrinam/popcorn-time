import type { PublicUser } from './recommendation.js';
export type NotificationType =
  | 'RECOMMENDATION_RECEIVED'
  | 'RECOMMENDATION_ACCEPTED'
  | 'SHARED_PLAN_INVITATION_RECEIVED'
  | 'SHARED_PLAN_INVITATION_ACCEPTED'
  | 'SHARED_PLAN_MEMBER_LEFT'
  | 'SHARED_PLAN_MEMBER_REMOVED'
  | 'SHARED_PLAN_PARTICIPANT_COMPLETED'
  | 'SHARED_PLAN_COMPLETED'
  | 'SHARED_PLAN_CANCELLED';
export type NotificationActor = PublicUser | null;
export type NotificationResource =
  | { kind: 'recommendation'; recommendationId: string | null }
  | { kind: 'shared-plan'; sharedPlanId: string | null; accessible: boolean };
export type NotificationItem = {
  id: string;
  type: NotificationType;
  actor: NotificationActor;
  resource: NotificationResource;
  contentTitle: string;
  readAt: string | null;
  createdAt: string;
};
export type NotificationPage = {
  results: NotificationItem[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalResults: number;
  unreadCount: number;
};
export type UnreadNotificationCount = { unreadCount: number };
