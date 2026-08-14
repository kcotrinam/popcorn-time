import type { NotificationPage, UnreadNotificationCount } from '@popcorn-time/shared';
import { deleteJson, getJson, patchJson, postJson } from '@/services/http-client';
export const getNotifications = (filter: 'all' | 'unread', page: number, signal?: AbortSignal) =>
  getJson<NotificationPage>('/notifications', { signal, query: { filter, page, pageSize: 20 } });
export const getUnreadNotificationCount = (signal?: AbortSignal) =>
  getJson<UnreadNotificationCount>('/notifications/unread-count', { signal });
export const markNotificationRead = (id: string) =>
  patchJson<void>(`/notifications/${id}/read`, {});
export const markAllNotificationsRead = () => postJson<void>('/notifications/read-all');
export const deleteNotification = (id: string) => deleteJson(`/notifications/${id}`);
export const clearReadNotifications = () => deleteJson('/notifications/read');
