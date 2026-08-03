import { ThemeProvider, createTheme } from '@mui/material';
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
      <MemoryRouter>
        <CatalogCard item={item} />
      </MemoryRouter>
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

  it('keeps the pending action unavailable without making a request', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    renderCard();

    expect(
      screen.getByRole('button', {
        name: 'Add The Batman to pending, coming in your personal library',
      }),
    ).toBeDisabled();
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
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
