import type { RequestHandler } from 'express';
import { authService } from '../auth/auth.service.js';
import { sharedPlansService } from './shared-plans.service.js';
import {
  completeSchema,
  createPlanSchema,
  inviteSchema,
  listPlansSchema,
  participantParamsSchema,
  planParamsSchema,
  progressSchema,
} from './shared-plans.schemas.js';
const current = (req: Parameters<RequestHandler>[0]) =>
  authService.authenticate(req.cookies?.pt_access as string | undefined);
type SharedPlansController = {
  create: RequestHandler;
  list: RequestHandler;
  get: RequestHandler;
  invite: RequestHandler;
  accept: RequestHandler;
  leave: RequestHandler;
  remove: RequestHandler;
  progress: RequestHandler;
  complete: RequestHandler;
  cancel: RequestHandler;
};
export const sharedPlansController: SharedPlansController = {
  create: (async (req, res) => {
    const user = await current(req);
    res
      .status(201)
      .json(await sharedPlansService.create(user.id, createPlanSchema.parse(req.body)));
  }) satisfies RequestHandler,
  list: (async (req, res) => {
    const user = await current(req);
    res.json(await sharedPlansService.list(user.id, listPlansSchema.parse(req.query)));
  }) satisfies RequestHandler,
  get: (async (req, res) => {
    const user = await current(req);
    res.json(await sharedPlansService.get(user.id, planParamsSchema.parse(req.params).id));
  }) satisfies RequestHandler,
  invite: (async (req, res) => {
    const user = await current(req);
    res.json(
      await sharedPlansService.invite(
        user.id,
        planParamsSchema.parse(req.params).id,
        inviteSchema.parse(req.body).usernames,
      ),
    );
  }) satisfies RequestHandler,
  accept: (async (req, res) => {
    const user = await current(req);
    res.json(await sharedPlansService.accept(user.id, planParamsSchema.parse(req.params).id));
  }) satisfies RequestHandler,
  leave: (async (req, res) => {
    const user = await current(req);
    const { id } = planParamsSchema.parse(req.params);
    await sharedPlansService.remove(user.id, id, user.id);
    res.status(204).end();
  }) satisfies RequestHandler,
  remove: (async (req, res) => {
    const user = await current(req);
    const params = participantParamsSchema.parse(req.params);
    await sharedPlansService.remove(user.id, params.id, params.userId);
    res.status(204).end();
  }) satisfies RequestHandler,
  progress: (async (req, res) => {
    const user = await current(req);
    res.json(
      await sharedPlansService.progress(
        user.id,
        planParamsSchema.parse(req.params).id,
        progressSchema.parse(req.body),
      ),
    );
  }) satisfies RequestHandler,
  complete: (async (req, res) => {
    const user = await current(req);
    res.json(
      await sharedPlansService.complete(
        user.id,
        planParamsSchema.parse(req.params).id,
        completeSchema.parse(req.body),
      ),
    );
  }) satisfies RequestHandler,
  cancel: (async (req, res) => {
    const user = await current(req);
    res.json(await sharedPlansService.cancel(user.id, planParamsSchema.parse(req.params).id));
  }) satisfies RequestHandler,
};
