import { createHash, randomBytes, randomUUID } from 'node:crypto';
import argon2 from 'argon2';
import { SignJWT, jwtVerify } from 'jose';
import type { User } from '@prisma/client';
import { env } from '../../config/index.js';
import { AppError } from '../../errors/app-error.js';
import { ErrorCode } from '../../errors/error-codes.js';
import { logger } from '../../lib/logger.js';
import { authRepository } from './auth.repository.js';
import type { RegisterInput } from './auth.schemas.js';

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const generic = 'If the account is eligible, an email will be sent shortly.';
const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
const rawToken = () => randomBytes(32).toString('base64url');
const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizeUsername = (username: string) => username.trim().toLowerCase();
const safeUser = (user: User) => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  avatarUrl: user.avatarUrl,
  username: user.username,
  preferredLanguage: user.preferredLanguage,
  theme: user.theme,
});

export type Mailer = {
  sendVerification(email: string, token: string): Promise<void>;
  sendReset(email: string, token: string): Promise<void>;
};
export const mailer: Mailer = {
  async sendVerification(email, token) {
    if (!env.RESEND_API_KEY) return;
    const { Resend } = await import('resend');
    const result = await new Resend(env.RESEND_API_KEY).emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: 'Verify your Popcorn Time email',
      html: `<p><a href="${env.WEB_URL}/verify-email?token=${encodeURIComponent(token)}">Verify email</a></p>`,
    });
    if (result.error) {
      logger.error({ resendError: result.error.name }, 'Unable to send verification email');
      throw new AppError(503, ErrorCode.SERVICE_UNAVAILABLE, 'Unable to send verification email');
    }
  },
  async sendReset(email, token) {
    if (!env.RESEND_API_KEY) return;
    const { Resend } = await import('resend');
    const result = await new Resend(env.RESEND_API_KEY).emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: 'Reset your Popcorn Time password',
      html: `<p><a href="${env.WEB_URL}/reset-password?token=${encodeURIComponent(token)}">Reset password</a></p>`,
    });
    if (result.error) {
      logger.error({ resendError: result.error.name }, 'Unable to send password reset email');
      throw new AppError(503, ErrorCode.SERVICE_UNAVAILABLE, 'Unable to send password reset email');
    }
  },
};

async function createAndSendVerificationToken(user: User) {
  const token = rawToken();
  await authRepository.createVerificationToken(
    user.id,
    tokenHash(token),
    new Date(Date.now() + 24 * 60 * 60 * 1000),
  );
  await mailer.sendVerification(user.email, token);
}

async function accessToken(user: User) {
  return new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(accessSecret);
}
export const authService = {
  genericMessage: generic,
  hashPassword: (password: string) => argon2.hash(password, { type: argon2.argon2id }),
  async register(input: RegisterInput) {
    const emailNormalized = normalizeEmail(input.email);
    const existing = await authRepository.findUserByEmail(emailNormalized);
    if (existing) {
      if (!existing.deletedAt && !existing.emailVerifiedAt)
        await createAndSendVerificationToken(existing);
      return generic;
    }
    const user = await authRepository.createUser({
      email: input.email.trim(),
      emailNormalized,
      passwordHash: await this.hashPassword(input.password),
      displayName: input.displayName,
      username: input.username.trim(),
      usernameNormalized: normalizeUsername(input.username),
    });
    await createAndSendVerificationToken(user);
    return generic;
  },
  async verifyEmail(token: string) {
    const record = await authRepository.findVerificationToken(tokenHash(token));
    if (!record || record.usedAt || record.expiresAt <= new Date())
      throw new AppError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'Verification link is invalid or expired',
      );
    await authRepository.useVerificationToken(record.id);
    if (!record.user.emailVerifiedAt) await authRepository.verifyUser(record.userId);
  },
  async login(email: string, password: string, context: { ip?: string; userAgent?: string }) {
    const user = await authRepository.findUserByEmail(normalizeEmail(email));
    if (
      !user ||
      user.deletedAt ||
      !user.emailVerifiedAt ||
      !(await argon2.verify(user.passwordHash, password))
    )
      throw new AppError(401, ErrorCode.UNAUTHORIZED, 'Invalid email or password');
    await authRepository.updateLastLogin(user.id);
    return this.createSession(user, context);
  },
  async createSession(
    user: User,
    context: { ip?: string; userAgent?: string },
    familyId: string = randomUUID(),
  ) {
    const refresh = rawToken();
    const session = await authRepository.createSession({
      userId: user.id,
      familyId: familyId as `${string}-${string}-${string}-${string}-${string}`,
      tokenHash: tokenHash(refresh),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ipAddress: context.ip,
      userAgent: context.userAgent,
    });
    return {
      accessToken: await accessToken(user),
      refreshToken: refresh,
      user: safeUser(user),
      session,
    };
  },
  async refresh(refresh: string, context: { ip?: string; userAgent?: string }) {
    const session = await authRepository.findSession(tokenHash(refresh));
    if (!session || session.expiresAt <= new Date())
      throw new AppError(401, ErrorCode.UNAUTHORIZED, 'Session is invalid');
    if (session.revokedAt || session.replacedById) {
      await authRepository.revokeFamily(session.familyId);
      throw new AppError(401, ErrorCode.UNAUTHORIZED, 'Session is invalid');
    }
    const next = await this.createSession(session.user, context, session.familyId);
    await authRepository.replaceSession(session.id, next.session.id);
    return next;
  },
  async logout(refresh?: string) {
    if (!refresh) return;
    const session = await authRepository.findSession(tokenHash(refresh));
    if (session && !session.revokedAt) await authRepository.revokeSession(session.id);
  },
  async forgotPassword(email: string) {
    const user = await authRepository.findUserByEmail(normalizeEmail(email));
    if (user && user.emailVerifiedAt && !user.deletedAt) {
      const token = rawToken();
      await authRepository.createResetToken(
        user.id,
        tokenHash(token),
        new Date(Date.now() + 60 * 60 * 1000),
      );
      await mailer.sendReset(user.email, token);
    }
    return generic;
  },
  async resetPassword(token: string, password: string) {
    const record = await authRepository.findResetToken(tokenHash(token));
    if (!record || record.usedAt || record.expiresAt <= new Date())
      throw new AppError(400, ErrorCode.VALIDATION_ERROR, 'Reset link is invalid or expired');
    await authRepository.useResetToken(record.id);
    await authRepository.updatePassword(record.userId, await this.hashPassword(password));
    await authRepository.revokeUserSessions(record.userId);
  },
  async authenticate(access: string | undefined) {
    if (!access) throw new AppError(401, ErrorCode.UNAUTHORIZED, 'Authentication required');
    try {
      const result = await jwtVerify(access, accessSecret);
      const id = result.payload.sub;
      if (!id) throw new Error('Missing subject');
      const user = await authRepository.findUserById(id);
      if (!user || !user.emailVerifiedAt) throw new Error('Missing user');
      return safeUser(user);
    } catch {
      throw new AppError(401, ErrorCode.UNAUTHORIZED, 'Authentication required');
    }
  },
};
