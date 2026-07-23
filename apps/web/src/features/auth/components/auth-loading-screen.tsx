import { CircularProgress, Stack, Typography } from '@mui/material';

export function AuthenticationLoadingScreen() {
  return (
    <Stack
      minHeight="100vh"
      alignItems="center"
      justifyContent="center"
      spacing={2}
      role="status"
      aria-live="polite"
    >
      <CircularProgress aria-label="Preparing your account" />
      <Typography>Preparing your account...</Typography>
    </Stack>
  );
}
