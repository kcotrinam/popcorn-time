import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/modules/library/library.repository.js', () => ({
  libraryRepository: {
    findOwned: vi.fn(),
    updateStatus: vi.fn(),
    saveExperience: vi.fn(),
    list: vi.fn(),
    create: vi.fn(),
  },
}));
vi.mock('../src/modules/catalog/catalog.service.js', () => ({
  catalogService: { search: vi.fn() },
}));

import { libraryRepository } from '../src/modules/library/library.repository.js';
import { libraryService } from '../src/modules/library/library.service.js';
import { catalogService } from '../src/modules/catalog/catalog.service.js';
import { AppError } from '../src/errors/app-error.js';
import { ErrorCode } from '../src/errors/error-codes.js';

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
  personalRating: null,
  privateComment: null,
  createdAt: new Date('2026-08-01T00:00:00.000Z'),
  updatedAt: new Date('2026-08-01T00:00:00.000Z'),
};

describe('library service watched history', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(catalogService.search).mockResolvedValue({
      results: [],
      page: 1,
      pageSize: 20,
      totalPages: 1,
      totalResults: 0,
    });
  });

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

  it('clears the complete experience when an owned Watched item returns to Pending', async () => {
    const watchedItem = {
      ...pendingItem,
      status: 'WATCHED' as const,
      watchedAt: new Date(),
      personalRating: 8.5,
      privateComment: 'Private note',
    };
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

  it('saves a private experience and marks an owned item Watched', async () => {
    vi.mocked(libraryRepository.findOwned).mockResolvedValue(pendingItem);
    vi.mocked(libraryRepository.saveExperience).mockImplementation(async (_id, input) => ({
      ...pendingItem,
      status: 'WATCHED',
      watchedAt: input.watchedAt,
      personalRating: input.rating,
      privateComment: input.comment,
    }));

    const item = await libraryService.saveExperience(
      'user-a',
      { id: 'item-id' },
      { rating: 8.5, comment: 'Private note', watchedAt: new Date('2026-08-10T12:00:00.000Z') },
    );

    expect(libraryRepository.saveExperience).toHaveBeenCalledWith(
      'item-id',
      expect.objectContaining({ rating: 8.5, comment: 'Private note' }),
    );
    expect(item).toMatchObject({
      status: 'WATCHED',
      personalRating: 8.5,
      privateComment: 'Private note',
    });
  });

  it('does not save an experience for another user item', async () => {
    vi.mocked(libraryRepository.findOwned).mockResolvedValue(null);
    await expect(
      libraryService.saveExperience('user-a', { id: 'item-id' }, { watchedAt: new Date() }),
    ).rejects.toMatchObject({ statusCode: 404 });
    expect(libraryRepository.saveExperience).not.toHaveBeenCalled();
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

  it('blocks a unique exact TMDB match by title and year without writing a manual item', async () => {
    vi.mocked(catalogService.search).mockResolvedValue({
      results: [
        {
          provider: 'tmdb',
          externalId: 99,
          mediaType: 'movie',
          title: 'Amélie!',
          originalTitle: 'Le Fabuleux Destin d’Amélie Poulain',
          overview: null,
          posterUrl: null,
          backdropUrl: null,
          releaseDate: null,
          releaseYear: 2001,
          externalRating: null,
          voteCount: 0,
          genreIds: [],
        },
      ],
      page: 1,
      totalPages: 1,
      totalResults: 1,
    });
    await expect(
      libraryService.createManual('user-a', {
        title: 'Amelie',
        mediaType: 'movie',
        releaseYear: 2001,
        categories: [],
        status: 'WATCHLIST',
      }),
    ).rejects.toMatchObject({ statusCode: 409, code: 'CATALOG_EXACT_MATCH' });
    expect(libraryRepository.create).not.toHaveBeenCalled();
  });

  it('blocks unique original-title matches and directs ambiguous exact matches to search', async () => {
    const originalTitle = {
      provider: 'tmdb' as const,
      externalId: 10,
      mediaType: 'tv' as const,
      title: 'Localized title',
      originalTitle: 'Original series',
      overview: null,
      posterUrl: null,
      backdropUrl: null,
      releaseDate: null,
      releaseYear: 2020,
      externalRating: null,
      voteCount: 0,
      genreIds: [],
    };
    vi.mocked(catalogService.search).mockResolvedValue({
      results: [originalTitle],
      page: 1,
      totalPages: 1,
      totalResults: 1,
    });
    await expect(
      libraryService.createManual('user-a', {
        title: 'Original Series',
        mediaType: 'tv',
        categories: [],
        status: 'WATCHLIST',
      }),
    ).rejects.toMatchObject({ code: 'CATALOG_EXACT_MATCH' });
    vi.mocked(catalogService.search).mockResolvedValue({
      results: [originalTitle, { ...originalTitle, externalId: 11 }],
      page: 1,
      totalPages: 1,
      totalResults: 2,
    });
    await expect(
      libraryService.createManual('user-a', {
        title: 'Original Series',
        mediaType: 'tv',
        categories: [],
        status: 'WATCHLIST',
      }),
    ).rejects.toMatchObject({ code: 'CATALOG_AMBIGUOUS_MATCH' });
    expect(libraryRepository.create).not.toHaveBeenCalled();
  });

  it('does not write manual content when TMDB verification is unavailable', async () => {
    vi.mocked(catalogService.search).mockRejectedValue(
      new AppError(503, ErrorCode.UPSTREAM_SERVICE_UNAVAILABLE, 'Catalog service is unavailable'),
    );
    await expect(
      libraryService.createManual('user-a', {
        title: 'Private film',
        mediaType: 'movie',
        categories: [],
        status: 'WATCHLIST',
      }),
    ).rejects.toMatchObject({ statusCode: 503, code: ErrorCode.UPSTREAM_SERVICE_UNAVAILABLE });
    expect(libraryRepository.create).not.toHaveBeenCalled();
  });
});
