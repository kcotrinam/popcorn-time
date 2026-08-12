import type { RequestHandler } from 'express';
import { authService } from '../auth/auth.service.js';
import { lookupUsernameSchema, setupUsernameSchema } from './users.schemas.js';
import { usersService } from './users.service.js';
const currentUser = (req: Parameters<RequestHandler>[0]) =>
  authService.authenticate(req.cookies?.pt_access as string | undefined);
export const usersController: { setupUsername: RequestHandler; lookup: RequestHandler } = {
  setupUsername: (async (req, res) => {
    const user = await currentUser(req);
    res.json(
      await usersService.setupUsername(user.id, setupUsernameSchema.parse(req.body).username),
    );
  }) satisfies RequestHandler,
  lookup: (async (req, res) => {
    const user = await currentUser(req);
    res.json(await usersService.lookup(user.id, lookupUsernameSchema.parse(req.query).username));
  }) satisfies RequestHandler,
};
