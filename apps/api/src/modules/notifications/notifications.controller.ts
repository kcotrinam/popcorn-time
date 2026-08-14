import type { RequestHandler } from 'express';
import { authService } from '../auth/auth.service.js';
import { notificationParamsSchema, notificationQuerySchema } from './notifications.schemas.js';
import { notificationsService } from './notifications.service.js';
const userId = async (req: Parameters<RequestHandler>[0]) =>
  (await authService.authenticate(req.cookies?.pt_access as string | undefined)).id;
export const notificationsController = {
  list: (async (req, res) =>
    res.json(
      await notificationsService.list(await userId(req), notificationQuerySchema.parse(req.query)),
    )) as RequestHandler,
  unreadCount: (async (req, res) =>
    res.json(await notificationsService.unreadCount(await userId(req)))) as RequestHandler,
  markRead: (async (req, res) => {
    await notificationsService.markRead(
      await userId(req),
      notificationParamsSchema.parse(req.params).id,
    );
    res.status(204).send();
  }) as RequestHandler,
  markAllRead: (async (req, res) => {
    await notificationsService.markAllRead(await userId(req));
    res.status(204).send();
  }) as RequestHandler,
  deleteOne: (async (req, res) => {
    await notificationsService.deleteOne(
      await userId(req),
      notificationParamsSchema.parse(req.params).id,
    );
    res.status(204).send();
  }) as RequestHandler,
  clearRead: (async (req, res) => {
    await notificationsService.clearRead(await userId(req));
    res.status(204).send();
  }) as RequestHandler,
};
