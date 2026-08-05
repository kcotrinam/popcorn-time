import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreateManualLibraryItemInput, ManualCategory } from '@popcorn-time/shared';
import { HttpError } from '@/services/http-client';
import { addManualToLibrary } from '../library.api';

const categories: ManualCategory[] = ['Anime', 'Documentary', 'Experimental', 'Indie', 'Family'];
const currentYear = new Date().getFullYear() + 1;
const isHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};
const isExactMatchDetails = (
  details: unknown,
): details is { mediaType: 'movie' | 'tv'; externalId: number } =>
  typeof details === 'object' &&
  details !== null &&
  'mediaType' in details &&
  'externalId' in details &&
  ((details as { mediaType: unknown }).mediaType === 'movie' ||
    (details as { mediaType: unknown }).mediaType === 'tv') &&
  typeof (details as { externalId: unknown }).externalId === 'number';
const isAmbiguousMatchDetails = (
  details: unknown,
): details is { query: string; mediaType: 'movie' | 'tv' } =>
  typeof details === 'object' &&
  details !== null &&
  'query' in details &&
  'mediaType' in details &&
  typeof (details as { query: unknown }).query === 'string' &&
  ((details as { mediaType: unknown }).mediaType === 'movie' ||
    (details as { mediaType: unknown }).mediaType === 'tv');

export function ManualRegistrationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [releaseYear, setReleaseYear] = useState('');
  const [originalLanguage, setOriginalLanguage] = useState('');
  const [nationality, setNationality] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<ManualCategory[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const [notice, setNotice] = useState<string>();
  const validPosterUrl = useMemo(
    () => !posterUrl.trim() || isHttpsUrl(posterUrl.trim()),
    [posterUrl],
  );
  const validYear =
    !releaseYear ||
    (/^\d{4}$/.test(releaseYear) &&
      Number(releaseYear) >= 1888 &&
      Number(releaseYear) <= currentYear);
  const create = useMutation({
    mutationFn: (status: CreateManualLibraryItemInput['status']) =>
      addManualToLibrary({
        title: title.trim(),
        originalTitle: originalTitle.trim() || undefined,
        mediaType,
        releaseYear: releaseYear ? Number(releaseYear) : undefined,
        originalLanguage: originalLanguage.trim() || undefined,
        nationality: nationality.trim() || undefined,
        synopsis: synopsis.trim() || undefined,
        posterUrl: posterUrl.trim() || undefined,
        categories: selectedCategories,
        status,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['library'] });
      setNotice('Content saved to your library.');
      window.setTimeout(() => void navigate('/library'), 500);
    },
    onError: (error) => {
      if (!(error instanceof HttpError)) {
        setNotice('We could not save this content. Please try again.');
        return;
      }
      if (error.code === 'CATALOG_EXACT_MATCH' && isExactMatchDetails(error.details)) {
        void navigate(`/explore/${error.details.mediaType}/${error.details.externalId}`);
        return;
      }
      if (error.code === 'CATALOG_AMBIGUOUS_MATCH' && isAmbiguousMatchDetails(error.details)) {
        void navigate(
          `/explore?query=${encodeURIComponent(error.details.query)}&type=${error.details.mediaType}`,
        );
        return;
      }
      if (error.status === 503) {
        setNotice('TMDB could not be verified. Please try again.');
        return;
      }
      setNotice('We could not save this content. Please try again.');
    },
  });
  const submit = (status: CreateManualLibraryItemInput['status']) => (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!title.trim() || !validYear || !validPosterUrl) return;
    create.mutate(status);
  };
  const toggleCategory = (category: ManualCategory) =>
    setSelectedCategories((value) =>
      value.includes(category) ? value.filter((item) => item !== category) : [...value, category],
    );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3} component="form" noValidate onSubmit={submit('WATCHLIST')}>
        <Box>
          <Typography component="h1" variant="h4">
            Manual Registration
          </Typography>
          <Typography color="text.secondary">
            Add custom content that is not found in our global catalog.
          </Typography>
        </Box>
        <Alert severity="info">
          This content is private to your library. It will not appear in global searches or sync
          with public catalog data.
        </Alert>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 280px' },
            gap: 3,
          }}
        >
          <Stack spacing={2.5}>
            <TextField
              required
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              error={submitted && !title.trim()}
              helperText={submitted && !title.trim() ? 'Title is required.' : undefined}
              inputProps={{ maxLength: 500 }}
            />
            <TextField
              label="Original title"
              value={originalTitle}
              onChange={(event) => setOriginalTitle(event.target.value)}
              inputProps={{ maxLength: 500 }}
            />
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}
            >
              <TextField
                select
                label="Content type"
                value={mediaType}
                onChange={(event) => setMediaType(event.target.value as 'movie' | 'tv')}
              >
                <MenuItem value="movie">Movie</MenuItem>
                <MenuItem value="tv">Series</MenuItem>
              </TextField>
              <TextField
                label="Release year"
                value={releaseYear}
                onChange={(event) => setReleaseYear(event.target.value)}
                error={submitted && !validYear}
                helperText={
                  submitted && !validYear ? `Use a year from 1888 to ${currentYear}.` : undefined
                }
                inputProps={{ inputMode: 'numeric', maxLength: 4 }}
              />
              <TextField
                label="Original language"
                value={originalLanguage}
                onChange={(event) => setOriginalLanguage(event.target.value)}
                inputProps={{ maxLength: 100 }}
              />
              <TextField
                label="Nationality"
                value={nationality}
                onChange={(event) => setNationality(event.target.value)}
                inputProps={{ maxLength: 100 }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Categories
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {categories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    clickable
                    color={selectedCategories.includes(category) ? 'primary' : 'default'}
                    variant={selectedCategories.includes(category) ? 'filled' : 'outlined'}
                    onClick={() => toggleCategory(category)}
                  />
                ))}
              </Stack>
            </Box>
            <TextField
              label="Synopsis"
              value={synopsis}
              onChange={(event) => setSynopsis(event.target.value)}
              multiline
              minRows={5}
              inputProps={{ maxLength: 5000 }}
            />
            <TextField
              label="External poster URL (optional)"
              placeholder="https://example.com/poster.jpg"
              value={posterUrl}
              onChange={(event) => {
                setPosterUrl(event.target.value);
                setPosterFailed(false);
              }}
              error={submitted && !validPosterUrl}
              helperText={
                submitted && !validPosterUrl
                  ? 'Enter a valid HTTPS URL.'
                  : 'The image remains hosted by its original provider.'
              }
            />
          </Stack>
          <Stack spacing={2}>
            <Box
              sx={{
                aspectRatio: '2 / 3',
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'background.paper',
              }}
            >
              {posterUrl.trim() && validPosterUrl && !posterFailed ? (
                <Box
                  component="img"
                  src={posterUrl.trim()}
                  alt="Poster preview"
                  onError={() => setPosterFailed(true)}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Stack
                  role="img"
                  aria-label="Poster unavailable"
                  height="100%"
                  alignItems="center"
                  justifyContent="center"
                  p={2}
                  textAlign="center"
                >
                  <Typography fontWeight={700}>{title.trim() || 'Poster preview'}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Poster unavailable
                  </Typography>
                </Stack>
              )}
            </Box>
            <Button
              type="button"
              variant="contained"
              disabled={create.isPending}
              onClick={submit('WATCHED')}
            >
              Save as watched
            </Button>
            <Button type="submit" variant="outlined" disabled={create.isPending}>
              Save for later
            </Button>
            <Button type="button" onClick={() => void navigate('/library')}>
              Cancel
            </Button>
          </Stack>
        </Box>
      </Stack>
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={4000}
        onClose={() => setNotice(undefined)}
        message={notice}
      />
    </Container>
  );
}
