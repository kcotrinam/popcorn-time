import type { RequestHandler } from 'express';
import type { HealthService } from './health.service.js';
export function createHealthController(service: HealthService): { get: RequestHandler } {
  return { get: async (_req, res, next) => { try { res.status(200).json(await service.check()); } catch (error) { next(error); } } };
}
