import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HttpError } from '@/services/http-client';
import { CatalogGrid } from '../components/catalog-grid';
import { getCatalog, getGenres, type CatalogFilters } from '../catalog.api';
import { getLibraryMemberships } from '../../library/library.api';
import { exploreTabs, ratingOptions, sortOptions, type ExploreTab } from '../catalog.constants';
import { useDebouncedValue } from '../hooks/use-debounced-value';

const initialFilters: CatalogFilters = { sort: 'popularity.desc' };
const earliestReleaseYear = 1888;
const latestReleaseYear = new Date().getFullYear() + 1;

function catalogErrorMessage(error: unknown) {
  if (!(error instanceof HttpError)) return 'Check your connection, then try again.';
  if (error.status === 429) return 'Too many requests. Please wait a moment before trying again.';
  if (error.status === 401 || error.status === 403)
    return 'Your session no longer has access. Sign in again and retry.';
  return 'Please try again. Your filters and search are still here.';
}

export function ExplorePage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('query')?.trim() ?? '';
  const initialType = searchParams.get('type');
  const initialTab: ExploreTab =
    initialType === 'movie' || initialType === 'tv' ? initialType : 'all';
  const [search, setSearch] = useState(initialQuery);
  const deferredSearch = useDebouncedValue(search.trim());
  const [tab, setTab] = useState<ExploreTab>(initialTab);
  const [filters, setFilters] = useState<CatalogFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [yearInput, setYearInput] = useState('');
  const [yearError, setYearError] = useState('');
  const genreType = tab === 'movie' || tab === 'tv' ? tab : undefined;
  const effectiveQuery = search.trim().length < 2 ? '' : deferredSearch;
  useEffect(() => {
    setPage(1);
  }, [search, tab, filters]);
  useEffect(() => {
    if (!genreType && filters.genreId)
      setFilters((current) => ({ ...current, genreId: undefined }));
  }, [filters.genreId, genreType]);
  const request = useMemo(
    () => ({ ...filters, tab, page, query: effectiveQuery }),
    [effectiveQuery, filters, page, tab],
  );
  const catalog = useQuery({
    queryKey: ['catalog', request],
    queryFn: ({ signal }) => getCatalog(request, signal),
    placeholderData: keepPreviousData,
  });
  const genres = useQuery({
    queryKey: ['catalog-genres', genreType],
    queryFn: ({ signal }) => getGenres(genreType!, signal),
    enabled: Boolean(genreType),
    staleTime: 1000 * 60 * 30,
  });
  const membershipReferences = useMemo(
    () =>
      (catalog.data?.results ?? []).slice(0, 30).map((item) => ({
        mediaType: item.mediaType,
        externalId: item.externalId,
      })),
    [catalog.data?.results],
  );
  const membershipKey = membershipReferences
    .map((item) => `${item.mediaType}:${item.externalId}`)
    .join(',');
  const memberships = useQuery({
    queryKey: ['library-membership', membershipKey],
    queryFn: ({ signal }) => getLibraryMemberships(membershipReferences, signal),
    enabled: membershipReferences.length > 0,
    staleTime: 30_000,
  });
  const membershipByReference = useMemo(
    () =>
      new Map(
        (memberships.data?.results ?? []).map((item) => [
          `${item.mediaType}:${item.externalId}`,
          item,
        ]),
      ),
    [memberships.data],
  );
  const updateFilter = <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) =>
    setFilters((current) => ({ ...current, [key]: value }));
  const isSearching = effectiveQuery.length >= 2;
  const activeFilterCount = [filters.genreId, filters.year, filters.minRating].filter(
    (value) => value !== undefined,
  ).length;
  const clearAdvancedFilters = () =>
    setFilters((current) => ({
      ...current,
      genreId: undefined,
      year: undefined,
      minRating: undefined,
    }));
  const updateYear = (value: string) => {
    if (!/^\d{0,4}$/.test(value)) return;
    setYearInput(value);
    if (!value) {
      setYearError('');
      updateFilter('year', undefined);
      return;
    }
    if (value.length !== 4) {
      setYearError('Enter a four-digit year.');
      return;
    }
    const year = Number(value);
    if (year < earliestReleaseYear || year > latestReleaseYear) {
      setYearError(`Enter a year from ${earliestReleaseYear} to ${latestReleaseYear}.`);
      return;
    }
    setYearError('');
    updateFilter('year', year);
  };
  useEffect(() => {
    setYearInput(filters.year?.toString() ?? '');
  }, [filters.year]);
  const filterPanel = (
    <Stack spacing={3} sx={{ width: { xs: 'auto', sm: 340 }, minHeight: '100%', p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h6">Filters</Typography>
          <Typography variant="body2" color="text.secondary">
            Refine what you want to watch.
          </Typography>
        </Box>
        <IconButton aria-label="Close filters" onClick={() => setFiltersOpen(false)} edge="end">
          <CloseRoundedIcon />
        </IconButton>
      </Stack>
      {isSearching ? (
        <Alert severity="info">
          Filters apply when you return to browsing. Search results use your search term only.
        </Alert>
      ) : null}
      <FormControl fullWidth disabled={!genreType || isSearching}>
        <InputLabel id="genre-label">Genre</InputLabel>
        <Select
          labelId="genre-label"
          label="Genre"
          value={filters.genreId?.toString() ?? ''}
          onChange={(event) =>
            updateFilter('genreId', event.target.value ? Number(event.target.value) : undefined)
          }
        >
          <MenuItem value="">All genres</MenuItem>
          {genres.data?.map((genre) => (
            <MenuItem value={genre.id} key={genre.id}>
              {genre.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Year"
        type="text"
        disabled={isSearching}
        value={yearInput}
        onChange={(event) => updateYear(event.target.value)}
        error={Boolean(yearError)}
        helperText={yearError || `From ${earliestReleaseYear} to ${latestReleaseYear}`}
        slotProps={{
          htmlInput: {
            inputMode: 'numeric',
            pattern: '[0-9]*',
            min: 1888,
            max: new Date().getFullYear() + 1,
          },
        }}
      />
      <FormControl fullWidth disabled={isSearching}>
        <InputLabel id="rating-label">Minimum rating</InputLabel>
        <Select
          labelId="rating-label"
          label="Minimum rating"
          value={filters.minRating?.toString() ?? ''}
          onChange={(event) =>
            updateFilter('minRating', event.target.value ? Number(event.target.value) : undefined)
          }
        >
          <MenuItem value="">Any rating</MenuItem>
          {ratingOptions.map((rating) => (
            <MenuItem value={rating} key={rating}>
              {rating === 0 ? 'No minimum' : `${rating}+`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box flexGrow={1} />
      <Button onClick={clearAdvancedFilters} disabled={!activeFilterCount}>
        Clear filters
      </Button>
    </Stack>
  );
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3.5}>
        <Box>
          <Typography component="h1" variant="h4">
            Explore
          </Typography>
          <Typography color="text.secondary">Find your next story.</Typography>
        </Box>
        <TextField
          fullWidth
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          label="Search movies, series, or anime…"
          placeholder="Search movies, series, or anime…"
          slotProps={{
            input: { startAdornment: <SearchRoundedIcon color="action" sx={{ mr: 1 }} /> },
          }}
        />
        <Tabs
          value={tab}
          onChange={(_event, value: ExploreTab) => setTab(value)}
          variant="scrollable"
          allowScrollButtonsMobile
          aria-label="Catalog categories"
        >
          {exploreTabs.map((item) => (
            <Tab key={item.value} value={item.value} label={item.label} />
          ))}
        </Tabs>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            variant={activeFilterCount ? 'contained' : 'outlined'}
            startIcon={<FilterListRoundedIcon />}
            onClick={() => setFiltersOpen(true)}
          >
            {activeFilterCount ? `Filters (${activeFilterCount})` : 'Filters'}
          </Button>
          <FormControl size="small" sx={{ minWidth: 205 }} disabled={isSearching}>
            <InputLabel id="sort-label">Sort by</InputLabel>
            <Select
              labelId="sort-label"
              label="Sort by"
              value={filters.sort}
              onChange={(event) =>
                updateFilter('sort', event.target.value as CatalogFilters['sort'])
              }
            >
              {sortOptions.map((option) => (
                <MenuItem value={option.value} key={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        {isSearching ? (
          <Typography variant="body2" color="text.secondary" aria-live="polite">
            Results for “{effectiveQuery}”
          </Typography>
        ) : null}
        {catalog.isLoading ? (
          <Stack alignItems="center" spacing={1} py={8} role="status" aria-live="polite">
            <CircularProgress aria-label="Loading catalog" />
            <Typography color="text.secondary">Loading titles…</Typography>
          </Stack>
        ) : null}
        {catalog.isFetching && !catalog.isLoading ? (
          <Typography variant="body2" color="text.secondary" role="status" aria-live="polite">
            Updating results…
          </Typography>
        ) : null}
        {catalog.isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => void catalog.refetch()}>
                Retry
              </Button>
            }
          >
            We could not load the catalog. {catalogErrorMessage(catalog.error)}
          </Alert>
        ) : null}
        {catalog.data && catalog.data.results.length === 0 ? (
          <Stack alignItems="center" spacing={1} py={8}>
            <Typography variant="h6">No results found</Typography>
            <Typography color="text.secondary">
              {isSearching
                ? 'Try another search term.'
                : activeFilterCount
                  ? 'Clear your filters to see more titles.'
                  : 'Try another search term.'}
            </Typography>
            {!isSearching && activeFilterCount ? (
              <Button onClick={clearAdvancedFilters}>Clear filters</Button>
            ) : null}
          </Stack>
        ) : null}
        {catalog.data?.results.length ? (
          <>
            <CatalogGrid items={catalog.data.results} memberships={membershipByReference} />
            <Stack alignItems="center" spacing={1}>
              <Pagination
                page={page}
                count={catalog.data.totalPages}
                onChange={(_event, value) => setPage(value)}
                color="primary"
                disabled={catalog.isFetching}
                showFirstButton
                showLastButton
                aria-label="Catalog pagination"
              />
              <Typography variant="caption" color="text.secondary">
                {catalog.data.totalResults} results
              </Typography>
            </Stack>
          </>
        ) : null}
      </Stack>
      <Drawer anchor="right" open={filtersOpen} onClose={() => setFiltersOpen(false)}>
        {filterPanel}
      </Drawer>
    </Container>
  );
}
