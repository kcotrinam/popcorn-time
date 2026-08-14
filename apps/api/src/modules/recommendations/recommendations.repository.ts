import { Prisma, type RecommendationStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import type { RecommendationQuery } from './recommendations.schemas.js';
import { createNotification } from '../notifications/notification-events.js';
const identity = { select: { username: true, displayName: true, avatarUrl: true } } as const;
export const recommendationsRepository = {
  findRecipient: (username: string) =>
    prisma.user.findFirst({
      where: { usernameNormalized: username, deletedAt: null, emailVerifiedAt: { not: null } },
    }),
  create: (data: Prisma.RecommendationUncheckedCreateInput) =>
    prisma.$transaction(async (tx) => {
      const recommendation = await tx.recommendation.create({
        data,
        include: { recipient: identity },
      });
      await createNotification(tx, {
        recipientId: data.recipientId,
        actorId: data.senderId,
        type: 'RECOMMENDATION_RECEIVED',
        recommendationId: recommendation.id,
        contentTitle: recommendation.title,
        deduplicationKey: `recommendation:received:${recommendation.id}`,
      });
      return recommendation;
    }),
  list: (userId: string, query: RecommendationQuery) => {
    const where: Prisma.RecommendationWhereInput = {
      [query.direction === 'received' ? 'recipientId' : 'senderId']: userId,
      ...(query.status ? { status: query.status } : {}),
    };
    return prisma.$transaction([
      prisma.recommendation.findMany({
        where,
        include: query.direction === 'received' ? { sender: identity } : { recipient: identity },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.recommendation.count({ where }),
    ]);
  },
  findAccessible: (id: string, userId: string) =>
    prisma.recommendation.findFirst({
      where: { id, OR: [{ senderId: userId }, { recipientId: userId }] },
      include: { sender: identity, recipient: identity },
    }),
  reject: (id: string, recipientId: string) =>
    prisma.$transaction(async (tx) => {
      const recommendation = await tx.recommendation.findFirst({
        where: { id, recipientId, status: 'PENDING' },
      });
      if (!recommendation) return { count: 0 };
      await tx.notification.deleteMany({
        where: { recommendationId: id, type: 'RECOMMENDATION_RECEIVED', recipientId },
      });
      await tx.recommendation.delete({ where: { id } });
      return { count: 1 };
    }),
  accept: (id: string, recipientId: string) =>
    prisma.$transaction(async (tx) => {
      const recommendation = await tx.recommendation.findFirst({
        where: { id, recipientId },
        include: { sender: identity, recipient: identity },
      });
      if (!recommendation) return null;
      const existing = await tx.userMedia.findUnique({
        where: {
          userId_provider_externalId_mediaType: {
            userId: recipientId,
            provider: recommendation.provider,
            externalId: recommendation.externalId,
            mediaType: recommendation.mediaType,
          },
        },
      });
      const libraryItem =
        existing ??
        (await tx.userMedia.create({
          data: {
            userId: recipientId,
            provider: recommendation.provider,
            externalId: recommendation.externalId,
            mediaType: recommendation.mediaType,
            title: recommendation.title,
            posterUrl: recommendation.posterUrl,
            releaseYear: recommendation.releaseYear,
            genreIds: [],
          },
        }));
      const updated =
        recommendation.status === 'ACCEPTED'
          ? recommendation
          : await tx.recommendation.update({
              where: { id },
              data: { status: 'ACCEPTED' as RecommendationStatus, acceptedAt: new Date() },
              include: { sender: identity, recipient: identity },
            });
      if (recommendation.status !== 'ACCEPTED')
        await createNotification(tx, {
          recipientId: recommendation.senderId,
          actorId: recipientId,
          type: 'RECOMMENDATION_ACCEPTED',
          recommendationId: recommendation.id,
          contentTitle: recommendation.title,
          deduplicationKey: `recommendation:accepted:${recommendation.id}`,
        });
      return { recommendation: updated, libraryItem, created: !existing };
    }),
};
