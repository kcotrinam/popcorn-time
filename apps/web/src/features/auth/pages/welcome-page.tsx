import { Button, Stack, Typography } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuthActions } from '../hooks/use-auth-actions';

export function WelcomePage() {
  const { user } = useAuth0();
  const { signOut } = useAuthActions();
  const name = user?.name ?? user?.nickname ?? user?.email?.split('@')[0] ?? 'User';
  return (
    <Stack minHeight="100vh" alignItems="center" justifyContent="center" spacing={3}>
      <Typography variant="h3" component="h1">
        Welcome, {name}
      </Typography>
      <Button variant="text" color="secondary" onClick={signOut}>
        Sign out
      </Button>
    </Stack>
  );
}
