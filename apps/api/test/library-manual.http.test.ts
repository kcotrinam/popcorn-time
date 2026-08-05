import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { AppError } from '../src/errors/app-error.js';
import { ErrorCode } from '../src/errors/error-codes.js';

vi.mock('../src/modules/auth/auth.service.js', () => ({ authService: { authenticate: vi.fn() } }));
vi.mock('../src/modules/library/library.service.js', () => ({
  libraryService: { createManual: vi.fn(), list: vi.fn() },
}));

import { authService } from '../src/modules/auth/auth.service.js';
import { libraryService } from '../src/modules/library/library.service.js';
import { app } from '../src/app.js';

const csrf = 'manual-test-csrf-token';
const body = {
  title: 'My short film',
  mediaType: 'movie',
  categories: ['Experimental', 'Indie'],
  status: 'WATCHLIST',
};

describe('manual library HTTP', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.authenticate).mockResolvedValue({ id: 'user-a' });
    vi.mocked(libraryService.createManual).mockResolvedValue({
      id: 'manual-id',
      provider: 'manual',
      externalId: null,
      mediaType: 'movie',
      status: 'WATCHLIST',
      title: body.title,
      originalTitle: null,
      originalLanguage: null,
      nationality: null,
      synopsis: null,
      posterUrl: null,
      releaseYear: null,
      genreIds: [],
      manualCategories: ['Experimental', 'Indie'],
      watchedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    vi.mocked(libraryService.list).mockResolvedValue({
      results: [],
      page: 1,
      pageSize: 24,
      totalPages: 1,
      totalResults: 0,
    });
  });

  const postManual = (payload = body) =>
    request(app)
      .post('/api/v1/users/me/library/manual')
      .set('Cookie', [`pt_csrf=${csrf}`])
      .set('x-csrf-token', csrf)
      .send(payload);

  it('creates a private manual watchlist item for the authenticated user', async () => {
    const response = await postManual();
    expect(response.status).toBe(201);
    expect(response.body.item).toMatchObject({ provider: 'manual', externalId: null });
    expect(libraryService.createManual).toHaveBeenCalledWith('user-a', body);
  });

  it('accepts an HTTPS poster and both initial statuses', async () => {
    const response = await postManual({
      ...body,
      status: 'WATCHED',
      posterUrl: 'https://images.example.test/poster.jpg',
    });
    expect(response.status).toBe(201);
    expect(libraryService.createManual).toHaveBeenCalledWith(
      'user-a',
      expect.objectContaining({
        status: 'WATCHED',
        posterUrl: 'https://images.example.test/poster.jpg',
      }),
    );
  });

  it('rejects invalid manual fields and non-HTTPS poster URLs before the service', async () => {
    const invalidPoster = await postManual({
      ...body,
      posterUrl: 'http://images.example.test/a.jpg',
    });
    const missingTitle = await postManual({ ...body, title: '' });
    const invalidCategory = await postManual({ ...body, categories: ['Custom'] });
    expect([invalidPoster.status, missingTitle.status, invalidCategory.status]).toEqual([
      400, 400, 400,
    ]);
    expect(libraryService.createManual).not.toHaveBeenCalled();
  });

  it('requires CSRF protection and authentication', async () => {
    const csrfFailure = await request(app).post('/api/v1/users/me/library/manual').send(body);
    expect(csrfFailure.status).toBe(403);
    vi.mocked(authService.authenticate).mockRejectedValueOnce(
      new AppError(401, ErrorCode.UNAUTHORIZED, 'Authentication required'),
    );
    expect((await postManual()).status).toBe(401);
  });

  it('returns typed catalog conflicts from the protected manual endpoint', async () => {
    vi.mocked(libraryService.createManual).mockRejectedValueOnce(
      new AppError(409, 'CATALOG_EXACT_MATCH', 'Matching catalog content exists', {
        mediaType: 'movie',
        externalId: 42,
        title: 'Arrival',
      }),
    );
    const response = await postManual();
    expect(response.status).toBe(409);
    expect(response.body.error).toMatchObject({
      code: 'CATALOG_EXACT_MATCH',
      details: { mediaType: 'movie', externalId: 42 },
    });
  });

  it('passes multiple category filters to the authenticated user-scoped listing', async () => {
    const response = await request(app).get(
      '/api/v1/users/me/library?categories=Anime,Family&status=WATCHLIST',
    );
    expect(response.status).toBe(200);
    expect(libraryService.list).toHaveBeenCalledWith(
      'user-a',
      expect.objectContaining({ categories: ['Anime', 'Family'], status: 'WATCHLIST' }),
    );
  });
});
