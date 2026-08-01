import { Alert, Button, Link, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { login } from '../auth.api';
import { AuthLayout } from '../components/auth-layout';
export function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      client.setQueryData(['current-user'], user);
      window.location.assign('/welcome');
    },
  });
  return (
    <AuthLayout>
      <Stack spacing={3}>
        <Typography variant="h4">Welcome back</Typography>
        <Typography color="text.secondary">
          Do not have an account?{' '}
          <Link component={RouterLink} to="/sign-up">
            Create one
          </Link>
        </Typography>
        <Paper sx={{ p: 4 }}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate({ email, password });
            }}
          >
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {mutation.error ? <Alert severity="error">Invalid email or password.</Alert> : null}
              <Button type="submit" variant="contained" disabled={mutation.isPending}>
                Sign in
              </Button>
              <Link component={RouterLink} to="/forgot-password">
                Forgot password?
              </Link>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </AuthLayout>
  );
}
