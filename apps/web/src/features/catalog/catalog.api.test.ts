import { describe, expect, it, vi } from 'vitest';
import { getJson } from '@/services/http-client';
import { getGenres } from './catalog.api';

vi.mock('@/services/http-client', () => ({ getJson: vi.fn() }));

describe('getGenres', () => {
  it('unwraps the API results envelope', async () => {
    vi.mocked(getJson).mockResolvedValueOnce({ results: [{ id: 18, name: 'Drama' }] });

    await expect(getGenres('movie')).resolves.toEqual([{ id: 18, name: 'Drama' }]);
    expect(getJson).toHaveBeenCalledWith('/catalog/genres', {
      signal: undefined,
      query: { type: 'movie' },
    });
  });
});
