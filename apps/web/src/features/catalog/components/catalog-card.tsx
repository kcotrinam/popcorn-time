import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import type { CatalogCard as CatalogCardModel } from '@popcorn-time/shared';
import { Link as RouterLink } from 'react-router-dom';

const mediaLabels = { movie: 'Película', tv: 'Serie' } as const;

export function CatalogCard({ item }: { item: CatalogCardModel }) {
  return (
    <Paper
      component={RouterLink}
      to={`/explore/${item.mediaType}/${item.externalId}`}
      aria-label={`Ver detalles de ${item.title}`}
      sx={{
        display: 'block', overflow: 'hidden', textDecoration: 'none', color: 'inherit',
        transition: 'transform 160ms ease, border-color 160ms ease',
        '&:hover': { transform: 'translateY(-4px)', borderColor: 'primary.main' },
        '&:focus-visible': { outline: 3, outlineColor: 'primary.main', outlineOffset: 3 },
      }}
    >
      <Box sx={{ position: 'relative', aspectRatio: '2 / 3', bgcolor: 'background.default' }}>
        {item.posterUrl ? (
          <Box component="img" src={item.posterUrl} alt={`Poster de ${item.title}`} loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <Stack role="img" aria-label={`Poster no disponible para ${item.title}`} alignItems="center" justifyContent="center" sx={{ height: '100%', p: 2, textAlign: 'center', background: (theme) => `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.primary.dark})` }}>
            <Typography variant="h6" noWrap maxWidth="100%">{item.title}</Typography>
            <Typography variant="caption" color="text.secondary">Poster no disponible</Typography>
          </Stack>
        )}
        {item.externalRating !== null ? (
          <Chip icon={<StarRoundedIcon />} label={item.externalRating.toFixed(1)} size="small" sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper', fontWeight: 700 }} />
        ) : null}
      </Box>
      <Stack spacing={0.5} sx={{ p: 1.25 }}>
        <Typography component="h3" variant="body2" fontWeight={700} noWrap title={item.title}>{item.title}</Typography>
        <Typography variant="caption" color="text.secondary">
          {[item.releaseYear, mediaLabels[item.mediaType]].filter(Boolean).join(' · ')}
        </Typography>
      </Stack>
    </Paper>
  );
}
