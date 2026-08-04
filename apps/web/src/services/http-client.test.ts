import { afterEach, describe, expect, it, vi } from 'vitest';
import { getJson, postJson } from './http-client';

describe('HTTP client headers', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('does not send a JSON content type for GET requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ results: [] })));
    vi.stubGlobal('fetch', fetchMock);

    await getJson('/catalog/genres', { query: { type: 'tv' } });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/catalog/genres?type=tv',
      expect.objectContaining({ headers: {} }),
    );
  });

  it('sends a JSON content type for requests with a JSON body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'item-id' })));
    vi.stubGlobal('fetch', fetchMock);

    await postJson('/example', { title: 'Arrival' });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/example',
      expect.objectContaining({
        body: JSON.stringify({ title: 'Arrival' }),
        headers: { 'content-type': 'application/json' },
      }),
    );
  });
});
