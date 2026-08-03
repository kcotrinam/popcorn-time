import { describe, expect, it } from 'vitest';
import {
  normalizeCard,
  normalizeDetail,
  normalizePage,
} from '../src/modules/catalog/catalog.repository.js';
describe('catalog normalization', () => {
  it('normalizes movie cards and builds safe TMDB image URLs', () => {
    const card = normalizeCard(
      {
        id: 42,
        title: 'Arrival',
        original_title: 'Arrival',
        overview: 'First contact.',
        poster_path: '/poster.jpg',
        backdrop_path: '/backdrop.jpg',
        release_date: '2016-11-10',
        vote_average: 7.6,
        vote_count: 18000,
        genre_ids: [18, 878],
      },
      'movie',
    );
    expect(card).toMatchObject({
      provider: 'tmdb',
      externalId: 42,
      mediaType: 'movie',
      releaseYear: 2016,
      posterUrl: 'https://image.tmdb.org/t/p/w500/poster.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/backdrop.jpg',
    });
  });
  it('normalizes TV cards with missing images and dates', () => {
    const card = normalizeCard({ id: 7, name: 'Orbit', original_name: 'Orbit' }, 'tv');
    expect(card).toMatchObject({
      title: 'Orbit',
      posterUrl: null,
      backdropUrl: null,
      releaseDate: null,
      releaseYear: null,
      genreIds: [],
    });
  });
  it('filters invalid media types from multi-search pages', () => {
    const page = normalizePage({
      page: 1,
      total_pages: 1,
      total_results: 2,
      results: [
        { id: 1, media_type: 'person', name: 'Ignored' },
        { id: 2, media_type: 'movie', title: 'Included' },
      ],
    });
    expect(page.results).toHaveLength(1);
    expect(page.results[0]?.title).toBe('Included');
  });
  it('normalizes detail credits and TV metadata', () => {
    const detail = normalizeDetail(
      {
        id: 4,
        name: 'Signal',
        genres: [{ id: 10765, name: 'Sci-Fi & Fantasy' }],
        number_of_episodes: 16,
        number_of_seasons: 2,
        origin_country: ['US'],
        credits: { cast: [{ name: 'Alex Ray', character: 'Mara', profile_path: null }] },
      },
      'tv',
    );
    expect(detail).toMatchObject({
      numberOfEpisodes: 16,
      numberOfSeasons: 2,
      originCountries: ['US'],
      credits: [{ name: 'Alex Ray', role: 'Mara', profileUrl: null }],
    });
  });
});
