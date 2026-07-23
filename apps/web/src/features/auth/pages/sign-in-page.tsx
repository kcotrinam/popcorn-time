import MovieFilterRoundedIcon from '@mui/icons-material/MovieFilterRounded';
import { Link as RouterLink } from 'react-router-dom';
import { Link, Paper, Stack, Typography } from '@mui/material';
import { APP_NAME } from '@popcorn-time/shared';
import { AuthActions } from '../components/auth-actions';
import { AuthLayout } from '../components/auth-layout';
import { useAuthActions } from '../hooks/use-auth-actions';

export function SignInPage() {
  const { signInWithEmail } = useAuthActions();
  return (
    <AuthLayout>
      <Stack spacing={4}>
        <Stack direction="row" spacing={1} alignItems="center" display={{ md: 'none' }}>
          <MovieFilterRoundedIcon color="primary" aria-hidden="true" />
          <Typography fontWeight={700}>{APP_NAME}</Typography>
        </Stack>
        <Stack spacing={1}>
          <Typography variant="h4">Welcome back</Typography>
          <Typography color="text.secondary">
            Sign in to continue building your personal cinematic archive. Do not have an account?{' '}
            <Link component={RouterLink} to="/sign-up" color="primary">
              Create one
            </Link>
          </Typography>
        </Stack>
        <Paper sx={{ p: { xs: 3, sm: 4 } }}>
          <AuthActions emailLabel="Continue with email" onEmail={signInWithEmail} />
        </Paper>
      </Stack>
    </AuthLayout>
  );
}
