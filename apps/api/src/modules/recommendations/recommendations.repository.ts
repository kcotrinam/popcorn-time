import { Prisma, type RecommendationStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import type { RecommendationQuery } from './recommendations.schemas.js';
const identity = { select: { username: true, displayName: true, avatarUrl: true } } as const;
export const recommendationsRepository = {
  findRecipient: (username: string) =>
    prisma.user.findFirst({
      where: { usernameNormalized: username, deletedAt: null, emailVerifiedAt: { not: null } },
    }),
  create: (data: Prisma.RecommendationUncheckedCreateInput) =>
    prisma.recommendation.create({ data, include: { recipient: identity } }),
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
    prisma.recommendation.deleteMany({ where: { id, recipientId, status: 'PENDING' } }),
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
      return { recommendation: updated, libraryItem, created: !existing };
    }),
};
