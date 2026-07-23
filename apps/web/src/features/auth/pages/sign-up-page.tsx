import MovieFilterRoundedIcon from '@mui/icons-material/MovieFilterRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { Checkbox, FormControlLabel, Link, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { APP_NAME } from '@popcorn-time/shared';
import { AuthActions } from '../components/auth-actions';
import { AuthLayout } from '../components/auth-layout';
import { useAuthActions } from '../hooks/use-auth-actions';

export function SignUpPage() {
  const { signUpWithEmail } = useAuthActions();
  return (
    <AuthLayout>
      <Stack spacing={4} maxWidth={448} mx="auto">
        <Stack direction="row" spacing={1} alignItems="center" display={{ md: 'none' }}>
          <MovieFilterRoundedIcon color="primary" aria-hidden="true" />
          <Typography fontWeight={700}>{APP_NAME}</Typography>
        </Stack>
        <Stack spacing={1}>
          <Typography variant="h4">Create your account</Typography>
          <Typography color="text.secondary">
            Join the community of cinema enthusiasts. Already have an account?{' '}
            <Link component={RouterLink} to="/sign-in" color="primary">
              Sign in
            </Link>
          </Typography>
        </Stack>
        <AuthActions emailLabel="Continue with email" onEmail={signUpWithEmail} />
        <Stack spacing={3.25} pt={1}>
          <Feature
            icon={<ShieldOutlinedIcon />}
            title="Secure & Trusted"
            description="Your account is protected by Auth0, an industry-leading identity platform."
          />
          <Feature
            icon={<PersonOutlineRoundedIcon />}
            title="One Account, All Devices"
            description="Access your library and watchlist from anywhere."
          />
          <Feature
            icon={<MovieOutlinedIcon />}
            title="Personalized Experience"
            description="Get recommendations and track your cinematic journey."
          />
        </Stack>
        <FormControlLabel
          sx={{ alignItems: 'flex-start', m: 0, '& .MuiFormControlLabel-label': { pt: '5px' } }}
          control={
            <Checkbox
              size="small"
              sx={{ p: 0, mr: 1.5 }}
              inputProps={{ 'aria-label': 'Agree to terms and privacy policy' }}
            />
          }
          label={
            <Typography variant="caption" color="text.secondary">
              I agree to the{' '}
              <Link href="#terms" color="primary">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#privacy" color="primary">
                Privacy Policy
              </Link>
              .
            </Typography>
          }
        />
        <Typography variant="caption" color="text.secondary" pt={2}>
          © 2024 {APP_NAME}. All cinematic rights reserved.
        </Typography>
      </Stack>
    </AuthLayout>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <Typography color="text.secondary" sx={{ display: 'flex', pt: '2px' }} aria-hidden="true">
        {icon}
      </Typography>
      <Stack spacing={0.25}>
        <Typography variant="body2" fontWeight={500}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </Stack>
    </Stack>
  );
}
