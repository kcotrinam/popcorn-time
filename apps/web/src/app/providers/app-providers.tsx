import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Auth0Provider } from '@auth0/auth0-react';
import { Alert, Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { AppThemeProvider } from '../theme/theme-provider';
import { authConfig, hasAuthConfiguration } from '@/features/auth/auth.config';
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});
function AuthConfigurationError() {
  return (
    <Box minHeight="100vh" display="grid" sx={{ placeItems: 'center', p: 3 }}>
      <Stack maxWidth={560} spacing={2}>
        <Typography variant="h4">Authentication is not configured</Typography>
        <Alert severity="info">
          Add VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID to your local environment before signing
          in.
        </Alert>
      </Stack>
    </Box>
  );
}
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppThemeProvider>
      <QueryClientProvider client={queryClient}>
        {hasAuthConfiguration ? (
      <Auth0Provider
        domain={authConfig.domain}
        clientId={authConfig.clientId}
        authorizationParams={{
          redirect_uri: authConfig.redirectUri,
          ...(authConfig.audience ? { audience: authConfig.audience } : {}),
          scope: 'openid profile email',
        }}
            onRedirectCallback={(appState) =>
              window.history.replaceState({}, document.title, appState?.returnTo ?? '/welcome')
            }
          >
            {children}
          </Auth0Provider>
        ) : (
          <AuthConfigurationError />
        )}
      </QueryClientProvider>
    </AppThemeProvider>
  );
}
