import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, { type Express, type Request } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { APP_NAME, API_VERSION } from '@popcorn-time/shared';
import { env } from './config/index.js';
import { openapiSpec } from './docs/openapi.js';
import { errorHandler } from './middlewares/error-handler.js';
import { notFound } from './middlewares/not-found.js';
import { requestId } from './middlewares/request-id.js';
import { logger } from './lib/logger.js';
import { createHealthRouter } from './modules/health/health.routes.js';
import { createAuthRouter } from './modules/auth/auth.routes.js';
import { createCatalogRouter } from './modules/catalog/catalog.routes.js';
import { createLibraryRouter } from './modules/library/library.routes.js';
import { createUsersRouter } from './modules/users/users.routes.js';
import { createRecommendationsRouter } from './modules/recommendations/recommendations.routes.js';
import { createSharedPlansRouter } from './modules/shared-plans/shared-plans.routes.js';

export function createApp(): Express {
  const app: Express = express();
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(requestId);
  app.use(pinoHttp({ logger, customProps: (req: Request) => ({ requestId: req.requestId }) }));
  const api = express.Router();
  api.get('/', (_req, res) =>
    res.json({ name: `${APP_NAME} API`, version: API_VERSION, status: 'running' }),
  );
  api.use(createHealthRouter());
  api.use(createAuthRouter());
  api.use(createCatalogRouter());
  api.use(createLibraryRouter());
  api.use(createUsersRouter());
  api.use(createRecommendationsRouter());
  api.use(createSharedPlansRouter());
  app.use(`/${env.API_PREFIX}`, api);
  app.get('/api/docs/openapi.json', (_req, res) => res.json(openapiSpec));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
export const app: Express = createApp();
