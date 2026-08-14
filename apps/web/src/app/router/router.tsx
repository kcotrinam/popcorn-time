import { createBrowserRouter } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import {
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from '@/features/auth/pages/token-pages';
import { SignInPage } from '@/features/auth/pages/sign-in-page';
import { SignUpPage } from '@/features/auth/pages/sign-up-page';
import { WelcomePage } from '@/features/auth/pages/welcome-page';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { PublicOnlyRoute } from '@/features/auth/components/public-only-route';
import { LandingPage } from '@/features/landing/pages/landing-page';
import { AppShell } from '@/features/catalog/components/app-shell';
import { ExplorePage } from '@/features/catalog/pages/explore-page';
import { CatalogDetailPage } from '@/features/catalog/pages/catalog-detail-page';
import { LibraryPage } from '@/features/library/pages/library-page';
import { ManualRegistrationPage } from '@/features/library/pages/manual-registration-page';
import { HomePage } from '@/features/home/pages/home-page';
import { RecommendationsPage } from '@/features/recommendations/pages/recommendations-page';
import { SharedPage } from '@/features/shared/pages/shared-page';
import { SharedPlanDetailPage } from '@/features/shared/pages/shared-plan-detail-page';
import { NotificationsPage } from '@/features/notifications/pages/notifications-page';
export const router = createBrowserRouter([
  {
    path: '/notifications',
    element: (
      <ProtectedRoute>
        <AppShell>
          <NotificationsPage />
        </AppShell>
      </ProtectedRoute>
    ),
  },
  { path: '/', element: <LandingPage /> },
  {
    path: '/shared',
    element: (
      <ProtectedRoute>
        <AppShell>
          <SharedPage />
        </AppShell>
      </ProtectedRoute>
    ),
  },
  {
    path: '/shared/:id',
    element: (
      <ProtectedRoute>
        <AppShell>
          <SharedPlanDetailPage />
        </AppShell>
      </ProtectedRoute>
    ),
  },
  {
    path: '/recommendations',
    element: (
      <ProtectedRoute>
        <AppShell>
          <RecommendationsPage />
        </AppShell>
      </ProtectedRoute>
    ),
  },
  {
    path: '/sign-in',
    element: (
      <PublicOnlyRoute>
        <SignInPage />
      </PublicOnlyRoute>
    ),
  },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    path: '/sign-up',
    element: (
      <PublicOnlyRoute>
        <SignUpPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/welcome',
    element: (
      <ProtectedRoute>
        <WelcomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/home',
    element: (
      <ProtectedRoute>
        <AppShell>
          <HomePage />
        </AppShell>
      </ProtectedRoute>
    ),
  },
  {
    path: '/explore',
    element: (
      <ProtectedRoute>
        <AppShell>
          <ExplorePage />
        </AppShell>
      </ProtectedRoute>
    ),
  },
  {
    path: '/library',
    element: (
      <ProtectedRoute>
        <AppShell>
          <LibraryPage />
        </AppShell>
      </ProtectedRoute>
    ),
  },
  {
    path: '/library/manual',
    element: (
      <ProtectedRoute>
        <AppShell>
          <ManualRegistrationPage />
        </AppShell>
      </ProtectedRoute>
    ),
  },
  {
    path: '/explore/:type/:id',
    element: (
      <ProtectedRoute>
        <AppShell>
          <CatalogDetailPage />
        </AppShell>
      </ProtectedRoute>
    ),
  },
  { path: '*', element: <Navigate to="/sign-in" replace /> },
]);
