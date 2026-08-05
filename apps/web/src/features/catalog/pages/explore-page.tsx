import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
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
import { CatalogGrid } from '../components/catalog-grid';
import { getCatalog, getGenres, type CatalogFilters } from '../catalog.api';
import { getLibraryMemberships } from '../../library/library.api';
import { exploreTabs, ratingOptions, sortOptions, type ExploreTab } from '../catalog.constants';
import { useDebouncedValue } from '../hooks/use-debounced-value';

const initialFilters: CatalogFilters = { sort: 'popularity.desc' };
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
          <FormControl size="small" sx={{ minWidth: 160 }} disabled={!genreType || isSearching}>
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
            size="small"
            label="Year"
            type="text"
            disabled={isSearching}
            value={filters.year ?? ''}
            onChange={(event) =>
              updateFilter('year', event.target.value ? Number(event.target.value) : undefined)
            }
            slotProps={{
              htmlInput: {
                inputMode: 'numeric',
                pattern: '[0-9]*',
                min: 1888,
                max: new Date().getFullYear() + 1,
              },
            }}
            sx={{ minWidth: 120 }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }} disabled={isSearching}>
            <InputLabel id="rating-label">Minimum rating</InputLabel>
            <Select
              labelId="rating-label"
              label="Minimum rating"
              value={filters.minRating?.toString() ?? ''}
              onChange={(event) =>
                updateFilter(
                  'minRating',
                  event.target.value ? Number(event.target.value) : undefined,
                )
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
          <Typography variant="body2" color="text.secondary">
            Results for “{effectiveQuery}”
          </Typography>
        ) : null}
        {catalog.isLoading ? (
          <Stack alignItems="center" py={8} role="status">
            <CircularProgress aria-label="Loading catalog" />
          </Stack>
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
            We could not load the catalog. Please try again.
          </Alert>
        ) : null}
        {catalog.data && catalog.data.results.length === 0 ? (
          <Stack alignItems="center" spacing={1} py={8}>
            <Typography variant="h6">No results found</Typography>
            <Typography color="text.secondary">
              Try another search or adjust the filters.
            </Typography>
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
    </Container>
  );
}
