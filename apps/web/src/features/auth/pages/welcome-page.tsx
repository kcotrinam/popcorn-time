import { Button, Stack, Typography } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { clearCsrfToken } from '@/services/http-client';
import { getCurrentUser, logout } from '../auth.api';
export function WelcomePage() {
  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: getCurrentUser });
  const client = useQueryClient();
  const signOut = () => {
    void logout().finally(() => {
      clearCsrfToken();
      client.clear();
      window.location.assign('/sign-in');
    });
  };
  return (
    <Stack minHeight="100vh" alignItems="center" justifyContent="center" spacing={3}>
      <Typography variant="h3" component="h1">
        Welcome, {user?.displayName ?? 'User'}
      </Typography>
      <Typography color="text.secondary">{user?.email}</Typography>
      <Button variant="text" color="secondary" onClick={signOut}>
        Sign out
      </Button>
    </Stack>
  );
}
