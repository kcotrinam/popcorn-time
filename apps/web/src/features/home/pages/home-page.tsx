import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Alert,
  Box,
  Button,
  Container,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/features/auth/auth.api';
import { getLibrary } from '@/features/library/library.api';
import {
  getRecommendations,
  acceptRecommendation,
} from '@/features/recommendations/recommendations.api';
import { DashboardLibraryCard } from '../components/dashboard-library-card';
import { DashboardSection } from '../components/dashboard-section';

const cardRowSx = {
  display: 'flex',
  gap: 2,
  overflowX: 'auto',
  pb: 1,
  '&::-webkit-scrollbar': { height: 8 },
};

function LibraryRow({
  status,
  sort,
  empty,
}: {
  status: 'WATCHLIST' | 'WATCHED';
  sort: 'addedAt.desc' | 'watchedAt.desc';
  empty: ReactNode;
}) {
  const library = useQuery({
    queryKey: ['library', 'home', status, sort],
    queryFn: ({ signal }) => getLibrary({ status, sort, page: 1, pageSize: 5 }, signal),
  });
  if (library.isLoading)
    return (
      <Stack direction="row" spacing={2}>
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} variant="rounded" width={174} height={280} />
        ))}
      </Stack>
    );
  if (library.isError)
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" onClick={() => void library.refetch()}>
            Retry
          </Button>
        }
      >
        We could not load this section.
      </Alert>
    );
  if (!library.data?.results.length) return <>{empty}</>;
  return (
    <Box sx={cardRowSx}>
      {library.data.results.map((item) => (
        <DashboardLibraryCard key={item.id} item={item} />
      ))}
    </Box>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const user = useQuery({ queryKey: ['current-user'], queryFn: getCurrentUser });
  const recommendations = useQuery({
    queryKey: ['recommendations', 'home'],
    queryFn: ({ signal }) =>
      getRecommendations(
        { direction: 'received', status: 'PENDING', page: 1, pageSize: 3 },
        signal,
      ),
  });
  const queryClient = useQueryClient();
  const accept = useMutation({
    mutationFn: acceptRecommendation,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      void queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    if (query) void navigate(`/library?query=${encodeURIComponent(query)}`);
  };
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={4}>
        <Stack component="form" onSubmit={submitSearch} direction="row" spacing={1} maxWidth={620}>
          <TextField
            fullWidth
            size="small"
            label="Search your library…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            slotProps={{
              input: { startAdornment: <SearchRoundedIcon color="action" sx={{ mr: 1 }} /> },
            }}
          />
          <Button type="submit" variant="contained" aria-label="Search library">
            Search
          </Button>
        </Stack>
        <Box>
          <Typography component="h1" variant="h4">
            Welcome back, {user.data?.displayName ?? 'there'}.
          </Typography>
          <Typography color="text.secondary">Here is what is happening in your library.</Typography>
        </Box>
        <DashboardSection title="Recent pending" action={{ label: 'View all', to: '/library' }}>
          <LibraryRow
            status="WATCHLIST"
            sort="addedAt.desc"
            empty={
              <Typography color="text.secondary">
                Your pending list is empty.{' '}
                <Button href="/explore" size="small">
                  Explore something to add.
                </Button>
              </Typography>
            }
          />
        </DashboardSection>
        <DashboardSection
          title={
            recommendations.data?.totalResults
              ? `${recommendations.data.totalResults} new recommendation${recommendations.data.totalResults === 1 ? '' : 's'}`
              : 'Recommendations'
          }
          action={{ label: 'View all', to: '/recommendations' }}
        >
          {recommendations.isLoading ? (
            <Skeleton variant="rounded" width={300} height={160} />
          ) : null}
          {recommendations.isError ? (
            <Alert
              severity="error"
              action={<Button onClick={() => void recommendations.refetch()}>Retry</Button>}
            >
              We could not load recommendations.
            </Alert>
          ) : null}
          {recommendations.isError ? (
            <Typography color="text.secondary">No recommendations for you yet.</Typography>
          ) : null}
          {!recommendations.isLoading &&
          !recommendations.isError &&
          !recommendations.data?.results.length ? (
            <Typography color="text.secondary">No recommendations for you yet.</Typography>
          ) : null}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            {recommendations.data?.results.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', gap: 1.5, maxWidth: 360 }}>
                <Box
                  component="img"
                  src={item.posterUrl ?? undefined}
                  alt=""
                  sx={{
                    width: 64,
                    height: 96,
                    objectFit: 'cover',
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                  }}
                />
                <Box>
                  <Typography fontWeight={700}>{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    From {item.sender?.displayName} (@{item.sender?.username})
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button size="small" variant="contained" onClick={() => accept.mutate(item.id)}>
                      Add
                    </Button>
                    <Button
                      size="small"
                      component={RouterLink}
                      to={`/explore/${item.mediaType}/${item.externalId}`}
                    >
                      Details
                    </Button>
                  </Stack>
                </Box>
              </Box>
            ))}
          </Stack>
        </DashboardSection>
        <DashboardSection title="Shared plans">
          <Typography color="text.secondary">No shared plans with you.</Typography>
        </DashboardSection>
        <DashboardSection
          title="Recently watched"
          action={{ label: 'View history', to: '/library?status=WATCHED' }}
        >
          <LibraryRow
            status="WATCHED"
            sort="watchedAt.desc"
            empty={
              <Typography color="text.secondary">You have not watched anything yet.</Typography>
            }
          />
        </DashboardSection>
      </Stack>
      <Tooltip title="Register content not found in the catalog">
        <Button
          component={RouterLink}
          to="/library/manual"
          variant="contained"
          startIcon={<AddRoundedIcon />}
          sx={{ position: 'fixed', right: { xs: 16, md: 32 }, bottom: { xs: 88, md: 32 } }}
        >
          Register manually
        </Button>
      </Tooltip>
    </Container>
  );
}
