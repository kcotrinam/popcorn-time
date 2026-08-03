import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../src/modules/catalog/tmdb.client.js', () => ({
  TmdbNotFoundError: class TmdbNotFoundError extends Error {},
  tmdbEndpoints: { search: vi.fn(), discover: vi.fn(), genres: vi.fn(), detail: vi.fn() },
}));
import { tmdbEndpoints } from '../src/modules/catalog/tmdb.client.js';
import { catalogService } from '../src/modules/catalog/catalog.service.js';
describe('catalog service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    catalogService.clearCache();
  });
  it('maps anime discover to animation and Japanese original language', async () => {
    vi.mocked(tmdbEndpoints.discover).mockResolvedValue({
      page: 1,
      total_pages: 1,
      total_results: 0,
      results: [],
    });
    await catalogService.discover({
      type: 'movie',
      category: 'anime',
      sort: 'popularity.desc',
      page: 1,
    });
    expect(tmdbEndpoints.discover).toHaveBeenCalledWith(
      'movie',
      expect.objectContaining({ with_genres: '16', with_original_language: 'ja' }),
    );
  });
  it('maps documentary discover to TMDB documentary genre', async () => {
    vi.mocked(tmdbEndpoints.discover).mockResolvedValue({
      page: 1,
      total_pages: 1,
      total_results: 0,
      results: [],
    });
    await catalogService.discover({
      type: 'tv',
      category: 'documentary',
      sort: 'popularity.desc',
      page: 1,
    });
    expect(tmdbEndpoints.discover).toHaveBeenCalledWith(
      'tv',
      expect.objectContaining({ with_genres: '99' }),
    );
  });
});
