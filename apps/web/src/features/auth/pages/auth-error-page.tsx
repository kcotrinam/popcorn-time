import { Button, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { AuthLayout } from '../components/auth-layout';
import { useAuthActions } from '../hooks/use-auth-actions';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';

export function AuthErrorPage() {
  const { error } = useAuth0();
  const { signInWithEmail } = useAuthActions();
  useEffect(() => {
    if (window.location.hostname === 'localhost' && error) {
      console.error('Auth0 authentication error:', { name: error.name, message: error.message });
    }
  }, [error]);
  return (
    <AuthLayout>
      <Paper sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={3}>
          <Typography variant="h4">We could not complete your authentication.</Typography>
          <Typography color="text.secondary">
            Please try again or return to the home page.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={signInWithEmail}>
              Try signing in
            </Button>
            <Button component={RouterLink} to="/sign-in" variant="outlined">
              Return home
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </AuthLayout>
  );
}
