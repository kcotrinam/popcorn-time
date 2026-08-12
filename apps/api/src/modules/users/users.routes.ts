import { Router, type Router as RouterType } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { csrfProtection } from '../../middlewares/csrf.js';
import { requireAuthentication } from '../../middlewares/require-authentication.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { usersController } from './users.controller.js';
import { lookupUsernameSchema, setupUsernameSchema } from './users.schemas.js';
const limiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? '0.0.0.0'),
});
export function createUsersRouter(): RouterType {
  const router = Router();
  router.put(
    '/users/me/username',
    requireAuthentication,
    csrfProtection,
    validateRequest({ body: setupUsernameSchema }),
    usersController.setupUsername,
  );
  router.get(
    '/users/lookup',
    requireAuthentication,
    limiter,
    validateRequest({ query: lookupUsernameSchema }),
    usersController.lookup,
  );
  return router;
}
