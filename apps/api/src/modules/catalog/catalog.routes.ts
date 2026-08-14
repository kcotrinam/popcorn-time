import { Router, type Router as RouterType } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { validateRequest } from '../../middlewares/validate-request.js';
import { catalogController } from './catalog.controller.js';
import {
  detailParamsSchema,
  tvSeasonParamsSchema,
  tvSeasonsParamsSchema,
  discoverQuerySchema,
  genresQuerySchema,
  searchQuerySchema,
} from './catalog.schemas.js';
const catalogLimiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? '0.0.0.0'),
  handler: (_req, res) =>
    res.status(429).json({
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many catalog requests. Please try again later.',
      },
    }),
});
export function createCatalogRouter(): RouterType {
  const router = Router();
  router.use('/catalog', catalogLimiter);
  router.get(
    '/catalog/tv/:id/seasons',
    validateRequest({ params: tvSeasonsParamsSchema }),
    catalogController.seasons,
  );
  router.get(
    '/catalog/tv/:id/seasons/:seasonNumber',
    validateRequest({ params: tvSeasonParamsSchema }),
    catalogController.seasonEpisodes,
  );
  router.get(
    '/catalog/search',
    validateRequest({ query: searchQuerySchema }),
    catalogController.search,
  );
  router.get(
    '/catalog/discover',
    validateRequest({ query: discoverQuerySchema }),
    catalogController.discover,
  );
  router.get(
    '/catalog/genres',
    validateRequest({ query: genresQuerySchema }),
    catalogController.genres,
  );
  router.get(
    '/catalog/:type/:id',
    validateRequest({ params: detailParamsSchema }),
    catalogController.detail,
  );
  return router;
}
