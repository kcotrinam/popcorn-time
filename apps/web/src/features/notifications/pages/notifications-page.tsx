import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import {
  Alert,
  Avatar,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  IconButton,
  Pagination,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NotificationItem } from '@popcorn-time/shared';
import {
  clearReadNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../notifications.api';
const message = (item: NotificationItem) => {
  const actor = item.actor?.displayName ?? 'Someone';
  const title = item.contentTitle;
  switch (item.type) {
    case 'RECOMMENDATION_RECEIVED':
      return `${actor} recommended ${title} to you.`;
    case 'RECOMMENDATION_ACCEPTED':
      return `${actor} added your recommendation to their library.`;
    case 'SHARED_PLAN_INVITATION_RECEIVED':
      return `${actor} invited you to watch ${title} together.`;
    case 'SHARED_PLAN_INVITATION_ACCEPTED':
      return `${actor} accepted your shared plan invitation.`;
    case 'SHARED_PLAN_MEMBER_LEFT':
      return `${actor} left the shared plan for ${title}.`;
    case 'SHARED_PLAN_MEMBER_REMOVED':
      return `You were removed from the shared plan for ${title}.`;
    case 'SHARED_PLAN_PARTICIPANT_COMPLETED':
      return `${actor} completed ${title}.`;
    case 'SHARED_PLAN_COMPLETED':
      return `The shared plan for ${title} was completed.`;
    case 'SHARED_PLAN_CANCELLED':
      return `${actor} cancelled the shared plan for ${title}.`;
  }
};
const relative = (date: string) => {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  return minutes < 1
    ? 'Just now'
    : minutes < 60
      ? `${minutes}m ago`
      : minutes < 1440
        ? `${Math.floor(minutes / 60)}h ago`
        : `${Math.floor(minutes / 1440)}d ago`;
};
export function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['notifications', filter, page],
    queryFn: ({ signal }) => getNotifications(filter, page, signal),
    refetchOnWindowFocus: false,
  });
  const invalidate = () => void client.invalidateQueries({ queryKey: ['notifications'] });
  const markOne = useMutation({ mutationFn: markNotificationRead, onSuccess: invalidate });
  const markAll = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: invalidate });
  const remove = useMutation({ mutationFn: deleteNotification, onSuccess: invalidate });
  const clear = useMutation({
    mutationFn: clearReadNotifications,
    onSuccess: () => {
      setPage(1);
      invalidate();
    },
  });
  const open = (item: NotificationItem) => {
    if (!item.readAt) markOne.mutate(item.id);
    if (item.resource.kind === 'recommendation')
      void navigate(
        `/recommendations?view=${item.type === 'RECOMMENDATION_RECEIVED' ? 'received' : 'sent'}`,
      );
    else
      void navigate(
        item.resource.accessible && item.resource.sharedPlanId
          ? `/shared/${item.resource.sharedPlanId}`
          : '/shared',
      );
  };
  return (
    <Box sx={{ maxWidth: 920, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Notifications
            </Typography>
            <Typography color="text.secondary">
              Important activity from recommendations and shared plans.
            </Typography>
          </Box>
          <Stack direction="row" gap={1} flexWrap="wrap">
            <Button onClick={() => void query.refetch()}>Refresh</Button>
            <Button
              onClick={() => markAll.mutate()}
              disabled={!query.data?.unreadCount || markAll.isPending}
            >
              Mark all as read
            </Button>
            <Button color="inherit" onClick={() => clear.mutate()} disabled={clear.isPending}>
              Clear read
            </Button>
          </Stack>
        </Stack>
        <ButtonGroup size="small">
          <Button
            variant={filter === 'all' ? 'contained' : 'outlined'}
            onClick={() => {
              setFilter('all');
              setPage(1);
            }}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'contained' : 'outlined'}
            onClick={() => {
              setFilter('unread');
              setPage(1);
            }}
          >
            Unread
          </Button>
        </ButtonGroup>
        {query.isLoading ? (
          <Box textAlign="center" py={6}>
            <CircularProgress />
          </Box>
        ) : null}
        {query.isError ? (
          <Alert
            severity="error"
            action={<Button onClick={() => void query.refetch()}>Retry</Button>}
          >
            We could not load notifications.
          </Alert>
        ) : null}
        {!query.isLoading && !query.isError && !query.data?.results.length ? (
          <Paper sx={{ p: 5, textAlign: 'center' }}>
            <NotificationsRoundedIcon color="action" fontSize="large" />
            <Typography mt={1}>
              No {filter === 'unread' ? 'unread ' : ''}notifications yet.
            </Typography>
          </Paper>
        ) : null}
        <Stack spacing={1}>
          {query.data?.results.map((item) => (
            <Paper
              key={item.id}
              variant="outlined"
              sx={{
                borderLeft: item.readAt ? 1 : 4,
                borderLeftColor: item.readAt ? 'divider' : 'primary.main',
              }}
            >
              <Stack direction="row" alignItems="center" gap={1.5} sx={{ p: 1.5 }}>
                <Avatar src={item.actor?.avatarUrl ?? undefined}>
                  {item.actor?.displayName?.[0] ?? <NotificationsRoundedIcon />}
                </Avatar>
                <Box
                  role="button"
                  tabIndex={0}
                  onClick={() => open(item)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') open(item);
                  }}
                  sx={{ flex: 1, cursor: 'pointer' }}
                >
                  <Typography fontWeight={item.readAt ? 400 : 700}>{message(item)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {relative(item.createdAt)}
                  </Typography>
                </Box>
                <IconButton aria-label="Delete notification" onClick={() => remove.mutate(item.id)}>
                  <DeleteOutlineRoundedIcon />
                </IconButton>
              </Stack>
            </Paper>
          ))}
        </Stack>
        {query.data && query.data.totalPages > 1 ? (
          <Pagination
            page={page}
            count={query.data.totalPages}
            onChange={(_, value) => setPage(value)}
          />
        ) : null}
      </Stack>
    </Box>
  );
}
