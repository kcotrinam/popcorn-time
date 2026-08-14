import type {
  NotificationItem,
  NotificationPage,
  UnreadNotificationCount,
} from '@popcorn-time/shared';
import { AppError } from '../../errors/app-error.js';
import { ErrorCode } from '../../errors/error-codes.js';
import { notificationsRepository } from './notifications.repository.js';
import type { NotificationQuery } from './notifications.schemas.js';
const item = (value: {
  id: string;
  type: string;
  recommendationId: string | null;
  sharedPlanId: string | null;
  contentTitle: string;
  readAt: Date | null;
  createdAt: Date;
  actor: { username: string | null; displayName: string; avatarUrl: string | null } | null;
}): NotificationItem => ({
  id: value.id,
  type: value.type as NotificationItem['type'],
  actor: value.actor
    ? {
        username: value.actor.username ?? '',
        displayName: value.actor.displayName,
        avatarUrl: value.actor.avatarUrl,
      }
    : null,
  resource: value.recommendationId
    ? { kind: 'recommendation', recommendationId: value.recommendationId }
    : {
        kind: 'shared-plan',
        sharedPlanId: value.sharedPlanId,
        accessible: value.type !== 'SHARED_PLAN_MEMBER_REMOVED',
      },
  contentTitle: value.contentTitle,
  readAt: value.readAt?.toISOString() ?? null,
  createdAt: value.createdAt.toISOString(),
});
export const notificationsService = {
  async list(userId: string, query: NotificationQuery): Promise<NotificationPage> {
    const [rows, totalResults, unreadCount] = await notificationsRepository.list(userId, query);
    return {
      results: rows.map(item),
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.max(1, Math.ceil(totalResults / query.pageSize)),
      totalResults,
      unreadCount,
    };
  },
  async unreadCount(userId: string): Promise<UnreadNotificationCount> {
    return { unreadCount: await notificationsRepository.unreadCount(userId) };
  },
  async markRead(userId: string, id: string) {
    const result = await notificationsRepository.markRead(userId, id);
    if (!result.count && !(await notificationsRepository.exists(userId, id)))
      throw new AppError(404, ErrorCode.NOT_FOUND, 'Notification was not found');
  },
  markAllRead: (userId: string) => notificationsRepository.markAllRead(userId),
  async deleteOne(userId: string, id: string) {
    if (!(await notificationsRepository.deleteOne(userId, id)).count)
      throw new AppError(404, ErrorCode.NOT_FOUND, 'Notification was not found');
  },
  clearRead: (userId: string) => notificationsRepository.clearRead(userId),
};
