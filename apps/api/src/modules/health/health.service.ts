import type { HealthResponse } from '@popcorn-time/shared';
import { AppError } from '../../errors/app-error.js';
import { ErrorCode } from '../../errors/error-codes.js';
import type { HealthRepository } from './health.types.js';
export class HealthService {
  constructor(private readonly repository: HealthRepository) {}
  async check(): Promise<HealthResponse> {
    try { await this.repository.check(); }
    catch { throw new AppError(503, ErrorCode.SERVICE_UNAVAILABLE, 'Database is unavailable'); }
    return { status: 'ok', services: { api: 'up', database: 'up' }, timestamp: new Date().toISOString() };
  }
}
