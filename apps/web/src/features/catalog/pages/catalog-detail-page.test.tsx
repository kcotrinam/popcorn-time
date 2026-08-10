import { ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CatalogDetail, LibraryMembershipResponse } from '@popcorn-time/shared';
import { CatalogDetailPage } from './catalog-detail-page';
import { getCatalog, getCatalogDetail } from '../catalog.api';
import {
  addToLibrary,
  getLibraryMemberships,
  updateLibraryStatus,
} from '@/features/library/library.api';

vi.mock('../catalog.api', () => ({ getCatalog: vi.fn(), getCatalogDetail: vi.fn() }));
vi.mock('@/features/library/library.api', () => ({
  addToLibrary: vi.fn(),
  getLibraryMemberships: vi.fn(),
  updateLibraryStatus: vi.fn(),
}));

const detail: CatalogDetail = {
  provider: 'tmdb',
  externalId: 123,
  mediaType: 'movie',
  title: 'Moonlight Story',
  originalTitle: 'Historia de luna',
  overview: 'A complete synopsis.',
  posterUrl: 'https://images.example/poster.jpg',
  backdropUrl: 'https://images.example/backdrop.jpg',
  releaseDate: '2024-02-01',
  releaseYear: 2024,
  externalRating: 8.4,
  voteCount: 10,
  genreIds: [18],
  alternativeTitles: [],
  genres: [{ id: 18, name: 'Drama' }],
  runtimeMinutes: 121,
  numberOfEpisodes: null,
  numberOfSeasons: null,
  status: 'Released',
  originCountries: ['US'],
  originalLanguage: 'en',
  credits: [
    { name: 'Jane Director', role: 'Director', profileUrl: null },
    { name: 'Ava Actor', role: 'Lead', profileUrl: null },
  ],
};

function renderPage(client = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  return {
    client,
    ...render(
      <ThemeProvider theme={createTheme({ palette: { mode: 'dark' } })}>
        <QueryClientProvider client={client}>
          <MemoryRouter initialEntries={['/explore/movie/123']}>
            <Routes>
              <Route path="/explore/:type/:id" element={<CatalogDetailPage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </ThemeProvider>,
    ),
  };
}

function mockDefault(membership: LibraryMembershipResponse = { results: [] }) {
  vi.mocked(getCatalogDetail).mockResolvedValue(detail);
  vi.mocked(getLibraryMemberships).mockResolvedValue(membership);
  vi.mocked(getCatalog).mockResolvedValue({ results: [], page: 1, totalPages: 1, totalResults: 0 });
}

describe('CatalogDetailPage', () => {
  afterEach(() => vi.resetAllMocks());

  it('renders complete catalog data and a graceful similar-content empty state', async () => {
    mockDefault();
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Moonlight Story' })).toBeInTheDocument();
    expect(screen.getByText('Historia de luna')).toBeInTheDocument();
    expect(screen.getByText('TMDB 8.4')).toBeInTheDocument();
    expect(screen.getByText('Jane Director')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your Experience' })).toBeInTheDocument();
    expect(screen.getByText('Personal ratings are not available yet.')).toBeInTheDocument();
    expect(screen.getByText('Personal comments are not available yet.')).toBeInTheDocument();
    expect(screen.getByText('Not in your library')).toBeInTheDocument();
    expect(
      await screen.findByText('No similar content is available right now.'),
    ).toBeInTheDocument();
  });

  it('renders partial data and poster/backdrop fallbacks accessibly', async () => {
    mockDefault();
    vi.mocked(getCatalogDetail).mockResolvedValue({
      ...detail,
      originalTitle: null,
      overview: null,
      posterUrl: null,
      backdropUrl: null,
      externalRating: null,
      genres: [],
      credits: [],
      runtimeMinutes: null,
    });
    renderPage();

    expect(
      await screen.findByLabelText('Poster unavailable for Moonlight Story'),
    ).toBeInTheDocument();
    expect(screen.getByText('No synopsis is available for this title.')).toBeInTheDocument();
    expect(screen.queryByText('People')).not.toBeInTheDocument();
  });

  it('falls back when a supplied poster image fails to load', async () => {
    mockDefault();
    renderPage();

    fireEvent.error(await screen.findByAltText('Poster for Moonlight Story'));
    expect(
      await screen.findByLabelText('Poster unavailable for Moonlight Story'),
    ).toBeInTheDocument();
  });

  it('keeps the add-to-pending behavior for an item outside the library', async () => {
    mockDefault();
    vi.mocked(addToLibrary).mockResolvedValue({ item: {} as never, created: true });
    renderPage();

    const posterColumn = await screen.findByRole('complementary', {
      name: 'Poster and library actions',
    });
    fireEvent.click(within(posterColumn).getByRole('button', { name: 'Add to pending' }));
    await waitFor(() =>
      expect(addToLibrary).toHaveBeenCalledWith({
        provider: 'tmdb',
        externalId: 123,
        mediaType: 'movie',
      }),
    );
  });

  it('marks a pending item watched, disables duplicate submission, and invalidates library queries', async () => {
    mockDefault({
      results: [
        { externalId: 123, mediaType: 'movie', status: 'WATCHLIST', libraryItemId: 'library-id' },
      ],
    });
    let resolveUpdate: (() => void) | undefined;
    vi.mocked(updateLibraryStatus).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpdate = () => resolve({} as never);
        }),
    );
    const { client } = renderPage();
    const invalidate = vi.spyOn(client, 'invalidateQueries');

    const button = await screen.findByRole('button', { name: 'Mark as watched' });
    fireEvent.click(button);
    expect(await screen.findByRole('button', { name: 'Marking as watched…' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Marking as watched…' }));
    expect(updateLibraryStatus).toHaveBeenCalledTimes(1);
    resolveUpdate?.();

    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ['library'] }));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['library-membership'] });
    expect(await screen.findByText('Moonlight Story is marked as watched.')).toBeInTheDocument();
  });

  it('shows error feedback when marking watched fails', async () => {
    mockDefault({
      results: [
        { externalId: 123, mediaType: 'movie', status: 'WATCHLIST', libraryItemId: 'library-id' },
      ],
    });
    vi.mocked(updateLibraryStatus).mockRejectedValue(new Error('failed'));
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Mark as watched' }));
    expect(
      await screen.findByText('We could not update this item. Please try again.'),
    ).toBeInTheDocument();
  });

  it('shows watched state without the mark-as-watched action', async () => {
    mockDefault({
      results: [
        { externalId: 123, mediaType: 'movie', status: 'WATCHED', libraryItemId: 'library-id' },
      ],
    });
    renderPage();

    expect((await screen.findAllByText('Watched')).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'Mark as watched' })).not.toBeInTheDocument();
    expect(screen.getByText('Visible only to you')).toBeInTheDocument();
  });
});
