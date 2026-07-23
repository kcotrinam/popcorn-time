import { APP_NAME } from '@popcorn-time/shared';
import { errorSchema } from './components/error.schema.js';
import { healthSchema } from './components/health.schema.js';
import { healthPath } from './paths/health.path.js';
import { rootPath } from './paths/root.path.js';
export const openapiSpec = { openapi: '3.1.0', info: { title: `${APP_NAME} API`, version: '1.0.0', description: 'REST API for the Popcorn Time personal media library' }, servers: [{ url: 'http://localhost:3000' }], paths: { '/api/v1': rootPath, '/api/v1/health': healthPath }, components: { schemas: { ErrorResponse: errorSchema, HealthResponse: healthSchema } } };
