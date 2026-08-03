import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { AppError } from '../src/errors/app-error.js';
import { ErrorCode } from '../src/errors/error-codes.js';

vi.mock('../src/modules/auth/auth.service.js', () => ({
  authService: { authenticate: vi.fn() },
}));
vi.mock('../src/modules/library/library.service.js', () => ({
  libraryService: { memberships: vi.fn() },
}));

import { authService } from '../src/modules/auth/auth.service.js';
import { libraryService } from '../src/modules/library/library.service.js';
import { app } from '../src/app.js';

describe('library membership HTTP', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.authenticate).mockResolvedValue({ id: 'user-a' });
    vi.mocked(libraryService.memberships).mockResolvedValue({
      results: [
        {
          externalId: 123,
          mediaType: 'movie',
          status: 'WATCHLIST',
          libraryItemId: 'bba50adf-1c20-42f9-aab0-3e3070a08700',
        },
      ],
    });
  });

  it('returns only normalized membership records for the authenticated user', async () => {
    const response = await request(app).get(
      '/api/v1/users/me/library/membership?provider=tmdb&items=movie:123,tv:456',
    );

    expect(response.status).toBe(200);
    expect(response.body.results).toEqual([
      expect.objectContaining({ externalId: 123, mediaType: 'movie', status: 'WATCHLIST' }),
    ]);
    expect(libraryService.memberships).toHaveBeenCalledWith(
      'user-a',
      expect.objectContaining({ provider: 'tmdb' }),
    );
  });

  it('rejects malformed, duplicate, and oversized item batches before querying', async () => {
    const malformed = await request(app).get(
      '/api/v1/users/me/library/membership?provider=tmdb&items=bad:123',
    );
    const duplicate = await request(app).get(
      '/api/v1/users/me/library/membership?provider=tmdb&items=movie:123,movie:123',
    );
    const oversizedItems = Array.from({ length: 31 }, (_value, index) => `movie:${index + 1}`).join(
      ',',
    );
    const oversized = await request(app).get(
      `/api/v1/users/me/library/membership?provider=tmdb&items=${oversizedItems}`,
    );

    expect([malformed.status, duplicate.status, oversized.status]).toEqual([400, 400, 400]);
    expect(libraryService.memberships).not.toHaveBeenCalled();
  });

  it('requires authentication', async () => {
    vi.mocked(authService.authenticate).mockRejectedValueOnce(
      new AppError(401, ErrorCode.UNAUTHORIZED, 'Authentication required'),
    );

    const response = await request(app).get(
      '/api/v1/users/me/library/membership?provider=tmdb&items=movie:123',
    );
    expect(response.status).toBe(401);
    expect(libraryService.memberships).not.toHaveBeenCalled();
  });
});
