import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthenticationLoadingScreen } from './auth-loading-screen';
import { getCurrentUser } from '../auth.api';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoading, isSuccess } = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
    retry: false,
  });
  if (isLoading) return <AuthenticationLoadingScreen />;
  return isSuccess ? <>{children}</> : <Navigate to="/sign-in" replace />;
}
