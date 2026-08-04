import { Prisma, type UserMediaStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import type { CreateLibraryItemInput, LibraryQuery } from './library.schemas.js';
import type { LibraryMembershipQuery } from './library.schemas.js';

export const libraryRepository = {
  findOwned: (userId: string, id: string) => prisma.userMedia.findFirst({ where: { id, userId } }),
  findExisting: (userId: string, input: CreateLibraryItemInput) =>
    prisma.userMedia.findUnique({
      where: {
        userId_provider_externalId_mediaType: {
          userId,
          provider: input.provider,
          externalId: input.externalId,
          mediaType: input.mediaType,
        },
      },
    }),
  create: (data: Prisma.UserMediaUncheckedCreateInput) => prisma.userMedia.create({ data }),
  updateStatus: (id: string, status: UserMediaStatus, watchedAt: Date | null) =>
    prisma.userMedia.update({ where: { id }, data: { status, watchedAt } }),
  delete: (id: string) => prisma.userMedia.delete({ where: { id } }),
  findMemberships: (userId: string, query: LibraryMembershipQuery) =>
    prisma.userMedia.findMany({
      where: {
        userId,
        provider: query.provider,
        OR: query.items.map((item) => ({
          mediaType: item.mediaType,
          externalId: item.externalId,
        })),
      },
      select: { id: true, externalId: true, mediaType: true, status: true },
    }),
  list: (userId: string, query: LibraryQuery) => {
    const where: Prisma.UserMediaWhereInput = {
      userId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.mediaType ? { mediaType: query.mediaType } : {}),
      ...(query.query ? { title: { contains: query.query, mode: 'insensitive' } } : {}),
      ...(query.genreId ? { genreIds: { has: query.genreId } } : {}),
      ...(query.year ? { releaseYear: query.year } : {}),
    };
    const orderBy: Prisma.UserMediaOrderByWithRelationInput =
      query.sort === 'addedAt.asc'
        ? { createdAt: 'asc' }
        : query.sort === 'title.asc'
          ? { title: 'asc' }
          : query.sort === 'releaseYear.desc'
            ? { releaseYear: 'desc' }
            : query.sort === 'watchedAt.desc'
              ? { watchedAt: 'desc' }
              : { createdAt: 'desc' };
    return prisma.$transaction([
      prisma.userMedia.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.userMedia.count({ where }),
    ]);
  },
};
