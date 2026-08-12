import type { RequestHandler } from 'express';
import { authService } from '../auth/auth.service.js';
import {
  createRecommendationSchema,
  recommendationParamsSchema,
  recommendationQuerySchema,
} from './recommendations.schemas.js';
import { recommendationsService } from './recommendations.service.js';
const currentUser = (req: Parameters<RequestHandler>[0]) =>
  authService.authenticate(req.cookies?.pt_access as string | undefined);
export const recommendationsController: {
  create: RequestHandler;
  list: RequestHandler;
  accept: RequestHandler;
  reject: RequestHandler;
} = {
  create: (async (req, res) => {
    const user = await currentUser(req);
    res
      .status(201)
      .json(
        await recommendationsService.create(user.id, createRecommendationSchema.parse(req.body)),
      );
  }) satisfies RequestHandler,
  list: (async (req, res) => {
    const user = await currentUser(req);
    res.json(
      await recommendationsService.list(user.id, recommendationQuerySchema.parse(req.query)),
    );
  }) satisfies RequestHandler,
  accept: (async (req, res) => {
    const user = await currentUser(req);
    res.json(
      await recommendationsService.accept(user.id, recommendationParamsSchema.parse(req.params).id),
    );
  }) satisfies RequestHandler,
  reject: (async (req, res) => {
    const user = await currentUser(req);
    await recommendationsService.reject(user.id, recommendationParamsSchema.parse(req.params).id);
    res.status(204).send();
  }) satisfies RequestHandler,
};
