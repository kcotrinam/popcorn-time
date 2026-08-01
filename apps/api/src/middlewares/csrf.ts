import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';
import { env } from '../config/index.js';
import { AppError } from '../errors/app-error.js';
import { ErrorCode } from '../errors/error-codes.js';

export const csrfCookieName = 'pt_csrf';
export function setCsrfCookie(res: Parameters<RequestHandler>[1]) {
  const value = randomBytes(32).toString('base64url');
  res.cookie(csrfCookieName, value, {
    httpOnly: false,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    domain: env.COOKIE_DOMAIN,
    path: '/',
  });
  return value;
}
export const csrfProtection: RequestHandler = (req, _res, next) => {
  const origin = req.header('origin');
  if (origin && origin !== env.WEB_URL)
    return next(new AppError(403, ErrorCode.FORBIDDEN, 'Invalid request origin'));
  const cookie = req.cookies?.[csrfCookieName];
  const header = req.header('x-csrf-token');
  if (
    typeof cookie !== 'string' ||
    typeof header !== 'string' ||
    cookie.length !== header.length ||
    !timingSafeEqual(Buffer.from(cookie), Buffer.from(header))
  )
    return next(new AppError(403, ErrorCode.FORBIDDEN, 'CSRF validation failed'));
  next();
};
