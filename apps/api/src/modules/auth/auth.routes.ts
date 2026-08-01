import { Router, type Router as RouterType } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { csrfProtection } from '../../middlewares/csrf.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { authController } from './auth.controller.js';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  tokenSchema,
} from './auth.schemas.js';

const ipLimiter = (max: number) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(req.ip ?? '0.0.0.0'),
    handler: (_req, res) =>
      res.status(429).json({
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many requests. Please try again later.',
        },
      }),
  });
const emailLimiter = (max: number) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    keyGenerator: (req) =>
      String(req.body?.email ?? '')
        .trim()
        .toLowerCase() || 'no-email',
    handler: (_req, res) =>
      res.status(429).json({
        error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests. Please try again later.' },
      }),
  });
export function createAuthRouter(): RouterType {
  const router = Router();
  router.get('/auth/csrf', authController.csrf);
  router.post(
    '/auth/register',
    ipLimiter(5),
    emailLimiter(5),
    validateRequest({ body: registerSchema }),
    authController.register,
  );
  router.post(
    '/auth/verify-email',
    validateRequest({ body: tokenSchema }),
    authController.verifyEmail,
  );
  router.post(
    '/auth/login',
    ipLimiter(10),
    emailLimiter(10),
    validateRequest({ body: loginSchema }),
    authController.login,
  );
  router.post('/auth/refresh', csrfProtection, authController.refresh);
  router.post('/auth/logout', csrfProtection, authController.logout);
  router.post(
    '/auth/forgot-password',
    ipLimiter(5),
    emailLimiter(5),
    validateRequest({ body: forgotPasswordSchema }),
    authController.forgotPassword,
  );
  router.post(
    '/auth/reset-password',
    validateRequest({ body: resetPasswordSchema }),
    authController.resetPassword,
  );
  router.get('/users/me', authController.me);
  return router;
}
