import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthenticationLoadingScreen } from './auth-loading-screen';

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth0();
  if (isLoading) return <AuthenticationLoadingScreen />;
  return isAuthenticated ? <Navigate to="/welcome" replace /> : <>{children}</>;
}
