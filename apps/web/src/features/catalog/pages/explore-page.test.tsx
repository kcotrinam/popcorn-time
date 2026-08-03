import { ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CatalogPage } from '@popcorn-time/shared';
import { ExplorePage } from './explore-page';
import { getCatalog, getGenres } from '../catalog.api';

vi.mock('../catalog.api', () => ({ getCatalog: vi.fn(), getGenres: vi.fn() }));
const catalog = getCatalog as ReturnType<typeof vi.fn>;
const genres = getGenres as ReturnType<typeof vi.fn>;
const page: CatalogPage = {
  page: 1,
  totalPages: 2,
  totalResults: 2,
  results: [
    {
      provider: 'tmdb',
      externalId: 42,
      mediaType: 'movie',
      title: 'Arrival',
      originalTitle: null,
      overview: null,
      posterUrl: null,
      backdropUrl: null,
      releaseDate: '2016-11-11',
      releaseYear: 2016,
      externalRating: 8,
      voteCount: 1,
      genreIds: [],
    },
  ],
};
function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <ThemeProvider theme={createTheme()}>
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <ExplorePage />
        </MemoryRouter>
      </QueryClientProvider>
    </ThemeProvider>,
  );
}
describe('ExplorePage', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });
  it('uses discover for short searches and debounces valid searches', async () => {
    catalog.mockResolvedValue(page);
    genres.mockResolvedValue([]);
    renderPage();
    await waitFor(() => expect(catalog).toHaveBeenCalled());
    expect(catalog.mock.calls.at(-1)?.[0]).toMatchObject({ query: '', tab: 'all' });
    fireEvent.change(screen.getByLabelText('Buscar películas, series o anime…'), {
      target: { value: 'a' },
    });
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 10));
    });
    expect(catalog.mock.calls.at(-1)?.[0]).toMatchObject({ query: '' });
    fireEvent.change(screen.getByLabelText('Buscar películas, series o anime…'), {
      target: { value: 'arrival' },
    });
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 300));
    });
    expect(catalog.mock.calls.at(-1)?.[0]).toMatchObject({ query: '' });
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 75));
    });
    await waitFor(() => expect(catalog.mock.calls.at(-1)?.[0]).toMatchObject({ query: 'arrival' }));
  });
  it('maps tabs and links cards to their detail page', async () => {
    catalog.mockResolvedValue(page);
    genres.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByRole('link', { name: 'View poster for Arrival' })).toHaveAttribute(
      'href',
      '/explore/movie/42',
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Anime' }));
    await waitFor(() => expect(catalog.mock.calls.at(-1)?.[0]).toMatchObject({ tab: 'anime' }));
  });
});
