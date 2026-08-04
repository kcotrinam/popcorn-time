import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/modules/library/library.repository.js', () => ({
  libraryRepository: { findOwned: vi.fn(), updateStatus: vi.fn(), list: vi.fn(), create: vi.fn() },
}));
vi.mock('../src/modules/catalog/catalog.service.js', () => ({ catalogService: {} }));

import { libraryRepository } from '../src/modules/library/library.repository.js';
import { libraryService } from '../src/modules/library/library.service.js';

const pendingItem = {
  id: 'item-id',
  provider: 'tmdb',
  externalId: 42,
  mediaType: 'movie',
  status: 'WATCHLIST' as const,
  title: 'Arrival',
  originalTitle: null,
  originalLanguage: null,
  nationality: null,
  synopsis: null,
  posterUrl: null,
  releaseYear: 2016,
  genreIds: [],
  manualCategories: [],
  watchedAt: null,
  createdAt: new Date('2026-08-01T00:00:00.000Z'),
  updatedAt: new Date('2026-08-01T00:00:00.000Z'),
};

describe('library service watched history', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sets watchedAt when an owned Pending item is marked Watched', async () => {
    vi.mocked(libraryRepository.findOwned).mockResolvedValue(pendingItem);
    vi.mocked(libraryRepository.updateStatus).mockImplementation(
      async (_id, status, watchedAt) => ({
        ...pendingItem,
        status,
        watchedAt,
      }),
    );

    const item = await libraryService.update('user-a', { id: 'item-id' }, { status: 'WATCHED' });

    expect(libraryRepository.updateStatus).toHaveBeenCalledWith(
      'item-id',
      'WATCHED',
      expect.any(Date),
    );
    expect(item.watchedAt).toEqual(expect.any(String));
  });

  it('clears watchedAt when an owned Watched item returns to Pending', async () => {
    const watchedItem = { ...pendingItem, status: 'WATCHED' as const, watchedAt: new Date() };
    vi.mocked(libraryRepository.findOwned).mockResolvedValue(watchedItem);
    vi.mocked(libraryRepository.updateStatus).mockImplementation(
      async (_id, status, watchedAt) => ({
        ...watchedItem,
        status,
        watchedAt,
      }),
    );

    const item = await libraryService.update('user-a', { id: 'item-id' }, { status: 'WATCHLIST' });

    expect(libraryRepository.updateStatus).toHaveBeenCalledWith('item-id', 'WATCHLIST', null);
    expect(item.watchedAt).toBeNull();
  });

  it('passes the recent-watched sort through to the user-scoped repository query', async () => {
    vi.mocked(libraryRepository.list).mockResolvedValue([[], 0]);
    await libraryService.list('user-a', { sort: 'watchedAt.desc', page: 1, pageSize: 5 });
    expect(libraryRepository.list).toHaveBeenCalledWith(
      'user-a',
      expect.objectContaining({ sort: 'watchedAt.desc' }),
    );
  });

  it('creates a private manual item with no external reference and a creation watched timestamp', async () => {
    vi.mocked(libraryRepository.create).mockImplementation(async (data) => ({
      ...pendingItem,
      ...data,
      provider: 'manual',
      externalId: null,
      status: 'WATCHED',
      watchedAt: data.watchedAt as Date,
    }));

    const item = await libraryService.createManual('user-a', {
      title: 'My short film',
      mediaType: 'movie',
      categories: ['Experimental'],
      status: 'WATCHED',
    });

    expect(libraryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-a',
        provider: 'manual',
        externalId: null,
        manualCategories: ['Experimental'],
        watchedAt: expect.any(Date),
      }),
    );
    expect(item).toMatchObject({ provider: 'manual', externalId: null, status: 'WATCHED' });
    expect(item.watchedAt).toEqual(expect.any(String));
  });
});
