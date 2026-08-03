import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink, useParams } from 'react-router-dom';
import type { CatalogMediaType } from '@popcorn-time/shared';
import { getCatalogDetail } from '../catalog.api';

function DetailValue({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return value ? (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  ) : null;
}
export function CatalogDetailPage() {
  const { type, id } = useParams();
  const mediaType = type === 'movie' || type === 'tv' ? (type as CatalogMediaType) : undefined;
  const externalId = Number(id);
  const detail = useQuery({
    queryKey: ['catalog-detail', mediaType, externalId],
    queryFn: ({ signal }) => getCatalogDetail(mediaType!, externalId, signal),
    enabled: Boolean(mediaType && Number.isInteger(externalId) && externalId > 0),
  });
  if (!mediaType || !Number.isInteger(externalId) || externalId < 1)
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="error">Este contenido no es válido.</Alert>
      </Container>
    );
  if (detail.isLoading)
    return (
      <Stack minHeight="70vh" alignItems="center" justifyContent="center">
        <CircularProgress aria-label="Cargando detalle" />
      </Stack>
    );
  if (detail.isError || !detail.data)
    return (
      <Container sx={{ py: 5 }}>
        <Alert
          severity="error"
          action={
            <Button component={RouterLink} to="/explore" color="inherit">
              Volver
            </Button>
          }
        >
          No pudimos cargar este contenido.
        </Alert>
      </Container>
    );
  const item = detail.data;
  const facts = [
    ['Fecha', item.releaseDate],
    ['Idioma original', item.originalLanguage?.toUpperCase()],
    ['Países', item.originCountries.join(', ')],
    ['Estado', item.status],
    [
      item.mediaType === 'movie' ? 'Duración' : 'Episodios',
      item.mediaType === 'movie'
        ? item.runtimeMinutes
          ? `${item.runtimeMinutes} min`
          : null
        : item.numberOfEpisodes,
    ],
    ['Temporadas', item.mediaType === 'tv' ? item.numberOfSeasons : null],
  ] as const;
  return (
    <Box sx={{ minHeight: '100vh', pb: 5 }}>
      {item.backdropUrl ? (
        <Box
          aria-hidden
          sx={{
            height: { xs: 220, md: 340 },
            opacity: 0.35,
            backgroundImage: (theme) =>
              `linear-gradient(to bottom, transparent, ${theme.palette.background.default}), url(${item.backdropUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ) : null}
      <Container
        maxWidth="lg"
        sx={{ mt: item.backdropUrl ? { xs: -8, md: -15 } : 0, position: 'relative', pt: 3 }}
      >
        <Button
          component={RouterLink}
          to="/explore"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ mb: 3 }}
        >
          Volver a explorar
        </Button>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, md: 4 }}>
          <Box
            sx={{
              flex: '0 0 auto',
              width: { xs: 180, sm: 240 },
              alignSelf: { xs: 'center', sm: 'flex-start' },
              aspectRatio: '2 / 3',
              overflow: 'hidden',
              borderRadius: 2,
              bgcolor: 'background.paper',
            }}
          >
            {item.posterUrl ? (
              <Box
                component="img"
                src={item.posterUrl}
                alt={`Poster de ${item.title}`}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Stack
                role="img"
                aria-label={`Poster no disponible para ${item.title}`}
                height="100%"
                justifyContent="center"
                alignItems="center"
                p={2}
                textAlign="center"
              >
                <Typography>{item.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Poster no disponible
                </Typography>
              </Stack>
            )}
          </Box>
          <Stack spacing={2} flexGrow={1}>
            <Box>
              <Typography component="h1" variant="h4">
                {item.title}
              </Typography>
              {item.originalTitle && item.originalTitle !== item.title ? (
                <Typography color="text.secondary">{item.originalTitle}</Typography>
              ) : null}
            </Box>
            {item.externalRating !== null ? (
              <Chip
                icon={<StarRoundedIcon />}
                label={`${item.externalRating.toFixed(1)} rating externo`}
                sx={{ alignSelf: 'flex-start' }}
              />
            ) : null}
            {item.overview ? (
              <Typography>{item.overview}</Typography>
            ) : (
              <Typography color="text.secondary">Sin sinopsis disponible.</Typography>
            )}
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {item.genres.map((genre) => (
                <Chip key={genre.id} label={genre.name} size="small" />
              ))}
            </Stack>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              {facts.map(([label, value]) => (
                <DetailValue key={label} label={label} value={value} />
              ))}
            </Box>
            <Button disabled variant="outlined" sx={{ alignSelf: 'flex-start' }}>
              Agregar a mi biblioteca · Próximamente
            </Button>
          </Stack>
        </Stack>
        {item.credits.length ? (
          <Box mt={5}>
            <Typography variant="h5" component="h2" mb={2}>
              Créditos principales
            </Typography>
            <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
              {item.credits.map((credit) => (
                <Stack
                  key={`${credit.name}-${credit.role}`}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ minWidth: 180 }}
                >
                  <Avatar src={credit.profileUrl ?? undefined} alt={credit.name}>
                    {credit.name[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      {credit.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {credit.role}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Container>
    </Box>
  );
}
