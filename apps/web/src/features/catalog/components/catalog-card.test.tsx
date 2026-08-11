import { ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { CatalogCard as CatalogCardModel } from '@popcorn-time/shared';
import { CatalogCard } from './catalog-card';

const item: CatalogCardModel = {
  provider: 'tmdb',
  externalId: 123,
  mediaType: 'movie',
  title: 'The Batman',
  originalTitle: null,
  overview: null,
  posterUrl: null,
  backdropUrl: null,
  releaseDate: '2022-03-04',
  releaseYear: 2022,
  externalRating: 8.3,
  voteCount: 1,
  genreIds: [],
};

function renderCard() {
  return render(
    <ThemeProvider theme={createTheme()}>
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <CatalogCard item={item} />
        </MemoryRouter>
      </QueryClientProvider>
    </ThemeProvider>,
  );
}

describe('CatalogCard', () => {
  it('provides a Details action for the catalog detail route', () => {
    renderCard();

    expect(screen.getByRole('link', { name: 'Details for The Batman' })).toHaveAttribute(
      'href',
      '/explore/movie/123',
    );
  });

  it('offers an enabled pending action', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    renderCard();

    expect(
      screen.getByRole('button', {
        name: 'Add The Batman to pending',
      }),
    ).toBeEnabled();
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('shows a visual membership label instead of the add action for existing items', () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <QueryClientProvider client={new QueryClient()}>
          <MemoryRouter>
            <CatalogCard
              item={item}
              membership={{
                externalId: item.externalId,
                mediaType: item.mediaType,
                status: 'WATCHLIST',
                libraryItemId: '8a7ef9a5-89a3-4b31-b94b-1f5726ffb9ec',
                watchedAt: null,
                personalRating: null,
                privateComment: null,
              }}
            />
          </MemoryRouter>
        </QueryClientProvider>
      </ThemeProvider>,
    );

    expect(screen.getByText('In your library')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add The Batman to pending' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Details for The Batman' })).toHaveAttribute(
      'href',
      '/explore/movie/123',
    );
  });

  it('includes overlay action hooks for hover and keyboard focus behavior', () => {
    const { container } = renderCard();
    const posterLink = screen.getByRole('link', { name: 'View poster for The Batman' });
    posterLink.focus();

    expect(container.querySelector('.catalog-card-overlay')).toBeInTheDocument();
    expect(container.querySelector('.catalog-card-actions')).toBeInTheDocument();
    expect(posterLink).toHaveFocus();
  });
});
