import { ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock('@/features/auth/auth.api', () => ({ getCurrentUser: vi.fn() }));
vi.mock('@/features/library/library.api', () => ({ getLibrary: vi.fn() }));
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => navigate,
}));

import { getCurrentUser } from '@/features/auth/auth.api';
import { getLibrary } from '@/features/library/library.api';
import { HomePage } from './home-page';

const user = getCurrentUser as ReturnType<typeof vi.fn>;
const library = getLibrary as ReturnType<typeof vi.fn>;

function renderPage() {
  return render(
    <ThemeProvider theme={createTheme()}>
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <MemoryRouter initialEntries={['/home']}>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>
    </ThemeProvider>,
  );
}

describe('HomePage', () => {
  afterEach(() => vi.clearAllMocks());

  it('loads user-specific Pending and Watched sections without fake deferred content', async () => {
    user.mockResolvedValue({ displayName: 'Alex' });
    library.mockResolvedValue({
      results: [],
      page: 1,
      pageSize: 5,
      totalPages: 1,
      totalResults: 0,
    });
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Welcome back, Alex.' })).toBeInTheDocument();
    await waitFor(() => expect(library).toHaveBeenCalledTimes(2));
    expect(library).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'WATCHLIST', sort: 'addedAt.desc', pageSize: 5 }),
      expect.any(AbortSignal),
    );
    expect(library).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'WATCHED', sort: 'watchedAt.desc', pageSize: 5 }),
      expect.any(AbortSignal),
    );
    expect(screen.getByText('No recommendations for you yet.')).toBeInTheDocument();
    expect(screen.getByText('No shared plans with you.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add manually' })).toBeDisabled();
  });

  it('submits a library-only search to the Library route', async () => {
    user.mockResolvedValue({ displayName: 'Alex' });
    library.mockResolvedValue({
      results: [],
      page: 1,
      pageSize: 5,
      totalPages: 1,
      totalResults: 0,
    });
    renderPage();
    fireEvent.change(screen.getByLabelText('Search your library…'), {
      target: { value: 'arrival' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Search library' }));
    expect(navigate).toHaveBeenCalledWith('/library?query=arrival');
  });
});
