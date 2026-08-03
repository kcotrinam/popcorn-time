import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppThemeProvider } from '@/app/theme/theme-provider';
import { LandingPage } from './landing-page';

function renderLanding(initialEntry = '/') {
  const router = createMemoryRouter(
    [
      { path: '/', element: <LandingPage /> },
      { path: '/sign-in', element: <p>Sign-in page</p> },
    ],
    { initialEntries: [initialEntry] },
  );
  return render(
    <AppThemeProvider>
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AppThemeProvider>,
  );
}

describe('LandingPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 401 })));
  });
  it('renders publicly at the root route without authentication state', () => {
    renderLanding();
    expect(
      screen.getByRole('heading', { name: 'Everything you want to watch, all in one place.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Popcorn Time, home' })).toHaveAttribute('href', '/');
  });

  it('links the primary CTA to sign in', () => {
    renderLanding();
    expect(screen.getByRole('link', { name: 'Create my library' })).toHaveAttribute(
      'href',
      '/sign-in',
    );
  });

  it('shows a profile avatar instead of sign-in actions for an authenticated user', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(['current-user'], {
      id: 'user-id',
      email: 'ana@example.com',
      displayName: 'Ana Torres',
      avatarUrl: null,
      username: null,
      preferredLanguage: 'ES',
      theme: 'SYSTEM',
    });
    const router = createMemoryRouter([{ path: '/', element: <LandingPage /> }], {
      initialEntries: ['/'],
    });
    render(
      <AppThemeProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AppThemeProvider>,
    );
    expect(screen.getByRole('link', { name: 'Abrir aplicación para Ana Torres' })).toHaveAttribute(
      'href',
      '/explore',
    );
    expect(screen.getByRole('link', { name: 'Explorar' })).toHaveAttribute('href', '/explore');
    expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument();
  });
});
