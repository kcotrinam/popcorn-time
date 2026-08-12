import { Alert, Button, Link, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { register } from '../auth.api';
import { AuthLayout } from '../components/auth-layout';
export function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const mutation = useMutation({ mutationFn: register });
  return (
    <AuthLayout>
      <Stack spacing={3}>
        <Typography variant="h4">Create your account</Typography>
        <Typography color="text.secondary">
          Already have an account?{' '}
          <Link component={RouterLink} to="/sign-in">
            Sign in
          </Link>
        </Typography>
        <Paper sx={{ p: 4 }}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate({ email, password, displayName, username });
            }}
          >
            <Stack spacing={2}>
              <TextField
                label="Display name"
                required
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
              <TextField
                label="Username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                helperText="3–30 letters, numbers, or underscores"
              />
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
                helperText="At least 12 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {mutation.isSuccess ? (
                <Alert severity="success">Check your email to verify your account.</Alert>
              ) : null}
              {mutation.error ? (
                <Alert severity="error">Please check your details and try again.</Alert>
              ) : null}
              <Button type="submit" variant="contained" disabled={mutation.isPending}>
                Create account
              </Button>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </AuthLayout>
  );
}
