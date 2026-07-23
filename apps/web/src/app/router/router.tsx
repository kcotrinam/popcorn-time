import { createBrowserRouter } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { AuthErrorPage } from '@/features/auth/pages/auth-error-page';
import { SignInPage } from '@/features/auth/pages/sign-in-page';
import { SignUpPage } from '@/features/auth/pages/sign-up-page';
import { WelcomePage } from '@/features/auth/pages/welcome-page';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { PublicOnlyRoute } from '@/features/auth/components/public-only-route';
export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/sign-in" replace /> },
  {
    path: '/sign-in',
    element: (
      <PublicOnlyRoute>
        <SignInPage />
      </PublicOnlyRoute>
    ),
  },
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
  { path: '/auth/error', element: <AuthErrorPage /> },
  { path: '*', element: <Navigate to="/sign-in" replace /> },
]);
