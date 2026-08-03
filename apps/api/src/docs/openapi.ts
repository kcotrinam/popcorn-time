import { APP_NAME } from '@popcorn-time/shared';
import { errorSchema } from './components/error.schema.js';
import { healthSchema } from './components/health.schema.js';
import { healthPath } from './paths/health.path.js';
import { rootPath } from './paths/root.path.js';
export const openapiSpec = {
  openapi: '3.1.0',
  info: {
    title: `${APP_NAME} API`,
    version: '1.0.0',
    description: 'REST API for the Popcorn Time personal media library',
  },
  servers: [{ url: 'http://localhost:3000' }],
  paths: {
    '/api/v1': rootPath,
    '/api/v1/health': healthPath,
    '/api/v1/auth/csrf': {
      get: { summary: 'Create a CSRF token', responses: { '200': { description: 'CSRF token' } } },
    },
    '/api/v1/auth/register': {
      post: {
        summary: 'Register an account',
        responses: { '202': { description: 'Generic registration response' } },
      },
    },
    '/api/v1/auth/login': {
      post: {
        summary: 'Sign in',
        responses: {
          '200': { description: 'Session cookies set' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/v1/auth/refresh': {
      post: {
        summary: 'Rotate refresh session',
        responses: { '200': { description: 'Session cookies rotated' } },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        summary: 'Revoke current session',
        responses: { '204': { description: 'Logged out' } },
      },
    },
    '/api/v1/auth/verify-email': {
      post: { summary: 'Verify email token', responses: { '204': { description: 'Verified' } } },
    },
    '/api/v1/auth/forgot-password': {
      post: {
        summary: 'Request password reset',
        responses: { '202': { description: 'Generic response' } },
      },
    },
    '/api/v1/auth/reset-password': {
      post: { summary: 'Reset password', responses: { '204': { description: 'Password reset' } } },
    },
    '/api/v1/users/me': {
      get: {
        summary: 'Get current user',
        responses: {
          '200': { description: 'Current user' },
          '401': { description: 'Unauthenticated' },
        },
      },
    },
    '/api/v1/catalog/search': {
      get: {
        summary: 'Search the public catalog',
        parameters: [
          {
            name: 'query',
            in: 'query',
            required: true,
            schema: { type: 'string', minLength: 2, maxLength: 100 },
          },
          {
            name: 'type',
            in: 'query',
            schema: { type: 'string', enum: ['all', 'movie', 'tv'], default: 'all' },
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 500, default: 1 },
          },
        ],
        responses: {
          '200': { description: 'Normalized catalog page' },
          '400': { description: 'Invalid query' },
          '503': { description: 'TMDB unavailable' },
        },
      },
    },
    '/api/v1/catalog/discover': {
      get: {
        summary: 'Discover public catalog content',
        parameters: [
          {
            name: 'type',
            in: 'query',
            schema: { type: 'string', enum: ['all', 'movie', 'tv'], default: 'all' },
          },
          { name: 'genreId', in: 'query', schema: { type: 'integer' } },
          { name: 'year', in: 'query', schema: { type: 'integer' } },
          { name: 'minRating', in: 'query', schema: { type: 'number', minimum: 0, maximum: 10 } },
          {
            name: 'sort',
            in: 'query',
            schema: {
              type: 'string',
              enum: [
                'popularity.desc',
                'popularity.asc',
                'vote_average.desc',
                'primary_release_date.desc',
              ],
            },
          },
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string', enum: ['anime', 'documentary'] },
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 500, default: 1 },
          },
        ],
        responses: {
          '200': { description: 'Normalized catalog page; all-type pagination is an aggregation' },
          '400': { description: 'Invalid query' },
          '503': { description: 'TMDB unavailable' },
        },
      },
    },
    '/api/v1/catalog/genres': {
      get: {
        summary: 'List normalized TMDB genres',
        parameters: [
          {
            name: 'type',
            in: 'query',
            required: true,
            schema: { type: 'string', enum: ['movie', 'tv'] },
          },
        ],
        responses: {
          '200': { description: 'Catalog genres' },
          '400': { description: 'Invalid query' },
          '503': { description: 'TMDB unavailable' },
        },
      },
    },
    '/api/v1/catalog/{type}/{id}': {
      get: {
        summary: 'Get normalized catalog detail',
        parameters: [
          {
            name: 'type',
            in: 'path',
            required: true,
            schema: { type: 'string', enum: ['movie', 'tv'] },
          },
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': { description: 'Normalized catalog detail' },
          '404': { description: 'Content not found' },
          '503': { description: 'TMDB unavailable' },
        },
      },
    },
  },
  components: { schemas: { ErrorResponse: errorSchema, HealthResponse: healthSchema } },
};
