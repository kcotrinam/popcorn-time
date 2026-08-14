import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { setupUsername } from '../auth.api';

export function UsernameSetupDialog({ open }: { open: boolean }) {
  const [username, setUsername] = useState('');
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: setupUsername,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['current-user'] }),
  });
  return (
    <Dialog open={open} aria-labelledby="username-setup-title" fullWidth maxWidth="xs">
      <DialogTitle id="username-setup-title">Choose your username</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography color="text.secondary">
            A username lets other Popcorn Time users send you private recommendations.
          </Typography>
          <TextField
            autoFocus
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            helperText="3–30 letters, numbers, or underscores"
            error={mutation.isError}
          />
          {mutation.isError ? (
            <Alert severity="error">That username is unavailable. Try another one.</Alert>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => mutation.mutate(username)}
          disabled={mutation.isPending || username.trim().length < 3}
        >
          {mutation.isPending ? 'Saving…' : 'Save username'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
