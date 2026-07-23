import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
vi.mock('../src/modules/health/health.repository.js', () => ({ healthRepository: { check: vi.fn() } }));
import { healthRepository } from '../src/modules/health/health.repository.js';
import { app } from '../src/app.js';
describe('API HTTP', () => {
  beforeEach(() => vi.mocked(healthRepository.check).mockResolvedValue(undefined));
  it('serves root with request id', async () => { const response = await request(app).get('/api/v1'); expect(response.status).toBe(200); expect(response.body.status).toBe('running'); expect(response.headers['x-request-id']).toBeTruthy(); });
  it('reports health and database failure safely', async () => { expect((await request(app).get('/api/v1/health')).status).toBe(200); vi.mocked(healthRepository.check).mockRejectedValueOnce(new Error('connection string')); const response = await request(app).get('/api/v1/health'); expect(response.status).toBe(503); expect(response.body.error.message).toBe('Database is unavailable'); });
  it('handles unknown routes and exposes documentation', async () => { expect((await request(app).get('/missing')).status).toBe(404); expect((await request(app).get('/api/docs')).status).toBe(301); const spec = await request(app).get('/api/docs/openapi.json'); expect(spec.status).toBe(200); expect(spec.body.paths['/api/v1/health'].get.responses['503']).toBeDefined(); });
});
