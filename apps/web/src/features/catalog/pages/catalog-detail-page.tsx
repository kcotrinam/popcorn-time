import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LocalMoviesRoundedIcon from '@mui/icons-material/LocalMoviesRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  LinearProgress,
  Paper,
  Slider,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import type { CatalogCard, CatalogMediaType } from '@popcorn-time/shared';
import { getCatalog, getCatalogDetail } from '../catalog.api';
import {
  addToLibrary,
  getLibraryMemberships,
  saveLibraryExperience,
  updateLibraryStatus,
} from '@/features/library/library.api';

const mediaLabels = { movie: 'Movie', tv: 'Series' } as const;
const localDate = (value = new Date()) => {
  const offset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 10);
};

function Poster({ item }: { item: Pick<CatalogCard, 'posterUrl' | 'title'> }) {
  const [failed, setFailed] = useState(false);
  if (!item.posterUrl || failed) {
    return (
      <Stack
        role="img"
        aria-label={`Poster unavailable for ${item.title}`}
        alignItems="center"
        justifyContent="center"
        height="100%"
        p={2}
        textAlign="center"
        sx={{ bgcolor: 'background.paper' }}
      >
        <Typography fontWeight={700}>{item.title}</Typography>
        <Typography variant="caption" color="text.secondary">
          Poster unavailable
        </Typography>
      </Stack>
    );
  }
  return (
    <Box
      component="img"
      src={item.posterUrl}
      alt={`Poster for ${item.title}`}
      onError={() => setFailed(true)}
      sx={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
    />
  );
}

function SimilarCard({ item }: { item: CatalogCard }) {
  const [failed, setFailed] = useState(false);
  return (
    <Paper
      component={RouterLink}
      to={`/explore/${item.mediaType}/${item.externalId}`}
      aria-label={`View details for ${item.title}`}
      sx={{
        display: 'block',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'transform 160ms ease, border-color 160ms ease',
        '&:hover, &:focus-visible': { transform: 'translateY(-3px)', borderColor: 'primary.main' },
      }}
    >
      <Box sx={{ aspectRatio: '2 / 3', bgcolor: 'background.default' }}>
        {item.posterUrl && !failed ? (
          <Box
            component="img"
            src={item.posterUrl}
            alt={`Poster for ${item.title}`}
            loading="lazy"
            onError={() => setFailed(true)}
            sx={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
          />
        ) : (
          <Stack
            role="img"
            aria-label={`Poster unavailable for ${item.title}`}
            height="100%"
            p={1}
            alignItems="center"
            justifyContent="center"
            textAlign="center"
          >
            <Typography variant="caption">Poster unavailable</Typography>
          </Stack>
        )}
      </Box>
      <Stack spacing={0.25} sx={{ p: 1.25 }}>
        <Typography variant="body2" fontWeight={700} noWrap title={item.title}>
          {item.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {[item.releaseYear, mediaLabels[item.mediaType]].filter(Boolean).join(' · ')}
        </Typography>
      </Stack>
    </Paper>
  );
}

export function CatalogDetailPage() {
  const { type, id } = useParams();
  const mediaType = type === 'movie' || type === 'tv' ? (type as CatalogMediaType) : undefined;
  const externalId = Number(id);
  const queryClient = useQueryClient();
  const [backdropFailed, setBackdropFailed] = useState(false);
  const [message, setMessage] = useState<string>();
  const [experienceEditing, setExperienceEditing] = useState(false);
  const [experienceRating, setExperienceRating] = useState<number | null>(null);
  const [experienceComment, setExperienceComment] = useState('');
  const [experienceDate, setExperienceDate] = useState(localDate());
  const validParams = Boolean(mediaType && Number.isInteger(externalId) && externalId > 0);
  useEffect(() => setBackdropFailed(false), [mediaType, externalId]);
  const detail = useQuery({
    queryKey: ['catalog-detail', mediaType, externalId],
    queryFn: ({ signal }) => getCatalogDetail(mediaType!, externalId, signal),
    enabled: validParams,
  });
  const membership = useQuery({
    queryKey: ['library-membership', `${mediaType}:${externalId}`],
    queryFn: ({ signal }) => getLibraryMemberships([{ mediaType: mediaType!, externalId }], signal),
    enabled: validParams,
    staleTime: 30_000,
  });
  const libraryMembership = membership.data?.results[0];
  useEffect(() => {
    if (!libraryMembership) return;
    setExperienceRating(libraryMembership.personalRating);
    setExperienceComment(libraryMembership.privateComment ?? '');
    setExperienceDate(
      libraryMembership.watchedAt ? localDate(new Date(libraryMembership.watchedAt)) : localDate(),
    );
  }, [libraryMembership]);
  const similarRequest = useMemo(
    () => ({
      tab: mediaType ?? 'movie',
      page: 1,
      sort: 'popularity.desc' as const,
      genreId: detail.data?.genres[0]?.id,
    }),
    [detail.data?.genres, mediaType],
  );
  const similar = useQuery({
    queryKey: ['catalog-similar', mediaType, externalId, similarRequest.genreId],
    queryFn: ({ signal }) => getCatalog(similarRequest, signal),
    enabled: Boolean(detail.data && mediaType),
  });
  const markWatched = useMutation({
    mutationFn: () => updateLibraryStatus(libraryMembership!.libraryItemId, 'WATCHED'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['library'] });
      void queryClient.invalidateQueries({ queryKey: ['library-membership'] });
      setExperienceEditing(true);
      setMessage(`${detail.data?.title ?? 'This item'} is marked as watched.`);
    },
    onError: () => setMessage('We could not update this item. Please try again.'),
  });
  const saveExperience = useMutation({
    mutationFn: () =>
      saveLibraryExperience(libraryMembership!.libraryItemId, {
        rating: experienceRating,
        comment: experienceComment.trim() || null,
        watchedAt: new Date(`${experienceDate}T12:00:00`).toISOString(),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['library'] });
      void queryClient.invalidateQueries({ queryKey: ['library-membership'] });
      void queryClient.invalidateQueries({ queryKey: ['catalog-detail'] });
      void queryClient.invalidateQueries({ queryKey: ['home'] });
      setExperienceEditing(false);
      setMessage('Your experience was saved.');
    },
    onError: () => setMessage('We could not save your experience. Please try again.'),
  });
  const add = useMutation({
    mutationFn: () =>
      addToLibrary({
        provider: detail.data!.provider,
        externalId: detail.data!.externalId,
        mediaType: detail.data!.mediaType,
      }),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['library'] });
      void queryClient.invalidateQueries({ queryKey: ['library-membership'] });
      setMessage(
        result.created
          ? `${detail.data!.title} was added to Pending.`
          : `${detail.data!.title} is already in your library.`,
      );
    },
    onError: () =>
      setMessage(`We could not add ${detail.data?.title ?? 'this item'}. Please try again.`),
  });

  if (!validParams)
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="error">This content is not valid.</Alert>
      </Container>
    );
  if (detail.isLoading)
    return (
      <Stack minHeight="70vh" alignItems="center" justifyContent="center" role="status">
        <CircularProgress aria-label="Loading content details" />
      </Stack>
    );
  if (detail.isError || !detail.data)
    return (
      <Container sx={{ py: 5 }}>
        <Alert
          severity="error"
          action={
            <Button component={RouterLink} to="/explore" color="inherit">
              Back to explore
            </Button>
          }
        >
          We could not load this content. Please try again.
        </Alert>
      </Container>
    );

  const item = detail.data;
  const mainCredits = item.credits.slice(0, 6);
  const creator = mainCredits.find((credit) => /director|creator/i.test(credit.role));
  const cast = mainCredits.filter((credit) => !/director|creator/i.test(credit.role));
  const similarItems = (similar.data?.results ?? [])
    .filter((candidate) => candidate.externalId !== item.externalId)
    .slice(0, 6);
  const metadata = [
    item.releaseYear?.toString(),
    item.runtimeMinutes ? `${item.runtimeMinutes} min` : null,
    mediaLabels[item.mediaType],
  ].filter((value): value is string => Boolean(value));

  return (
    <Box sx={{ minHeight: '100vh', pb: 6 }}>
      <Box
        sx={{
          height: { xs: 300, md: 430 },
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        {item.backdropUrl && !backdropFailed ? (
          <Box
            component="img"
            src={item.backdropUrl}
            alt=""
            aria-hidden
            onError={() => setBackdropFailed(true)}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : null}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: (theme) =>
              `linear-gradient(90deg, ${alpha(theme.palette.background.default, 0.94)} 0%, ${alpha(theme.palette.background.default, 0.72)} 42%, ${alpha(theme.palette.background.default, 0.32)} 100%), linear-gradient(0deg, ${theme.palette.background.default} 0%, transparent 55%)`,
          }}
        />
      </Box>
      <Container maxWidth="xl" sx={{ position: 'relative', mt: { xs: -20, md: -27 } }}>
        <Button
          component={RouterLink}
          to="/explore"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ mb: { xs: 2, md: 3 } }}
        >
          Back to explore
        </Button>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: '240px minmax(0, 1fr)' },
            gap: { xs: 3, md: 5 },
            alignItems: 'start',
          }}
        >
          <Stack
            component="aside"
            aria-label="Poster and library actions"
            spacing={1.25}
            sx={{
              width: { xs: 'min(240px, 100%)', sm: '100%' },
              justifySelf: { xs: 'center', sm: 'start' },
            }}
          >
            <Paper
              sx={{
                width: '100%',
                overflow: 'hidden',
                aspectRatio: '2 / 3',
                bgcolor: 'background.paper',
              }}
            >
              <Poster key={`${item.mediaType}:${item.externalId}`} item={item} />
            </Paper>
            {membership.isLoading ? (
              <Button fullWidth disabled startIcon={<CircularProgress size={18} />}>
                Checking library…
              </Button>
            ) : null}
            {membership.isSuccess && !libraryMembership ? (
              <Button
                fullWidth
                variant="contained"
                startIcon={
                  add.isPending ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <AddRoundedIcon />
                  )
                }
                onClick={() => add.mutate()}
                disabled={add.isPending}
                aria-busy={add.isPending}
              >
                {add.isPending ? 'Adding to library…' : 'Add to pending'}
              </Button>
            ) : null}
            {libraryMembership?.status === 'WATCHLIST' ? (
              <>
                <Chip
                  icon={<CheckCircleRoundedIcon />}
                  label="In your library"
                  color="primary"
                  sx={{ width: '100%', justifyContent: 'flex-start' }}
                />
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={
                    markWatched.isPending ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <PlayCircleOutlineRoundedIcon />
                    )
                  }
                  onClick={() => markWatched.mutate()}
                  disabled={markWatched.isPending}
                  aria-busy={markWatched.isPending}
                >
                  {markWatched.isPending ? 'Marking as watched…' : 'Mark as watched'}
                </Button>
              </>
            ) : null}
            {libraryMembership?.status === 'WATCHED' ? (
              <Chip
                icon={<CheckCircleRoundedIcon />}
                label="Watched"
                sx={{ width: '100%', justifyContent: 'flex-start' }}
              />
            ) : null}
            {membership.isError ? (
              <Alert severity="warning">We could not check your library status.</Alert>
            ) : null}
          </Stack>
          <Stack spacing={2.25} sx={{ pt: { sm: 2 } }}>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {libraryMembership ? (
                <Chip
                  icon={<CheckCircleRoundedIcon />}
                  label={libraryMembership.status === 'WATCHED' ? 'Watched' : 'In your library'}
                  color={libraryMembership.status === 'WATCHED' ? 'default' : 'primary'}
                />
              ) : null}
              {item.externalRating !== null ? (
                <Chip
                  icon={<StarRoundedIcon />}
                  label={`TMDB ${item.externalRating.toFixed(1)}`}
                  variant="outlined"
                />
              ) : null}
            </Stack>
            <Box>
              <Typography component="h1" variant="h3" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                {item.title}
              </Typography>
              {item.originalTitle && item.originalTitle !== item.title ? (
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  {item.originalTitle}
                </Typography>
              ) : null}
            </Box>
            {metadata.length ? (
              <Typography color="text.secondary">{metadata.join(' · ')}</Typography>
            ) : null}
            {item.genres.length ? (
              <Stack direction="row" gap={0.75} useFlexGap flexWrap="wrap">
                {item.genres.map((genre) => (
                  <Chip key={genre.id} label={genre.name} size="small" variant="outlined" />
                ))}
              </Stack>
            ) : null}
            <Typography sx={{ maxWidth: 760 }}>
              {item.overview || 'No synopsis is available for this title.'}
            </Typography>
            {creator || cast.length ? (
              <Box component="section" aria-label="Cast and creators">
                <Divider sx={{ mb: 2.25 }} />
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(170px, 0.7fr)' },
                    gap: 3,
                  }}
                >
                  {creator ? (
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        {creator.role.toUpperCase()}
                      </Typography>
                      <Typography fontWeight={700} sx={{ mt: 0.5 }}>
                        {creator.name}
                      </Typography>
                    </Box>
                  ) : null}
                  {cast.length ? (
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        MAIN CAST
                      </Typography>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                          gap: 1.5,
                          mt: 1,
                        }}
                      >
                        {cast.map((credit) => (
                          <Stack
                            key={`${credit.name}:${credit.role}`}
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            minWidth={0}
                          >
                            <Avatar
                              src={credit.profileUrl ?? undefined}
                              alt=""
                              sx={{ width: 36, height: 36 }}
                            >
                              {credit.name[0]}
                            </Avatar>
                            <Box minWidth={0}>
                              <Typography variant="body2" fontWeight={700} noWrap>
                                {credit.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {credit.role}
                              </Typography>
                            </Box>
                          </Stack>
                        ))}
                      </Box>
                    </Box>
                  ) : null}
                </Box>
              </Box>
            ) : null}
            <Paper
              component="section"
              aria-labelledby="your-experience-heading"
              sx={{
                overflow: 'hidden',
                border: 1,
                borderRadius: 2,
                borderColor: libraryMembership ? 'primary.main' : 'divider',
                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.88),
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ px: { xs: 2, md: 2.5 }, pt: { xs: 2, md: 2.25 } }}
              >
                <LocalMoviesRoundedIcon
                  color={libraryMembership ? 'primary' : 'disabled'}
                  sx={{ fontSize: 20 }}
                />
                <Typography
                  id="your-experience-heading"
                  component="h2"
                  variant="body2"
                  fontWeight={800}
                  sx={{ flexGrow: 1 }}
                >
                  Your Experience
                </Typography>
                {libraryMembership?.status === 'WATCHED' && !experienceEditing ? (
                  <Button
                    size="small"
                    startIcon={<EditRoundedIcon />}
                    onClick={() => setExperienceEditing(true)}
                  >
                    Edit
                  </Button>
                ) : null}
              </Stack>
              {libraryMembership?.status === 'WATCHED' && experienceEditing ? (
                <Stack spacing={2} sx={{ px: { xs: 2, md: 2.5 }, py: 2.25 }}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'minmax(170px, 0.8fr) minmax(0, 1fr)' },
                      gap: 2.5,
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={800}>
                        RATING
                      </Typography>
                      <Typography
                        color={experienceRating === null ? 'text.secondary' : 'primary.main'}
                        fontWeight={800}
                      >
                        {experienceRating === null
                          ? 'Not rated'
                          : `${experienceRating.toFixed(1)}/10`}
                      </Typography>
                      <Slider
                        aria-label="Personal rating"
                        value={experienceRating ?? 1}
                        min={1}
                        max={10}
                        step={0.5}
                        onChange={(_event, value) => setExperienceRating(value as number)}
                        disabled={saveExperience.isPending}
                      />
                      <Button
                        size="small"
                        onClick={() => setExperienceRating(null)}
                        disabled={experienceRating === null || saveExperience.isPending}
                      >
                        Clear rating
                      </Button>
                    </Box>
                    <Stack spacing={1.5}>
                      <TextField
                        label="Comment"
                        multiline
                        minRows={3}
                        value={experienceComment}
                        onChange={(event) => setExperienceComment(event.target.value)}
                        disabled={saveExperience.isPending}
                        slotProps={{ htmlInput: { maxLength: 2000 } }}
                      />
                      <TextField
                        label="Watched on"
                        type="date"
                        required
                        value={experienceDate}
                        onChange={(event) => setExperienceDate(event.target.value)}
                        disabled={saveExperience.isPending}
                        slotProps={{
                          inputLabel: { shrink: true },
                          htmlInput: { max: localDate() },
                        }}
                      />
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      onClick={() => {
                        setExperienceEditing(false);
                        setExperienceRating(libraryMembership.personalRating);
                        setExperienceComment(libraryMembership.privateComment ?? '');
                        setExperienceDate(
                          libraryMembership.watchedAt
                            ? localDate(new Date(libraryMembership.watchedAt))
                            : localDate(),
                        );
                      }}
                      disabled={saveExperience.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveRoundedIcon />}
                      onClick={() => saveExperience.mutate()}
                      disabled={saveExperience.isPending || !experienceDate}
                      aria-busy={saveExperience.isPending}
                    >
                      {saveExperience.isPending ? 'Saving…' : 'Save Experience'}
                    </Button>
                  </Stack>
                </Stack>
              ) : libraryMembership?.status === 'WATCHED' ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'minmax(150px, 0.8fr) minmax(210px, 1fr)',
                    },
                    gap: 2.5,
                    px: { xs: 2, md: 2.5 },
                    py: 2.25,
                  }}
                >
                  <Box>
                    <Stack direction="row" spacing={0.75} alignItems="baseline">
                      <Typography
                        color={
                          libraryMembership.personalRating === null
                            ? 'text.secondary'
                            : 'primary.main'
                        }
                        sx={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}
                      >
                        {libraryMembership.personalRating === null
                          ? '—'
                          : libraryMembership.personalRating.toFixed(1)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        /10
                      </Typography>
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 1.25, fontStyle: 'italic' }}
                    >
                      {libraryMembership.personalRating === null
                        ? 'Not rated'
                        : 'Your personal rating'}
                    </Typography>
                    <LinearProgress
                      aria-label="Personal rating"
                      aria-valuemax={10}
                      aria-valuemin={1}
                      aria-valuenow={libraryMembership.personalRating ?? undefined}
                      role="meter"
                      variant="determinate"
                      value={
                        libraryMembership.personalRating ? libraryMembership.personalRating * 10 : 0
                      }
                      sx={{ mt: 1.25, height: 5, borderRadius: 3 }}
                    />
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      minHeight: 106,
                      borderRadius: 1,
                      bgcolor: (theme) => alpha(theme.palette.background.default, 0.58),
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight={800}>
                      COMMENT
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {libraryMembership.privateComment || 'No private comment yet.'}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ px: { xs: 2, md: 2.5 }, py: 2.25 }}>
                  <Typography color="text.secondary">
                    Mark this title as watched to log your private experience.
                  </Typography>
                </Box>
              )}
              <Divider />
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ sm: 'center' }}
                justifyContent="space-between"
                sx={{ px: { xs: 2, md: 2.5 }, py: 1.5 }}
              >
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <LockOutlinedIcon sx={{ fontSize: 15 }} color="disabled" />
                  <Typography variant="caption" color="text.secondary">
                    Visible only to you
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  {libraryMembership ? (
                    <CheckCircleRoundedIcon sx={{ fontSize: 16 }} color="primary" />
                  ) : null}
                  <Typography variant="caption" color="text.secondary">
                    {membership.isLoading
                      ? 'Checking library status…'
                      : membership.isError
                        ? 'Library status unavailable'
                        : libraryMembership?.status === 'WATCHED'
                          ? libraryMembership.watchedAt
                            ? `Watched on ${new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(libraryMembership.watchedAt))}`
                            : 'Watched'
                          : libraryMembership?.status === 'WATCHLIST'
                            ? 'Saved to Pending'
                            : 'Not in your library'}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Box>
        <Box component="section" sx={{ mt: 5 }}>
          <Typography component="h2" variant="h5" mb={2}>
            Similar content
          </Typography>
          {similar.isLoading ? (
            <Stack alignItems="center" py={4} role="status">
              <CircularProgress aria-label="Loading similar content" />
            </Stack>
          ) : null}
          {similar.isError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => void similar.refetch()}>
                  Retry
                </Button>
              }
            >
              We could not load similar content.
            </Alert>
          ) : null}
          {!similar.isLoading && !similar.isError && !similarItems.length ? (
            <Typography color="text.secondary">
              No similar content is available right now.
            </Typography>
          ) : null}
          {similarItems.length ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: 2,
              }}
            >
              {similarItems.map((candidate) => (
                <SimilarCard
                  key={`${candidate.mediaType}:${candidate.externalId}`}
                  item={candidate}
                />
              ))}
            </Box>
          ) : null}
        </Box>
      </Container>
      <Snackbar
        open={Boolean(message)}
        autoHideDuration={5000}
        onClose={() => setMessage(undefined)}
        message={message}
      />
    </Box>
  );
}
