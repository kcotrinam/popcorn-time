import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
vi.mock('../src/modules/catalog/tmdb.client.js', () => ({
  TmdbNotFoundError: class TmdbNotFoundError extends Error {},
  tmdbEndpoints: { search: vi.fn(), discover: vi.fn(), genres: vi.fn(), detail: vi.fn() },
}));
import { tmdbEndpoints, TmdbNotFoundError } from '../src/modules/catalog/tmdb.client.js';
import { AppError } from '../src/errors/app-error.js';
import { ErrorCode } from '../src/errors/error-codes.js';
import { catalogService } from '../src/modules/catalog/catalog.service.js';
import { app } from '../src/app.js';

const page = {
  page: 1,
  total_pages: 3,
  total_results: 1,
  results: [
    {
      id: 10,
      title: 'A Film',
      original_title: 'A Film',
      overview: 'A safe response',
      poster_path: '/poster.jpg',
      vote_average: 8,
      vote_count: 99,
      genre_ids: [18],
    },
  ],
};
describe('catalog HTTP', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    catalogService.clearCache();
    vi.mocked(tmdbEndpoints.search).mockResolvedValue(page);
    vi.mocked(tmdbEndpoints.discover).mockResolvedValue(page);
    vi.mocked(tmdbEndpoints.genres).mockResolvedValue({ genres: [{ id: 18, name: 'Drama' }] });
    vi.mocked(tmdbEndpoints.detail).mockResolvedValue({
      ...page.results[0],
      genres: [{ id: 18, name: 'Drama' }],
    });
  });
  it('validates public search queries', async () => {
    const response = await request(app).get('/api/v1/catalog/search?query=x');
    expect(response.status).toBe(400);
    expect(tmdbEndpoints.search).not.toHaveBeenCalled();
  });
  it('returns a normalized public search contract without tokens', async () => {
    const response = await request(app).get('/api/v1/catalog/search?query=film&type=movie');
    expect(response.status).toBe(200);
    expect(response.body.results[0]).toMatchObject({
      provider: 'tmdb',
      externalId: 10,
      mediaType: 'movie',
      title: 'A Film',
      posterUrl: 'https://image.tmdb.org/t/p/w500/poster.jpg',
    });
    expect(JSON.stringify(response.body)).not.toContain('TMDB_API_ACCESS_TOKEN');
  });
  it('serves discover, genres, and details without authentication', async () => {
    expect((await request(app).get('/api/v1/catalog/discover?category=anime')).status).toBe(200);
    expect((await request(app).get('/api/v1/catalog/genres?type=movie')).body.results).toEqual([
      { id: 18, name: 'Drama' },
    ]);
    expect((await request(app).get('/api/v1/catalog/movie/10')).status).toBe(200);
  });
  it('maps TMDB not found and upstream errors safely', async () => {
    vi.mocked(tmdbEndpoints.detail).mockRejectedValueOnce(new TmdbNotFoundError());
    expect((await request(app).get('/api/v1/catalog/movie/404')).status).toBe(404);
    vi.mocked(tmdbEndpoints.search).mockRejectedValueOnce(
      new AppError(503, ErrorCode.UPSTREAM_SERVICE_UNAVAILABLE, 'Catalog service is unavailable'),
    );
    const response = await request(app).get('/api/v1/catalog/search?query=network');
    expect(response.status).toBe(503);
    expect(JSON.stringify(response.body)).not.toContain('TMDB_API_ACCESS_TOKEN');
  });
});
