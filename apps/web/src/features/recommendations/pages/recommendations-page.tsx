import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Pagination,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  acceptRecommendation,
  getRecommendations,
  rejectRecommendation,
} from '../recommendations.api';

export function RecommendationsPage() {
  const [searchParams] = useSearchParams();
  const [direction, setDirection] = useState<'received' | 'sent'>(
    searchParams.get('view') === 'sent' ? 'sent' : 'received',
  );
  const [status, setStatus] = useState<'PENDING' | 'ACCEPTED'>();
  const [page, setPage] = useState(1);
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['recommendations', direction, status, page],
    queryFn: ({ signal }) => getRecommendations({ direction, status, page, pageSize: 12 }, signal),
  });
  const refresh = () => {
    void client.invalidateQueries({ queryKey: ['recommendations'] });
    void client.invalidateQueries({ queryKey: ['library'] });
    void client.invalidateQueries({ queryKey: ['home'] });
    void client.invalidateQueries({ queryKey: ['notifications'] });
  };
  const accept = useMutation({ mutationFn: acceptRecommendation, onSuccess: refresh });
  const reject = useMutation({ mutationFn: rejectRecommendation, onSuccess: refresh });
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4">Recommendations</Typography>
          <Typography color="text.secondary">
            Private titles shared between Popcorn Time users.
          </Typography>
        </Box>
        <Tabs
          value={direction}
          onChange={(_, value: 'received' | 'sent') => {
            setDirection(value);
            setPage(1);
          }}
        >
          <Tab value="received" label="Received" />
          <Tab value="sent" label="Sent" />
        </Tabs>
        <Stack direction="row" spacing={1}>
          {([undefined, 'PENDING', 'ACCEPTED'] as const).map((value) => (
            <Button
              key={value ?? 'all'}
              variant={status === value ? 'contained' : 'outlined'}
              onClick={() => {
                setStatus(value);
                setPage(1);
              }}
            >
              {value ? `${value[0]}${value.slice(1).toLowerCase()}` : 'All'}
            </Button>
          ))}
        </Stack>
        {query.isLoading ? <Typography role="status">Loading recommendations…</Typography> : null}
        {query.isError ? (
          <Alert
            severity="error"
            action={<Button onClick={() => void query.refetch()}>Retry</Button>}
          >
            We could not load recommendations.
          </Alert>
        ) : null}
        {!query.isLoading && !query.isError && !query.data?.results.length ? (
          <Typography color="text.secondary">
            No recommendations {direction === 'received' ? 'for you' : 'sent yet'}.
          </Typography>
        ) : null}
        {query.data?.results.map((item) => {
          const person = direction === 'received' ? item.sender : item.recipient;
          return (
            <Paper key={item.id} sx={{ p: 2 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ sm: 'center' }}
              >
                <Avatar
                  variant="rounded"
                  src={item.posterUrl ?? undefined}
                  sx={{ width: 58, height: 82 }}
                >
                  {item.title[0]}
                </Avatar>
                <Box flexGrow={1}>
                  <Typography fontWeight={700}>{item.title}</Typography>
                  <Typography color="text.secondary">
                    {person?.displayName} (@{person?.username}) ·{' '}
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Typography>
                  <Chip
                    size="small"
                    label={item.status === 'PENDING' ? 'Pending' : 'Accepted'}
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button
                    component={RouterLink}
                    to={`/explore/${item.mediaType}/${item.externalId}`}
                  >
                    Details
                  </Button>
                  {direction === 'received' && item.status === 'PENDING' ? (
                    <>
                      <Button
                        variant="contained"
                        onClick={() => accept.mutate(item.id)}
                        disabled={accept.isPending}
                      >
                        Add to pending
                      </Button>
                      <Button
                        color="error"
                        onClick={() => reject.mutate(item.id)}
                        disabled={reject.isPending}
                      >
                        Decline
                      </Button>
                    </>
                  ) : null}
                  {direction === 'received' && item.status === 'ACCEPTED' ? (
                    <Typography color="success.main">In your library</Typography>
                  ) : null}
                </Stack>
              </Stack>
            </Paper>
          );
        })}
        {query.data && query.data.totalPages > 1 ? (
          <Pagination
            count={query.data.totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
          />
        ) : null}
      </Stack>
    </Container>
  );
}
