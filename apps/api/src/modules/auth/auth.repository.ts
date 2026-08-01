import type { Prisma, User } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

export const authRepository = {
  findUserByEmail: (emailNormalized: string) =>
    prisma.user.findUnique({ where: { emailNormalized } }),
  findUserById: (id: string) => prisma.user.findFirst({ where: { id, deletedAt: null } }),
  createUser: (data: Prisma.UserCreateInput) => prisma.user.create({ data }),
  verifyUser: (id: string) =>
    prisma.user.update({ where: { id }, data: { emailVerifiedAt: new Date() } }),
  updatePassword: (id: string, passwordHash: string) =>
    prisma.user.update({ where: { id }, data: { passwordHash } }),
  updateLastLogin: (id: string) =>
    prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } }),
  createVerificationToken: (userId: string, tokenHash: string, expiresAt: Date) =>
    prisma.emailVerificationToken.create({ data: { userId, tokenHash, expiresAt } }),
  findVerificationToken: (tokenHash: string) =>
    prisma.emailVerificationToken.findUnique({ where: { tokenHash }, include: { user: true } }),
  useVerificationToken: (id: string) =>
    prisma.emailVerificationToken.update({ where: { id }, data: { usedAt: new Date() } }),
  createResetToken: (userId: string, tokenHash: string, expiresAt: Date) =>
    prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } }),
  findResetToken: (tokenHash: string) =>
    prisma.passwordResetToken.findUnique({ where: { tokenHash }, include: { user: true } }),
  useResetToken: (id: string) =>
    prisma.passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } }),
  createSession: (data: Prisma.RefreshSessionUncheckedCreateInput) =>
    prisma.refreshSession.create({ data }),
  findSession: (tokenHash: string) =>
    prisma.refreshSession.findUnique({ where: { tokenHash }, include: { user: true } }),
  revokeSession: (id: string) =>
    prisma.refreshSession.update({ where: { id }, data: { revokedAt: new Date() } }),
  replaceSession: (id: string, replacementId: string) =>
    prisma.refreshSession.update({
      where: { id },
      data: { revokedAt: new Date(), replacedById: replacementId },
    }),
  revokeFamily: (familyId: string) =>
    prisma.refreshSession.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  revokeUserSessions: (userId: string) =>
    prisma.refreshSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
};
export type AuthUser = User;
