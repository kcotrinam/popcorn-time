import { Router, type Router as ExpressRouter } from 'express';
import { createHealthController } from './health.controller.js';
import { healthRepository } from './health.repository.js';
import { HealthService } from './health.service.js';
export function createHealthRouter(): ExpressRouter {
  const router = Router();
  const controller = createHealthController(new HealthService(healthRepository));
  router.get('/health', controller.get);
  return router;
}
