import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppThemeProvider } from '@/app/theme/theme-provider';
import { StatusPage } from './status-page';
const renderPage = () =>
  render(
    <AppThemeProvider>
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <StatusPage />
      </QueryClientProvider>
    </AppThemeProvider>,
  );
describe('StatusPage', () => {
  it('renders real health response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            status: 'ok',
            services: { api: 'up', database: 'up' },
            timestamp: new Date().toISOString(),
          }),
          { status: 200 },
        ),
      ),
    );
    renderPage();
    expect(await screen.findByText('Database: Healthy')).toBeInTheDocument();
  });
  it('shows an error and retries', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('{}', { status: 500, statusText: 'Down' }));
    vi.stubGlobal('fetch', fetchMock);
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Retry' }));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('persists a selected theme', () => {
    renderPage();
    fireEvent.mouseDown(screen.getByLabelText('Theme'));
    fireEvent.click(screen.getByText('Dark'));
    expect(localStorage.getItem('popcorn-time-theme-mode')).toBe('dark');
  });
});
