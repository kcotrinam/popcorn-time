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
  },
  components: { schemas: { ErrorResponse: errorSchema, HealthResponse: healthSchema } },
};
