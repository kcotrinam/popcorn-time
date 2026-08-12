import { Router, type Router as RouterType } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { csrfProtection } from '../../middlewares/csrf.js';
import { requireAuthentication } from '../../middlewares/require-authentication.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { recommendationsController } from './recommendations.controller.js';
import {
  createRecommendationSchema,
  recommendationParamsSchema,
  recommendationQuerySchema,
} from './recommendations.schemas.js';
const limiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? '0.0.0.0'),
});
export function createRecommendationsRouter(): RouterType {
  const router = Router();
  router.get(
    '/recommendations',
    requireAuthentication,
    validateRequest({ query: recommendationQuerySchema }),
    recommendationsController.list,
  );
  router.post(
    '/recommendations',
    requireAuthentication,
    csrfProtection,
    limiter,
    validateRequest({ body: createRecommendationSchema }),
    recommendationsController.create,
  );
  router.post(
    '/recommendations/:id/accept',
    requireAuthentication,
    csrfProtection,
    validateRequest({ params: recommendationParamsSchema }),
    recommendationsController.accept,
  );
  router.delete(
    '/recommendations/:id',
    requireAuthentication,
    csrfProtection,
    validateRequest({ params: recommendationParamsSchema }),
    recommendationsController.reject,
  );
  return router;
}
