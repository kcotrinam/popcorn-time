import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { AppThemeProvider } from '@/app/theme/theme-provider';
import { SignInPage } from './pages/sign-in-page';
import { SignUpPage } from './pages/sign-up-page';
import { WelcomePage } from './pages/welcome-page';
import { ProtectedRoute } from './components/protected-route';
import { PublicOnlyRoute } from './components/public-only-route';

const loginWithRedirect = vi.fn();
const logout = vi.fn();
const authState: {
  isLoading: boolean;
  isAuthenticated: boolean;
  error?: Error;
  user?: { name?: string; nickname?: string; email?: string };
} = { isLoading: false, isAuthenticated: false };
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({ ...authState, loginWithRedirect, logout }),
}));

function renderAuth(ui: React.ReactNode, initialEntry = '/') {
  return render(
    <AppThemeProvider>
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={[initialEntry]}>{ui}</MemoryRouter>
      </QueryClientProvider>
    </AppThemeProvider>,
  );
}
beforeEach(() => {
  authState.isLoading = false;
  authState.isAuthenticated = false;
  authState.error = undefined;
  authState.user = undefined;
  loginWithRedirect.mockReset();
  logout.mockReset();
});

describe('Auth0 Universal Login screens', () => {
  it('starts email sign-up with Auth0 sign-up mode', () => {
    renderAuth(<SignUpPage />);
    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue with email' }));
    expect(loginWithRedirect).toHaveBeenLastCalledWith(
      expect.objectContaining({
        authorizationParams: expect.objectContaining({ screen_hint: 'signup' }),
      }),
    );
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/sign-in');
  });

  it('starts email sign-in without a sign-up hint', () => {
    renderAuth(<SignInPage />);
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue with email' }));
    expect(loginWithRedirect.mock.lastCall?.[0].authorizationParams.screen_hint).toBeUndefined();
  });

  it('guards public and protected routes', () => {
    renderAuth(
      <Routes>
        <Route
          path="/welcome"
          element={
            <ProtectedRoute>
              <p>Protected content</p>
            </ProtectedRoute>
          }
        />
        <Route path="/sign-in" element={<p>Sign in page</p>} />
      </Routes>,
      '/welcome',
    );
    expect(screen.getByText('Sign in page')).toBeInTheDocument();
    authState.isAuthenticated = true;
    renderAuth(
      <Routes>
        <Route
          path="/sign-in"
          element={
            <PublicOnlyRoute>
              <p>Public content</p>
            </PublicOnlyRoute>
          }
        />
        <Route path="/welcome" element={<p>Welcome route</p>} />
      </Routes>,
      '/sign-in',
    );
    expect(screen.getByText('Welcome route')).toBeInTheDocument();
  });

  it('resolves the welcome name safely and signs out through Auth0', () => {
    authState.isAuthenticated = true;
    authState.user = { email: 'cinephile@example.com' };
    renderAuth(<WelcomePage />);
    expect(screen.getByRole('heading', { name: 'Welcome, cinephile' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(logout).toHaveBeenCalledWith(
      expect.objectContaining({ logoutParams: expect.any(Object) }),
    );
  });
});
