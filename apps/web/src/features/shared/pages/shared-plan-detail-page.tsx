import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser } from '@/features/auth/auth.api';
import {
  acceptSharedPlan,
  cancelSharedPlan,
  completeSharedPlan,
  declineOrLeaveSharedPlan,
  getSharedPlan,
  updateSharedProgress,
} from '../shared-plans.api';
const today = () => new Date().toISOString().slice(0, 10);
const progressStatusLabels = {
  NOT_STARTED: 'Not started',
  WATCHING: 'Watching',
  WATCHED: 'Watched',
} as const;
export function SharedPlanDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [minute, setMinute] = useState('0');
  const [completeOpen, setCompleteOpen] = useState(false);
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [watchedAt, setWatchedAt] = useState(today());
  const plan = useQuery({
    queryKey: ['shared-plan', id],
    queryFn: ({ signal }) => getSharedPlan(id, signal),
    enabled: Boolean(id),
  });
  const user = useQuery({ queryKey: ['current-user'], queryFn: getCurrentUser });
  const refresh = () => {
    void client.invalidateQueries({ queryKey: ['shared-plans'] });
    void plan.refetch();
  };
  const action = useMutation({
    mutationFn: async (kind: 'accept' | 'leave' | 'cancel') =>
      kind === 'accept'
        ? acceptSharedPlan(id)
        : kind === 'leave'
          ? declineOrLeaveSharedPlan(id)
          : cancelSharedPlan(id),
    onSuccess: (_, kind) => {
      if (kind === 'leave') void navigate('/shared');
      else refresh();
    },
  });
  const progress = useMutation({
    mutationFn: () => updateSharedProgress(id, { movieMinute: Number(minute) }),
    onSuccess: refresh,
  });
  const complete = useMutation({
    mutationFn: () =>
      completeSharedPlan(id, {
        watchedAt: new Date(`${watchedAt}T12:00:00`),
        rating: rating ? Number(rating) : null,
        comment: comment.trim() || null,
      }),
    onSuccess: () => {
      setCompleteOpen(false);
      refresh();
    },
  });
  if (plan.isLoading)
    return (
      <Container sx={{ py: 5 }}>
        <Typography role="status">Loading shared plan…</Typography>
      </Container>
    );
  if (plan.isError || !plan.data)
    return (
      <Container sx={{ py: 5 }}>
        <Alert
          severity="error"
          action={
            <Button component={RouterLink} to="/shared">
              Back
            </Button>
          }
        >
          We could not load this shared plan.
        </Alert>
      </Container>
    );
  const item = plan.data;
  const me = item.participants.find(
    (participant) => participant.user.username === user.data?.username,
  );
  const creator = item.creator.username === user.data?.username;
  const pending = me?.invitationStatus === 'PENDING';
  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <Stack direction="row" gap={2}>
          <Box
            component="img"
            src={item.posterUrl ?? undefined}
            alt={`Poster for ${item.title}`}
            sx={{
              width: 100,
              height: 150,
              objectFit: 'cover',
              borderRadius: 1,
              bgcolor: 'background.paper',
            }}
          />
          <Box>
            <Typography variant="h4">{item.title}</Typography>
            <Typography color="text.secondary">
              {item.status} · Created by {item.creator.displayName}
            </Typography>
            <Button sx={{ mt: 1 }} onClick={refresh}>
              Refresh
            </Button>
          </Box>
        </Stack>
        {pending ? (
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={() => action.mutate('accept')}>
              Accept invitation
            </Button>
            <Button color="error" onClick={() => action.mutate('leave')}>
              Decline
            </Button>
          </Stack>
        ) : null}
        <Typography variant="h6">Participants</Typography>
        {item.participants.map((participant) => (
          <Stack key={participant.user.username} direction="row" spacing={1.5} alignItems="center">
            <Avatar src={participant.user.avatarUrl ?? undefined}>
              {participant.user.displayName[0]}
            </Avatar>
            <Box flexGrow={1}>
              <Typography>
                {participant.user.displayName} {participant.role === 'CREATOR' ? '(Creator)' : ''}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {progressStatusLabels[participant.progressStatus]}{' '}
                {item.mediaType === 'movie' && participant.movieMinute !== null
                  ? `· ${participant.movieMinute} min`
                  : ''}
              </Typography>
              <LinearProgress variant="determinate" value={participant.progressPercent} />
            </Box>
          </Stack>
        ))}
        {me?.invitationStatus === 'ACCEPTED' &&
        item.status !== 'COMPLETED' &&
        item.status !== 'CANCELLED' ? (
          <PaperControls
            mediaType={item.mediaType}
            minute={minute}
            setMinute={setMinute}
            onProgress={() => progress.mutate()}
            pending={progress.isPending}
            onComplete={() => setCompleteOpen(true)}
          />
        ) : null}
        {creator && (item.status === 'PENDING' || item.status === 'ACTIVE') ? (
          <Button
            color="error"
            onClick={() => {
              if (window.confirm('Cancel this shared plan?')) action.mutate('cancel');
            }}
          >
            Cancel plan
          </Button>
        ) : null}
        {!creator &&
        me?.invitationStatus === 'ACCEPTED' &&
        (item.status === 'PENDING' || item.status === 'ACTIVE') ? (
          <Button
            color="error"
            onClick={() => {
              if (window.confirm('Leave this shared plan?')) action.mutate('leave');
            }}
          >
            Leave plan
          </Button>
        ) : null}
      </Stack>
      <Dialog open={completeOpen} onClose={() => setCompleteOpen(false)}>
        <DialogTitle>Save your experience</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography color="text.secondary">
              This is private to you. Saving marks your shared progress as watched.
            </Typography>
            <TextField
              label="Watched date"
              type="date"
              value={watchedAt}
              onChange={(event) => setWatchedAt(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Rating (optional, 1–10)"
              type="number"
              value={rating}
              onChange={(event) => setRating(event.target.value)}
            />
            <TextField
              label="Private comment (optional)"
              multiline
              minRows={3}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => complete.mutate()}
            disabled={complete.isPending}
          >
            Save and mark watched
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
function PaperControls({
  mediaType,
  minute,
  setMinute,
  onProgress,
  pending,
  onComplete,
}: {
  mediaType: 'movie' | 'tv';
  minute: string;
  setMinute: (value: string) => void;
  onProgress: () => void;
  pending: boolean;
  onComplete: () => void;
}) {
  return (
    <Stack spacing={1}>
      <Typography variant="h6">Your progress</Typography>
      {mediaType === 'movie' ? (
        <TextField
          label="Current minute"
          type="number"
          value={minute}
          onChange={(event) => setMinute(event.target.value)}
        />
      ) : (
        <Typography color="text.secondary">
          Series episode progress can be updated from the available season and episode controls.
        </Typography>
      )}
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={onProgress} disabled={mediaType === 'tv' || pending}>
          Save progress
        </Button>
        <Button variant="contained" onClick={onComplete}>
          Mark as watched
        </Button>
      </Stack>
    </Stack>
  );
}
