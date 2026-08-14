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
    '/api/v1/users/me/username': {
      put: {
        summary: 'Set a username once for the authenticated account',
        responses: {
          '200': { description: 'Username set' },
          '403': { description: 'CSRF failed' },
          '409': { description: 'Already set or unavailable' },
        },
      },
    },
    '/api/v1/users/lookup': {
      get: {
        summary: 'Look up one active verified user by exact username',
        parameters: [{ name: 'username', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Public display identity or null' },
          '429': { description: 'Rate limited' },
        },
      },
    },
    '/api/v1/recommendations': {
      get: {
        summary: 'List sent or received private recommendations',
        responses: { '200': { description: 'Paginated recommendations' } },
      },
      post: {
        summary: 'Send a private TMDB recommendation',
        responses: {
          '201': { description: 'Created' },
          '403': { description: 'CSRF failed' },
          '409': { description: 'Duplicate recommendation' },
        },
      },
    },
    '/api/v1/recommendations/{id}/accept': {
      post: {
        summary: 'Accept a received recommendation into Pending',
        responses: {
          '200': { description: 'Accepted with library result' },
          '403': { description: 'CSRF failed' },
          '404': { description: 'Not received' },
        },
      },
    },
    '/api/v1/recommendations/{id}': {
      delete: {
        summary: 'Decline a received pending recommendation',
        responses: {
          '204': { description: 'Deleted' },
          '403': { description: 'CSRF failed' },
          '404': { description: 'Not pending or not received' },
        },
      },
    },
    '/api/v1/notifications': {
      get: {
        summary: 'List the authenticated recipient notification inbox',
        responses: { '200': { description: 'Paginated notifications' } },
      },
    },
    '/api/v1/notifications/unread-count': {
      get: {
        summary: 'Get the authenticated recipient unread notification count',
        responses: { '200': { description: 'Unread count' } },
      },
    },
    '/api/v1/notifications/{id}/read': {
      patch: {
        summary: 'Mark one notification as read',
        responses: {
          '204': { description: 'Marked read' },
          '403': { description: 'CSRF failed' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/v1/notifications/read-all': {
      post: {
        summary: 'Mark all recipient notifications as read',
        responses: { '204': { description: 'Marked read' }, '403': { description: 'CSRF failed' } },
      },
    },
    '/api/v1/notifications/read': {
      delete: {
        summary: 'Clear recipient read notifications',
        responses: { '204': { description: 'Cleared' }, '403': { description: 'CSRF failed' } },
      },
    },
    '/api/v1/notifications/{id}': {
      delete: {
        summary: 'Delete one recipient notification',
        responses: {
          '204': { description: 'Deleted' },
          '403': { description: 'CSRF failed' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/v1/users/me/library': {
      get: {
        summary: 'List the authenticated user library',
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['WATCHLIST', 'WATCHED'] },
          },
          { name: 'mediaType', in: 'query', schema: { type: 'string', enum: ['movie', 'tv'] } },
          { name: 'query', in: 'query', schema: { type: 'string' } },
          { name: 'genreId', in: 'query', schema: { type: 'integer' } },
          {
            name: 'categories',
            in: 'query',
            description: 'Comma-separated manual categories; matching uses OR semantics.',
            schema: { type: 'string', example: 'Anime,Family' },
          },
          { name: 'year', in: 'query', schema: { type: 'integer' } },
          {
            name: 'sort',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['addedAt.desc', 'addedAt.asc', 'title.asc', 'releaseYear.desc'],
            },
          },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', maximum: 50 } },
        ],
        responses: {
          '200': { description: 'Paginated library items' },
          '401': { description: 'Unauthenticated' },
          '400': { description: 'Invalid query' },
        },
      },
      post: {
        summary: 'Add a TMDB item to the Pending library',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['provider', 'externalId', 'mediaType'],
                properties: {
                  provider: { type: 'string', enum: ['tmdb'] },
                  externalId: { type: 'integer' },
                  mediaType: { type: 'string', enum: ['movie', 'tv'] },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Created' },
          '200': { description: 'Already exists' },
          '401': { description: 'Unauthenticated' },
          '403': { description: 'CSRF failed' },
          '400': { description: 'Invalid request' },
          '409': {
            description:
              'An exact catalog match exists or multiple exact catalog matches require user selection',
          },
          '503': { description: 'Catalog verification is unavailable; no manual item was created' },
        },
      },
    },
    '/api/v1/users/me/library/manual': {
      post: {
        summary: 'Add private manual content to the authenticated user library',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'mediaType', 'categories', 'status'],
                properties: {
                  title: { type: 'string', maxLength: 500 },
                  originalTitle: { type: 'string', maxLength: 500 },
                  mediaType: { type: 'string', enum: ['movie', 'tv'] },
                  releaseYear: { type: 'integer' },
                  originalLanguage: { type: 'string' },
                  nationality: { type: 'string' },
                  synopsis: { type: 'string', maxLength: 5000 },
                  posterUrl: { type: 'string', format: 'uri', pattern: '^https://' },
                  categories: {
                    type: 'array',
                    items: {
                      type: 'string',
                      enum: ['Anime', 'Documentary', 'Experimental', 'Indie', 'Family'],
                    },
                  },
                  status: { type: 'string', enum: ['WATCHLIST', 'WATCHED'] },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Created private manual library item' },
          '401': { description: 'Unauthenticated' },
          '403': { description: 'CSRF failed' },
          '400': { description: 'Invalid request' },
        },
      },
    },
    '/api/v1/users/me/library/membership': {
      get: {
        summary: 'Check authenticated user library membership for catalog items',
        parameters: [
          {
            name: 'provider',
            in: 'query',
            required: true,
            schema: { type: 'string', enum: ['tmdb'] },
          },
          {
            name: 'items',
            in: 'query',
            required: true,
            description: 'Comma-separated media references, for example movie:123,tv:456',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Matching user-owned library records only' },
          '400': { description: 'Invalid or oversized media reference batch' },
          '401': { description: 'Unauthenticated' },
        },
      },
    },
    '/api/v1/users/me/library/{id}': {
      patch: {
        summary: 'Update a library item status',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: { status: { type: 'string', enum: ['WATCHLIST', 'WATCHED'] } },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Updated item' },
          '401': { description: 'Unauthenticated' },
          '403': { description: 'CSRF failed' },
          '404': { description: 'Not found' },
        },
      },
      delete: {
        summary: 'Remove a library item',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '204': { description: 'Removed' },
          '401': { description: 'Unauthenticated' },
          '403': { description: 'CSRF failed' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/v1/users/me/library/{id}/experience': {
      put: {
        summary: 'Create or update the authenticated user’s private library experience',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['watchedAt'],
                properties: {
                  rating: {
                    type: 'number',
                    minimum: 1,
                    maximum: 10,
                    multipleOf: 0.5,
                    nullable: true,
                  },
                  comment: { type: 'string', maxLength: 2000, nullable: true },
                  watchedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Updated private library item' },
          '400': { description: 'Invalid experience payload' },
          '401': { description: 'Unauthenticated' },
          '403': { description: 'CSRF failed' },
          '404': { description: 'Not found' },
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
