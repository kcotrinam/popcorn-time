import { Router, type Router as RouterType } from 'express';
import { csrfProtection } from '../../middlewares/csrf.js';
import { requireAuthentication } from '../../middlewares/require-authentication.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { sharedPlansController } from './shared-plans.controller.js';
import {
  completeSchema,
  createPlanSchema,
  inviteSchema,
  listPlansSchema,
  participantParamsSchema,
  planParamsSchema,
  progressSchema,
} from './shared-plans.schemas.js';
export function createSharedPlansRouter(): RouterType {
  const router = Router();
  router.use('/shared-plans', requireAuthentication);
  router.get(
    '/shared-plans',
    validateRequest({ query: listPlansSchema }),
    sharedPlansController.list,
  );
  router.post(
    '/shared-plans',
    csrfProtection,
    validateRequest({ body: createPlanSchema }),
    sharedPlansController.create,
  );
  router.get(
    '/shared-plans/:id',
    validateRequest({ params: planParamsSchema }),
    sharedPlansController.get,
  );
  router.post(
    '/shared-plans/:id/invitations',
    csrfProtection,
    validateRequest({ params: planParamsSchema, body: inviteSchema }),
    sharedPlansController.invite,
  );
  router.post(
    '/shared-plans/:id/accept',
    csrfProtection,
    validateRequest({ params: planParamsSchema }),
    sharedPlansController.accept,
  );
  router.delete(
    '/shared-plans/:id/participants/me',
    csrfProtection,
    validateRequest({ params: planParamsSchema }),
    sharedPlansController.leave,
  );
  router.delete(
    '/shared-plans/:id/participants/:userId',
    csrfProtection,
    validateRequest({ params: participantParamsSchema }),
    sharedPlansController.remove,
  );
  router.put(
    '/shared-plans/:id/progress',
    csrfProtection,
    validateRequest({ params: planParamsSchema, body: progressSchema }),
    sharedPlansController.progress,
  );
  router.post(
    '/shared-plans/:id/complete',
    csrfProtection,
    validateRequest({ params: planParamsSchema, body: completeSchema }),
    sharedPlansController.complete,
  );
  router.post(
    '/shared-plans/:id/cancel',
    csrfProtection,
    validateRequest({ params: planParamsSchema }),
    sharedPlansController.cancel,
  );
  return router;
}
