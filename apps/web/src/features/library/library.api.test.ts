import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearCsrfToken } from '@/services/http-client';
import { getLibrary } from './library.api';

describe('library API filters', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    clearCsrfToken();
  });

  it('serializes multiple manual category filters as a single OR-filter query parameter', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ results: [], page: 1, pageSize: 24, totalPages: 1, totalResults: 0 }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      ),
    );
    await getLibrary({
      status: 'WATCHLIST',
      categories: ['Anime', 'Family'],
      sort: 'addedAt.desc',
      page: 1,
      pageSize: 24,
    });
    expect(String(fetchSpy.mock.calls[0]?.[0])).toContain('categories=Anime%2CFamily');
  });
});
