import '@testing-library/jest-dom/vitest';
import { ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { HttpError } from '@/services/http-client';

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock('../library.api', () => ({ addManualToLibrary: vi.fn() }));
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => navigate,
}));

import { addManualToLibrary } from '../library.api';
import { ManualRegistrationPage } from './manual-registration-page';

const addManual = addManualToLibrary as ReturnType<typeof vi.fn>;
function renderPage() {
  return render(
    <ThemeProvider theme={createTheme()}>
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <MemoryRouter>
          <ManualRegistrationPage />
        </MemoryRouter>
      </QueryClientProvider>
    </ThemeProvider>,
  );
}

describe('ManualRegistrationPage', () => {
  it('validates required title and HTTPS poster URLs', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Save for later' }));
    expect(screen.getByText('Title is required.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('External poster URL (optional)'), {
      target: { value: 'http://example.test/poster.jpg' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save for later' }));
    expect(screen.getByText('Enter a valid HTTPS URL.')).toBeInTheDocument();
  });

  it('saves both actions with the matching initial status and refreshes library data', async () => {
    addManual.mockResolvedValue({ item: {} });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    render(
      <ThemeProvider theme={createTheme()}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ManualRegistrationPage />
          </MemoryRouter>
        </QueryClientProvider>
      </ThemeProvider>,
    );
    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: 'Private film' } });
    fireEvent.click(screen.getByText('Anime'));
    fireEvent.click(screen.getByRole('button', { name: 'Save as watched' }));
    await waitFor(() =>
      expect(addManual).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'WATCHED', categories: ['Anime'] }),
      ),
    );
    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ['library'] }));
  });

  it('navigates to the exact catalog match or an ambiguous Explore search without invalidating library data', async () => {
    addManual.mockRejectedValueOnce(
      new HttpError(409, 'Matching catalog content exists', 'CATALOG_EXACT_MATCH', {
        mediaType: 'movie',
        externalId: 42,
      }),
    );
    renderPage();
    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: 'Arrival' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save for later' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/explore/movie/42'));

    addManual.mockRejectedValueOnce(
      new HttpError(409, 'Multiple catalog matches exist', 'CATALOG_AMBIGUOUS_MATCH', {
        mediaType: 'tv',
        query: 'Signal',
      }),
    );
    renderPage();
    fireEvent.change(screen.getAllByLabelText(/Title/).at(-1)!, { target: { value: 'Signal' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Save for later' }).at(-1)!);
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/explore?query=Signal&type=tv'));
  });

  it('preserves the form and offers a retry message when TMDB is unavailable', async () => {
    addManual.mockRejectedValueOnce(new HttpError(503, 'Catalog service is unavailable'));
    renderPage();
    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: 'Private film' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save for later' }));
    expect(
      await screen.findByText('TMDB could not be verified. Please try again.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/)).toHaveValue('Private film');
  });

  it('uses the fallback before a valid poster is supplied and renders an image preview for HTTPS URLs', () => {
    renderPage();
    expect(screen.getByRole('img', { name: 'Poster unavailable' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('External poster URL (optional)'), {
      target: { value: 'https://images.example.test/poster.jpg' },
    });
    expect(screen.getByRole('img', { name: 'Poster preview' })).toHaveAttribute(
      'src',
      'https://images.example.test/poster.jpg',
    );
    fireEvent.error(screen.getByRole('img', { name: 'Poster preview' }));
    expect(screen.getByRole('img', { name: 'Poster unavailable' })).toBeInTheDocument();
  });
});
