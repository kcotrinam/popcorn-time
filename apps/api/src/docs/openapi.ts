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
              enum: [
                'addedAt.desc',
                'addedAt.asc',
                'title.asc',
                'releaseYear.desc',
                'watchedAt.desc',
              ],
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
          '409': {
            description:
              'An exact catalog match exists or multiple exact catalog matches require user selection',
          },
          '503': { description: 'Catalog verification is unavailable; no manual item was created' },
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
    '/api/v1/shared-plans': {
      get: {
        summary: 'List shared-plan invitations, active plans, or history',
        parameters: [
          {
            name: 'view',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['invitations', 'active', 'history'],
              default: 'active',
            },
          },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          },
        ],
        responses: {
          '200': { description: 'Paginated shared plans' },
          '401': { description: 'Unauthenticated' },
        },
      },
      post: {
        summary: 'Create a shared viewing plan',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['provider', 'externalId', 'mediaType', 'usernames'],
                properties: {
                  provider: { type: 'string', enum: ['tmdb'] },
                  externalId: { type: 'integer', minimum: 1 },
                  mediaType: { type: 'string', enum: ['movie', 'tv'] },
                  usernames: {
                    type: 'array',
                    minItems: 1,
                    maxItems: 9,
                    items: { type: 'string', minLength: 3, maxLength: 30 },
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Created shared plan' },
          '400': { description: 'Invalid request or invitees' },
          '401': { description: 'Unauthenticated' },
          '403': { description: 'CSRF failed' },
          '404': { description: 'Invitee or catalog item not found' },
        },
      },
    },
    '/api/v1/shared-plans/{id}': {
      get: {
        summary: 'Get an accessible shared plan',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Shared-plan detail with visibility-filtered participants' },
          '401': { description: 'Unauthenticated' },
          '404': { description: 'Plan not found or inaccessible' },
        },
      },
    },
    '/api/v1/shared-plans/{id}/invitations': {
      post: {
        summary: 'Invite users to a shared plan as its creator',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Updated shared plan' },
          '400': { description: 'Invalid invitees or participant limit exceeded' },
          '403': { description: 'CSRF failed' },
          '404': { description: 'Plan not found or inaccessible' },
          '409': { description: 'Invitee is already a participant' },
        },
      },
    },
    '/api/v1/shared-plans/{id}/accept': {
      post: {
        summary: 'Accept a shared-plan invitation',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Accepted shared plan' },
          '403': { description: 'CSRF failed' },
          '404': { description: 'Invitation not found' },
          '409': { description: 'Plan is read-only' },
        },
      },
    },
    '/api/v1/shared-plans/{id}/participants/me': {
      delete: {
        summary: 'Leave a shared plan',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '204': { description: 'Participant removed' },
          '400': { description: 'The creator cannot leave' },
          '403': { description: 'CSRF failed' },
          '404': { description: 'Plan or participant not found' },
          '409': { description: 'Plan is read-only' },
        },
      },
    },
    '/api/v1/shared-plans/{id}/participants/{userId}': {
      delete: {
        summary: 'Remove a participant as the plan creator',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '204': { description: 'Participant removed' },
          '400': { description: 'The creator cannot be removed' },
          '403': { description: 'Not the creator or CSRF failed' },
          '404': { description: 'Plan or participant not found' },
          '409': { description: 'Plan is read-only' },
        },
      },
    },
    '/api/v1/shared-plans/{id}/progress': {
      put: {
        summary: 'Update the current participant progress',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Updated shared plan' },
          '400': { description: 'Invalid movie or episode progress' },
          '403': { description: 'Invitation not accepted or CSRF failed' },
          '404': { description: 'Plan not found' },
          '409': { description: 'Plan is read-only' },
        },
      },
    },
    '/api/v1/shared-plans/{id}/complete': {
      post: {
        summary: 'Complete the current participant progress and save a private experience',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Updated shared plan and private experience' },
          '400': { description: 'Invalid experience' },
          '403': { description: 'CSRF failed' },
          '404': { description: 'Accepted participant not found' },
          '409': { description: 'Plan is read-only' },
        },
      },
    },
    '/api/v1/shared-plans/{id}/cancel': {
      post: {
        summary: 'Cancel a shared plan as its creator',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Cancelled shared plan' },
          '403': { description: 'CSRF failed' },
          '404': { description: 'Active creator-owned plan not found' },
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
    '/api/v1/catalog/tv/{id}/seasons': {
      get: {
        summary: 'List normalized non-special television seasons',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': { description: 'Aired and current normalized seasons' },
          '404': { description: 'Series not found' },
          '503': { description: 'TMDB unavailable' },
        },
      },
    },
    '/api/v1/catalog/tv/{id}/seasons/{seasonNumber}': {
      get: {
        summary: 'List normalized aired episodes for a television season',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
          {
            name: 'seasonNumber',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        responses: {
          '200': { description: 'Normalized aired episodes' },
          '404': { description: 'Series or season not found' },
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
