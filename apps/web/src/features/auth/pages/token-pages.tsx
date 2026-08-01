import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { forgotPassword, resetPassword, verifyEmail } from '../auth.api';
import { AuthLayout } from '../components/auth-layout';
export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const mutation = useMutation({ mutationFn: verifyEmail });
  return (
    <AuthLayout>
      <Paper sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Verify your email</Typography>
          {mutation.isSuccess ? (
            <Alert severity="success">Email verified. You can sign in now.</Alert>
          ) : (
            <Button
              variant="contained"
              disabled={!params.get('token')}
              onClick={() => mutation.mutate(params.get('token') ?? '')}
            >
              Verify email
            </Button>
          )}
          {mutation.error ? <Alert severity="error">This link is invalid or expired.</Alert> : null}
          <Button component={RouterLink} to="/sign-in">
            Sign in
          </Button>
        </Stack>
      </Paper>
    </AuthLayout>
  );
}
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const mutation = useMutation({ mutationFn: forgotPassword });
  return (
    <AuthLayout>
      <Paper sx={{ p: 4 }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(email);
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h4">Reset password</Typography>
            <TextField
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {mutation.isSuccess ? (
              <Alert severity="info">
                If the account is eligible, an email will be sent shortly.
              </Alert>
            ) : null}
            <Button type="submit" variant="contained">
              Send reset link
            </Button>
          </Stack>
        </form>
      </Paper>
    </AuthLayout>
  );
}
export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const mutation = useMutation({
    mutationFn: () => resetPassword(params.get('token') ?? '', password),
  });
  return (
    <AuthLayout>
      <Paper sx={{ p: 4 }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h4">Choose a new password</Typography>
            <TextField
              label="New password"
              type="password"
              required
              helperText="At least 12 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {mutation.isSuccess ? (
              <Alert severity="success">Password changed. Please sign in.</Alert>
            ) : null}
            {mutation.error ? (
              <Alert severity="error">This link is invalid or expired.</Alert>
            ) : null}
            <Button type="submit" variant="contained">
              Reset password
            </Button>
          </Stack>
        </form>
      </Paper>
    </AuthLayout>
  );
}
