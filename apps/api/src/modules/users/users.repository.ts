import { prisma } from '../../lib/prisma.js';
export const usersRepository = {
  findActiveVerifiedByUsername: (usernameNormalized: string, excludedId: string) =>
    prisma.user.findFirst({
      where: {
        usernameNormalized,
        id: { not: excludedId },
        deletedAt: null,
        emailVerifiedAt: { not: null },
      },
      select: { username: true, displayName: true, avatarUrl: true },
    }),
  setupUsername: (id: string, username: string, usernameNormalized: string) =>
    prisma.user.updateMany({
      where: { id, username: null, deletedAt: null },
      data: { username, usernameNormalized },
    }),
};
