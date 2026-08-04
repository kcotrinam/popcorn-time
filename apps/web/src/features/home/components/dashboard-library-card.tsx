import { Box, Chip, Stack, Typography } from '@mui/material';
import type { LibraryItem } from '@popcorn-time/shared';
import { Link as RouterLink } from 'react-router-dom';

export function DashboardLibraryCard({ item }: { item: LibraryItem }) {
  const status = item.status === 'WATCHLIST' ? 'Pending' : 'Watched';
  return (
    <Box
      component={RouterLink}
      to={`/explore/${item.mediaType}/${item.externalId}`}
      aria-label={`View ${item.title}`}
      sx={{
        width: 174,
        flex: '0 0 174px',
        color: 'inherit',
        textDecoration: 'none',
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        '&:focus-visible': { outline: 2, outlineColor: 'primary.main', outlineOffset: 2 },
      }}
    >
      <Box sx={{ position: 'relative', aspectRatio: '2 / 3', bgcolor: 'background.default' }}>
        {item.posterUrl ? (
          <Box
            component="img"
            src={item.posterUrl}
            alt={`Poster for ${item.title}`}
            loading="lazy"
            sx={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
          />
        ) : (
          <Stack height="100%" p={2} alignItems="center" justifyContent="center" textAlign="center">
            <Typography variant="caption">Poster unavailable</Typography>
          </Stack>
        )}
        <Chip
          label={status}
          color={item.status === 'WATCHLIST' ? 'primary' : 'default'}
          size="small"
          sx={{ position: 'absolute', top: 8, left: 8 }}
        />
      </Box>
      <Stack spacing={0.25} p={1.25}>
        <Typography fontWeight={700} variant="body2" noWrap title={item.title}>
          {item.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {[item.releaseYear, item.mediaType === 'movie' ? 'Movie' : 'Series']
            .filter(Boolean)
            .join(' · ')}
        </Typography>
      </Stack>
    </Box>
  );
}
