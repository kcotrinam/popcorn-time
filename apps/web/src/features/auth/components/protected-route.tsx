import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthenticationLoadingScreen } from './auth-loading-screen';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, error } = useAuth0();
  if (isLoading) return <AuthenticationLoadingScreen />;
  if (error) return <Navigate to="/auth/error" replace />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/sign-in" replace />;
}
