import {
  Alert,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CatalogCard } from '@popcorn-time/shared';
import { useState } from 'react';
import { getCurrentUser } from '@/features/auth/auth.api';
import { createRecommendation, lookupUsername, setupUsername } from '../recommendations.api';
export function RecommendDialog({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: Pick<CatalogCard, 'provider' | 'externalId' | 'mediaType' | 'title'>;
}) {
  const client = useQueryClient();
  const user = useQuery({ queryKey: ['current-user'], queryFn: getCurrentUser });
  const [username, setUsername] = useState('');
  const [lookup, setLookup] = useState(false);
  const lookupQuery = useQuery({
    queryKey: ['username-lookup', username],
    queryFn: ({ signal }) => lookupUsername(username, signal),
    enabled: lookup && username.trim().length >= 3,
    retry: false,
  });
  const setup = useMutation({
    mutationFn: setupUsername,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['current-user'] });
    },
  });
  const send = useMutation({
    mutationFn: () =>
      createRecommendation({
        recipientUsername: username,
        provider: item.provider,
        externalId: item.externalId,
        mediaType: item.mediaType,
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['recommendations'] });
      onClose();
    },
  });
  const needsUsername = !user.data?.username;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" aria-labelledby="recommend-title">
      <DialogTitle id="recommend-title">Recommend {item.title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {needsUsername ? (
            <>
              <Typography color="text.secondary">
                Choose your username before sending recommendations.
              </Typography>
              <TextField
                autoFocus
                label="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                helperText="3–30 letters, numbers, or underscores"
              />
              <Button
                variant="contained"
                onClick={() => setup.mutate(username)}
                disabled={setup.isPending || username.length < 3}
              >
                Save username
              </Button>
              {setup.error ? <Alert severity="error">That username is unavailable.</Alert> : null}
            </>
          ) : (
            <>
              <Typography color="text.secondary">
                Send this title privately by exact username.
              </Typography>
              <TextField
                autoFocus
                label="Recipient username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setLookup(false);
                }}
              />
              <Button
                variant="outlined"
                onClick={() => setLookup(true)}
                disabled={username.trim().length < 3 || lookupQuery.isFetching}
              >
                Look up username
              </Button>
              {lookupQuery.data?.user ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar src={lookupQuery.data.user.avatarUrl ?? undefined}>
                    {lookupQuery.data.user.displayName[0]}
                  </Avatar>
                  <Typography>
                    {lookupQuery.data.user.displayName} (@{lookupQuery.data.user.username})
                  </Typography>
                </Stack>
              ) : null}
              {lookup && !lookupQuery.isFetching && !lookupQuery.data?.user ? (
                <Alert severity="info">No eligible user was found with that username.</Alert>
              ) : null}
              {send.error ? (
                <Alert severity="error">
                  This recommendation could not be sent. It may already exist.
                </Alert>
              ) : null}
              {send.isSuccess ? <Alert severity="success">Recommendation sent.</Alert> : null}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {!needsUsername ? (
          <Button
            variant="contained"
            onClick={() => send.mutate()}
            disabled={!lookupQuery.data?.user || send.isPending}
          >
            {send.isPending ? 'Sending…' : 'Send recommendation'}
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}
