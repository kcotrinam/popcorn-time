import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../src/errors/app-error.js';
import { HealthService } from '../src/modules/health/health.service.js';
describe('HealthService', () => {
  it('returns healthy after repository connectivity check', async () => {
    const check = vi.fn().mockResolvedValue(undefined);
    const result = await new HealthService({ check }).check();
    expect(check).toHaveBeenCalledOnce();
    expect(result.services.database).toBe('up');
  });
  it('maps database errors to a safe 503', async () => {
    await expect(
      new HealthService({ check: vi.fn().mockRejectedValue(new Error('secret')) }).check(),
    ).rejects.toMatchObject<AppError>({ statusCode: 503 });
  });
});
