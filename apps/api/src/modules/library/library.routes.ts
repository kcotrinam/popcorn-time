import { Router, type Router as RouterType } from 'express';
import { csrfProtection } from '../../middlewares/csrf.js';
import { requireAuthentication } from '../../middlewares/require-authentication.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { libraryController } from './library.controller.js';
import {
  createLibraryItemSchema,
  libraryItemParamsSchema,
  libraryMembershipQuerySchema,
  libraryQuerySchema,
  updateLibraryItemSchema,
} from './library.schemas.js';

export function createLibraryRouter(): RouterType {
  const router = Router();
  router.get(
    '/users/me/library/membership',
    requireAuthentication,
    validateRequest({ query: libraryMembershipQuerySchema }),
    libraryController.memberships,
  );
  router.get(
    '/users/me/library',
    requireAuthentication,
    validateRequest({ query: libraryQuerySchema }),
    libraryController.list,
  );
  router.post(
    '/users/me/library',
    requireAuthentication,
    csrfProtection,
    validateRequest({ body: createLibraryItemSchema }),
    libraryController.create,
  );
  router.patch(
    '/users/me/library/:id',
    requireAuthentication,
    csrfProtection,
    validateRequest({ params: libraryItemParamsSchema, body: updateLibraryItemSchema }),
    libraryController.update,
  );
  router.delete(
    '/users/me/library/:id',
    requireAuthentication,
    csrfProtection,
    validateRequest({ params: libraryItemParamsSchema }),
    libraryController.remove,
  );
  return router;
}
