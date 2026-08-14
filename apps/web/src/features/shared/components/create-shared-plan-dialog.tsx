import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { CatalogCard } from '@popcorn-time/shared';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lookupUsername } from '@/features/recommendations/recommendations.api';
import { createSharedPlan } from '../shared-plans.api';
export function CreateSharedPlanDialog({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item?: Pick<CatalogCard, 'provider' | 'externalId' | 'mediaType' | 'title'>;
}) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [names, setNames] = useState<string[]>([]);
  const lookup = useQuery({
    queryKey: ['username-lookup', username],
    queryFn: ({ signal }) => lookupUsername(username, signal),
    enabled: username.trim().length >= 3 && !names.includes(username),
    retry: false,
  });
  const create = useMutation({
    mutationFn: () =>
      createSharedPlan({
        provider: item!.provider,
        externalId: item!.externalId,
        mediaType: item!.mediaType,
        usernames: names,
      }),
    onSuccess: (plan) => {
      onClose();
      void navigate(`/shared/${plan.id}`);
    },
  });
  if (!item) return null;
  const add = () => {
    const value = lookup.data?.user?.username;
    if (value && !names.includes(value) && names.length < 9) {
      setNames([...names, value]);
      setUsername('');
    }
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Watch {item.title} together</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography color="text.secondary">
            Invite up to 9 people by exact username. Plans can have up to 10 users including you.
          </Typography>
          <TextField
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            helperText={
              lookup.isFetching
                ? 'Looking up user…'
                : lookup.data?.user
                  ? `Found ${lookup.data.user.displayName}`
                  : 'Enter an exact active username'
            }
          />
          <Button
            variant="outlined"
            onClick={add}
            disabled={!lookup.data?.user || names.length >= 9}
          >
            Add participant
          </Button>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {names.map((name) => (
              <Chip
                key={name}
                label={`@${name}`}
                onDelete={() => setNames(names.filter((value) => value !== name))}
              />
            ))}
          </Stack>
          {create.error ? (
            <Alert severity="error">
              We could not create this plan. Check the invitees and try again.
            </Alert>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!names.length || create.isPending}
          onClick={() => create.mutate()}
        >
          {create.isPending ? 'Creating…' : 'Create plan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
