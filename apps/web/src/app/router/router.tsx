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
export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
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
  { path: '*', element: <Navigate to="/sign-in" replace /> },
]);
