import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { Alert, Box, Button, Container, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { acceptSharedPlan, declineOrLeaveSharedPlan, getSharedPlans } from '../shared-plans.api';
export function SharedPage() {
  const [view, setView] = useState<'invitations' | 'active' | 'history'>('active');
  const queryClient = useQueryClient();
  const plans = useQuery({
    queryKey: ['shared-plans', view],
    queryFn: ({ signal }) => getSharedPlans(view, signal),
  });
  const invitationAction = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'accept' | 'decline' }) => {
      if (action === 'accept') await acceptSharedPlan(id);
      else await declineOrLeaveSharedPlan(id);
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['shared-plans'] }),
  });
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4">Shared plans</Typography>
            <Typography color="text.secondary">
              Watch together while keeping your experience private.
            </Typography>
          </Box>
          <Button startIcon={<RefreshRoundedIcon />} onClick={() => void plans.refetch()}>
            Refresh
          </Button>
        </Stack>
        <Tabs value={view} onChange={(_, value) => setView(value)}>
          <Tab value="invitations" label="Invitations" />
          <Tab value="active" label="Active" />
          <Tab value="history" label="History" />
        </Tabs>
        {plans.isLoading ? <Typography role="status">Loading shared plans…</Typography> : null}
        {plans.isError ? (
          <Alert
            severity="error"
            action={<Button onClick={() => void plans.refetch()}>Retry</Button>}
          >
            We could not load shared plans.
          </Alert>
        ) : null}
        {!plans.isLoading && !plans.isError && !plans.data?.results.length ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography>No {view} shared plans yet.</Typography>
            <Typography variant="body2" color="text.secondary">
              Start from a movie or series details page.
            </Typography>
          </Paper>
        ) : null}
        {plans.data?.results.map((plan) => (
          <Paper key={plan.id} sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box
              component="img"
              src={plan.posterUrl ?? undefined}
              alt=""
              sx={{
                width: 58,
                height: 86,
                objectFit: 'cover',
                borderRadius: 1,
                bgcolor: 'background.default',
              }}
            />
            <Box
              component={RouterLink}
              to={`/shared/${plan.id}`}
              sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}
            >
              <Typography fontWeight={700}>{plan.title}</Typography>
              <Typography color="text.secondary">
                {plan.status} · Created by {plan.creator.displayName}
              </Typography>
            </Box>
            {view === 'invitations' ? (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  variant="contained"
                  onClick={() => invitationAction.mutate({ id: plan.id, action: 'accept' })}
                  disabled={invitationAction.isPending}
                >
                  Accept
                </Button>
                <Button
                  color="error"
                  onClick={() => invitationAction.mutate({ id: plan.id, action: 'decline' })}
                  disabled={invitationAction.isPending}
                >
                  Decline
                </Button>
              </Stack>
            ) : null}
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}
