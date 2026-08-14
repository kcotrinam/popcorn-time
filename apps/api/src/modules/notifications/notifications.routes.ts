import { Router, type Router as RouterType } from 'express';
import { csrfProtection } from '../../middlewares/csrf.js';
import { requireAuthentication } from '../../middlewares/require-authentication.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { notificationsController } from './notifications.controller.js';
import { notificationParamsSchema, notificationQuerySchema } from './notifications.schemas.js';
export function createNotificationsRouter(): RouterType {
  const router = Router();
  router.use('/notifications', requireAuthentication);
  router.get(
    '/notifications',
    validateRequest({ query: notificationQuerySchema }),
    notificationsController.list,
  );
  router.get('/notifications/unread-count', notificationsController.unreadCount);
  router.patch(
    '/notifications/:id/read',
    csrfProtection,
    validateRequest({ params: notificationParamsSchema }),
    notificationsController.markRead,
  );
  router.post('/notifications/read-all', csrfProtection, notificationsController.markAllRead);
  router.delete('/notifications/read', csrfProtection, notificationsController.clearRead);
  router.delete(
    '/notifications/:id',
    csrfProtection,
    validateRequest({ params: notificationParamsSchema }),
    notificationsController.deleteOne,
  );
  return router;
}
