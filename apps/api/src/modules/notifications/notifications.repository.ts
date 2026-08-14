import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import type { NotificationQuery } from './notifications.schemas.js';
const identity = { select: { username: true, displayName: true, avatarUrl: true } } as const;
export const notificationsRepository = {
  list(userId: string, query: NotificationQuery) {
    const where: Prisma.NotificationWhereInput = {
      recipientId: userId,
      ...(query.filter === 'unread' ? { readAt: null } : {}),
    };
    return prisma.$transaction([
      prisma.notification.findMany({
        where,
        include: { actor: identity },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { recipientId: userId, readAt: null } }),
    ]);
  },
  unreadCount: (userId: string) =>
    prisma.notification.count({ where: { recipientId: userId, readAt: null } }),
  markRead: (userId: string, id: string) =>
    prisma.notification.updateMany({
      where: { id, recipientId: userId, readAt: null },
      data: { readAt: new Date() },
    }),
  exists: (userId: string, id: string) =>
    prisma.notification.findFirst({ where: { id, recipientId: userId }, select: { id: true } }),
  markAllRead: (userId: string) =>
    prisma.notification.updateMany({
      where: { recipientId: userId, readAt: null },
      data: { readAt: new Date() },
    }),
  deleteOne: (userId: string, id: string) =>
    prisma.notification.deleteMany({ where: { id, recipientId: userId } }),
  clearRead: (userId: string) =>
    prisma.notification.deleteMany({ where: { recipientId: userId, readAt: { not: null } } }),
};
