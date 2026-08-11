import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { AppError } from '../src/errors/app-error.js';
import { ErrorCode } from '../src/errors/error-codes.js';

vi.mock('../src/modules/auth/auth.service.js', () => ({ authService: { authenticate: vi.fn() } }));
vi.mock('../src/modules/library/library.service.js', () => ({
  libraryService: { saveExperience: vi.fn() },
}));

import { authService } from '../src/modules/auth/auth.service.js';
import { libraryService } from '../src/modules/library/library.service.js';
import { app } from '../src/app.js';

const csrf = 'experience-csrf-token';
const id = 'bba50adf-1c20-42f9-aab0-3e3070a08700';
const payload = {
  rating: 8.5,
  comment: ' A private comment ',
  watchedAt: '2026-08-10T12:00:00.000Z',
};

describe('library experience HTTP', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.authenticate).mockResolvedValue({ id: 'user-a' });
    vi.mocked(libraryService.saveExperience).mockResolvedValue({ id, status: 'WATCHED' } as never);
  });

  const save = (body = payload) =>
    request(app)
      .put(`/api/v1/users/me/library/${id}/experience`)
      .set('Cookie', [`pt_csrf=${csrf}`])
      .set('x-csrf-token', csrf)
      .send(body);

  it('saves a valid private experience through an authenticated CSRF-protected endpoint', async () => {
    expect((await save()).status).toBe(200);
    expect(libraryService.saveExperience).toHaveBeenCalledWith(
      'user-a',
      { id },
      expect.objectContaining({ rating: 8.5, comment: 'A private comment' }),
    );
  });

  it('accepts null experience values and normalizes whitespace comments', async () => {
    expect(
      (await save({ rating: null, comment: '   ', watchedAt: payload.watchedAt })).status,
    ).toBe(200);
    expect(libraryService.saveExperience).toHaveBeenCalledWith(
      'user-a',
      { id },
      expect.objectContaining({ rating: null, comment: null }),
    );
  });

  it('rejects invalid ratings and future watched dates before the service', async () => {
    const invalidIncrement = await save({ ...payload, rating: 8.2 });
    const invalidRange = await save({ ...payload, rating: 10.5 });
    const futureDate = await save({ ...payload, watchedAt: '2099-01-01T12:00:00.000Z' });
    expect([invalidIncrement.status, invalidRange.status, futureDate.status]).toEqual([
      400, 400, 400,
    ]);
    expect(libraryService.saveExperience).not.toHaveBeenCalled();
  });

  it('requires CSRF and preserves ownership isolation errors', async () => {
    expect(
      (await request(app).put(`/api/v1/users/me/library/${id}/experience`).send(payload)).status,
    ).toBe(403);
    vi.mocked(libraryService.saveExperience).mockRejectedValueOnce(
      new AppError(404, ErrorCode.NOT_FOUND, 'Library item was not found'),
    );
    expect((await save()).status).toBe(404);
  });
});
