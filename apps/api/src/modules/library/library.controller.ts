import type { RequestHandler } from 'express';
import { authService } from '../auth/auth.service.js';
import { libraryService } from './library.service.js';
import {
  createLibraryItemSchema,
  createManualLibraryItemSchema,
  libraryItemParamsSchema,
  libraryMembershipQuerySchema,
  libraryQuerySchema,
  updateLibraryItemSchema,
} from './library.schemas.js';

const currentUser = (req: Parameters<RequestHandler>[0]) =>
  authService.authenticate(req.cookies?.pt_access as string | undefined);
type LibraryController = {
  create: RequestHandler;
  createManual: RequestHandler;
  list: RequestHandler;
  update: RequestHandler;
  remove: RequestHandler;
  memberships: RequestHandler;
};
export const libraryController: LibraryController = {
  create: (async (req, res) => {
    const user = await currentUser(req);
    const result = await libraryService.create(user.id, createLibraryItemSchema.parse(req.body));
    res.status(result.created ? 201 : 200).json(result);
  }) satisfies RequestHandler,
  createManual: (async (req, res) => {
    const user = await currentUser(req);
    const item = await libraryService.createManual(
      user.id,
      createManualLibraryItemSchema.parse(req.body),
    );
    res.status(201).json({ item, created: true });
  }) satisfies RequestHandler,
  list: (async (req, res) => {
    const user = await currentUser(req);
    res.json(await libraryService.list(user.id, libraryQuerySchema.parse(req.query)));
  }) satisfies RequestHandler,
  memberships: (async (req, res) => {
    const user = await currentUser(req);
    res.json(
      await libraryService.memberships(user.id, libraryMembershipQuerySchema.parse(req.query)),
    );
  }) satisfies RequestHandler,
  update: (async (req, res) => {
    const user = await currentUser(req);
    res.json(
      await libraryService.update(
        user.id,
        libraryItemParamsSchema.parse(req.params),
        updateLibraryItemSchema.parse(req.body),
      ),
    );
  }) satisfies RequestHandler,
  remove: (async (req, res) => {
    const user = await currentUser(req);
    await libraryService.remove(user.id, libraryItemParamsSchema.parse(req.params));
    res.status(204).send();
  }) satisfies RequestHandler,
};
