import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ListRoundedIcon from '@mui/icons-material/ListRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Slider,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { LibraryItem, LibraryStatus, ManualCategory } from '@popcorn-time/shared';
import { getGenres } from '@/features/catalog/catalog.api';
import { useDebouncedValue } from '@/features/catalog/hooks/use-debounced-value';
import {
  getLibrary,
  removeLibraryItem,
  updateLibraryStatus,
  type LibraryFilters,
} from '../library.api';

type View = 'grid' | 'list';
const pageSize = 24;
const minimumReleaseYear = 1888;
const maximumReleaseYear = new Date().getFullYear() + 1;
const defaultDraft = {
  genreId: undefined as number | undefined,
  year: undefined as number | undefined,
  categories: [] as ManualCategory[],
};
const manualCategories: ManualCategory[] = [
  'Anime',
  'Documentary',
  'Experimental',
  'Indie',
  'Family',
];
const sorts = [
  ['addedAt.desc', 'Recently added'],
  ['addedAt.asc', 'Oldest added'],
  ['title.asc', 'Title'],
  ['releaseYear.desc', 'Release year'],
] as const;

function LibraryCard({
  item,
  view,
  onStatus,
  onRemove,
}: {
  item: LibraryItem;
  view: View;
  onStatus: (item: LibraryItem) => void;
  onRemove: (item: LibraryItem) => void;
}) {
  const next = item.status === 'WATCHLIST' ? 'WATCHED' : 'WATCHLIST';
  const [posterFailed, setPosterFailed] = useState(false);
  return (
    <Box
      component="article"
      sx={{
        display: 'flex',
        flexDirection: view === 'grid' ? 'column' : 'row',
        gap: view === 'grid' ? 0 : 2,
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          width: view === 'grid' ? '100%' : 112,
          flexShrink: 0,
          aspectRatio: '2 / 3',
          bgcolor: 'background.default',
        }}
      >
        {item.posterUrl && !posterFailed ? (
          <Box
            component="img"
            src={item.posterUrl}
            alt={`Poster for ${item.title}`}
            loading="lazy"
            onError={() => setPosterFailed(true)}
            sx={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
          />
        ) : (
          <Stack height="100%" alignItems="center" justifyContent="center" p={1} textAlign="center">
            <Typography variant="caption">Poster unavailable</Typography>
          </Stack>
        )}
      </Box>
      <Stack spacing={1} sx={{ p: 1.5, minWidth: 0, flexGrow: 1 }}>
        <Box>
          <Typography component="h2" fontWeight={700} noWrap title={item.title}>
            {item.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {[item.releaseYear, item.mediaType === 'movie' ? 'Movie' : 'Series']
              .filter(Boolean)
              .join(' · ')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
          <Chip
            label={item.status === 'WATCHLIST' ? 'Pending' : 'Watched'}
            size="small"
            color={item.status === 'WATCHLIST' ? 'primary' : 'default'}
          />
          <Chip label="Shared" size="small" variant="outlined" />
          <Chip label="Recommended" size="small" variant="outlined" />
          {item.manualCategories.map((category) => (
            <Chip key={category} label={category} size="small" variant="outlined" />
          ))}
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
          <Button size="small" onClick={() => onStatus(item)}>
            Mark as {next === 'WATCHED' ? 'watched' : 'pending'}
          </Button>
          <IconButton
            aria-label={`Remove ${item.title}`}
            onClick={() => onRemove(item)}
            size="small"
          >
            <DeleteOutlineRoundedIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}

export function LibraryPage() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('query')?.trim() ?? '';
  const urlStatus = searchParams.get('status');
  const [status, setStatus] = useState<LibraryStatus | 'ALL'>(() =>
    urlQuery ? 'ALL' : urlStatus === 'WATCHED' ? 'WATCHED' : 'WATCHLIST',
  );
  const [search, setSearch] = useState(urlQuery);
  const deferredSearch = useDebouncedValue(search.trim());
  const [sort, setSort] = useState<LibraryFilters['sort']>('addedAt.desc');
  const [filters, setFilters] = useState(defaultDraft);
  const [draft, setDraft] = useState(defaultDraft);
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<LibraryItem>();
  const [view, setView] = useState<View>(() =>
    localStorage.getItem('popcorn-time-library-view') === 'list' ? 'list' : 'grid',
  );
  const request = useMemo(
    () => ({
      status: status === 'ALL' ? undefined : status,
      query: deferredSearch || undefined,
      sort,
      page,
      pageSize,
      ...filters,
    }),
    [deferredSearch, filters, page, sort, status],
  );
  const library = useQuery({
    queryKey: ['library', request],
    queryFn: ({ signal }) => getLibrary(request, signal),
    placeholderData: keepPreviousData,
  });
  const movieGenres = useQuery({
    queryKey: ['catalog-genres', 'movie'],
    queryFn: ({ signal }) => getGenres('movie', signal),
    staleTime: 1_800_000,
  });
  const tvGenres = useQuery({
    queryKey: ['catalog-genres', 'tv'],
    queryFn: ({ signal }) => getGenres('tv', signal),
    staleTime: 1_800_000,
  });
  const genres = useMemo(
    () => [
      ...new Map(
        [...(movieGenres.data ?? []), ...(tvGenres.data ?? [])].map((genre) => [genre.id, genre]),
      ).values(),
    ],
    [movieGenres.data, tvGenres.data],
  );
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ['library'] });
  const statusChange = useMutation({
    mutationFn: ({ id, next }: { id: string; next: LibraryStatus }) =>
      updateLibraryStatus(id, next),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: removeLibraryItem,
    onSuccess: () => {
      setRemoveTarget(undefined);
      refresh();
    },
  });
  useEffect(() => setPage(1), [status, deferredSearch, sort, filters]);
  useEffect(() => {
    if (urlQuery && urlQuery !== search) {
      setSearch(urlQuery);
      setStatus('ALL');
    }
  }, [search, urlQuery]);
  const setPreferredView = (_event: React.MouseEvent<HTMLElement>, next: View | null) => {
    if (!next) return;
    setView(next);
    localStorage.setItem('popcorn-time-library-view', next);
  };
  const apply = () => {
    setFilters(draft);
    setDrawer(false);
  };
  const filterPanel = (
    <Stack spacing={3} sx={{ width: { xs: 'auto', sm: 340 }, p: 3, height: '100%' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">Filters</Typography>
        <IconButton aria-label="Close filters" onClick={() => setDrawer(false)} edge="end">
          <CloseRoundedIcon />
        </IconButton>
      </Stack>
      <FormControl fullWidth>
        <InputLabel id="library-genre-label">Genre</InputLabel>
        <Select
          labelId="library-genre-label"
          label="Genre"
          value={draft.genreId?.toString() ?? ''}
          onChange={(event) =>
            setDraft((value) => ({
              ...value,
              genreId: event.target.value ? Number(event.target.value) : undefined,
            }))
          }
        >
          <MenuItem value="">All genres</MenuItem>
          {genres.map((genre) => (
            <MenuItem key={genre.id} value={genre.id}>
              {genre.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Manual categories
        </Typography>
        <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1}>
          {manualCategories.map((category) => (
            <Chip
              key={category}
              label={category}
              clickable
              color={draft.categories.includes(category) ? 'primary' : 'default'}
              variant={draft.categories.includes(category) ? 'filled' : 'outlined'}
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  categories: current.categories.includes(category)
                    ? current.categories.filter((value) => value !== category)
                    : [...current.categories, category],
                }))
              }
            />
          ))}
        </Stack>
      </Box>
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" mb={1}>
          <Typography id="library-release-year-label" variant="subtitle2">
            Release year
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {draft.year ?? 'Any year'}
          </Typography>
        </Stack>
        <Slider
          aria-labelledby="library-release-year-label"
          value={draft.year ?? maximumReleaseYear}
          min={minimumReleaseYear}
          max={maximumReleaseYear}
          step={1}
          valueLabelDisplay={draft.year === undefined ? 'off' : 'auto'}
          onChange={(_event, value) =>
            setDraft((current) => ({ ...current, year: value as number }))
          }
        />
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">
            {minimumReleaseYear}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {maximumReleaseYear}
          </Typography>
        </Stack>
      </Box>
      <Box flexGrow={1} />
      <Button variant="contained" onClick={apply}>
        Apply filters
      </Button>
      <Button
        onClick={() => {
          setDraft(defaultDraft);
          setFilters(defaultDraft);
        }}
      >
        Clear all
      </Button>
    </Stack>
  );
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography component="h1" variant="h4">
            My Library
          </Typography>
          <Typography color="text.secondary">
            {library.data?.totalResults ?? 0} titles in total
          </Typography>
        </Box>
        <Tabs
          value={status}
          onChange={(_event, value: LibraryStatus | 'ALL') => setStatus(value)}
          aria-label="Library status"
        >
          {deferredSearch ? <Tab value="ALL" label="All results" /> : null}
          <Tab value="WATCHLIST" label="Pending" />
          <Tab value="WATCHED" label="Watched" />
        </Tabs>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
          <TextField
            fullWidth
            label="Search your library…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            slotProps={{
              input: { startAdornment: <SearchRoundedIcon color="action" sx={{ mr: 1 }} /> },
            }}
          />
          <Button
            aria-label="Filters"
            startIcon={<FilterListRoundedIcon />}
            variant="outlined"
            sx={{
              '@media (max-width: 1100px)': {
                minWidth: 40,
                px: 1.25,
                '& .MuiButton-startIcon': { mr: 0 },
                '& .library-filter-label': { display: 'none' },
              },
            }}
            onClick={() => {
              setDraft(filters);
              setDrawer(true);
            }}
          >
            <span className="library-filter-label">Filters</span>
          </Button>
          <FormControl size="small" sx={{ minWidth: 175 }}>
            <InputLabel id="library-sort-label">Sort by</InputLabel>
            <Select
              labelId="library-sort-label"
              label="Sort by"
              value={sort}
              onChange={(event) => setSort(event.target.value as LibraryFilters['sort'])}
            >
              {sorts.map(([value, label]) => (
                <MenuItem value={value} key={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ToggleButtonGroup
            exclusive
            value={view}
            onChange={setPreferredView}
            aria-label="Library view"
          >
            <ToggleButton value="grid" aria-label="Grid view">
              <GridViewRoundedIcon />
            </ToggleButton>
            <ToggleButton value="list" aria-label="List view">
              <ListRoundedIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        {library.isLoading ? (
          <Stack alignItems="center" py={8}>
            <CircularProgress aria-label="Loading library" />
          </Stack>
        ) : null}
        {library.isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={() => void library.refetch()}>
                Retry
              </Button>
            }
          >
            We could not load your library.
          </Alert>
        ) : null}
        {library.data?.results.length === 0 ? (
          <Stack alignItems="center" spacing={1} py={8}>
            <Typography variant="h6">
              {status === 'ALL'
                ? 'No library results found'
                : `Your ${status === 'WATCHLIST' ? 'Pending' : 'Watched'} library is empty`}
            </Typography>
            <Typography color="text.secondary">
              Add titles from Explore to build your library.
            </Typography>
          </Stack>
        ) : null}
        {library.data?.results.length ? (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns:
                  view === 'grid'
                    ? {
                        xs: 'repeat(2, minmax(0, 1fr))',
                        sm: 'repeat(3, minmax(0, 1fr))',
                        md: 'repeat(5, minmax(0, 1fr))',
                      }
                    : '1fr',
                gap: 2,
              }}
            >
              {library.data.results.map((item) => (
                <LibraryCard
                  key={item.id}
                  item={item}
                  view={view}
                  onStatus={(selected) =>
                    statusChange.mutate({
                      id: selected.id,
                      next: selected.status === 'WATCHLIST' ? 'WATCHED' : 'WATCHLIST',
                    })
                  }
                  onRemove={setRemoveTarget}
                />
              ))}
            </Box>
            <Stack alignItems="center">
              <Pagination
                page={page}
                count={library.data.totalPages}
                onChange={(_event, next) => setPage(next)}
                showFirstButton
                showLastButton
                aria-label="Library pagination"
              />
            </Stack>
          </>
        ) : null}
      </Stack>
      <Drawer anchor={mobile ? 'bottom' : 'right'} open={drawer} onClose={() => setDrawer(false)}>
        {filterPanel}
      </Drawer>
      <Dialog
        open={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(undefined)}
        aria-labelledby="remove-library-item-title"
      >
        <DialogTitle id="remove-library-item-title">Remove from library?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {removeTarget ? `Remove ${removeTarget.title} from your library?` : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveTarget(undefined)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={remove.isPending}
            onClick={() => removeTarget && remove.mutate(removeTarget.id)}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
