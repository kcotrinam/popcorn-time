import { Box, Chip, Stack, Typography } from '@mui/material';
import type { Poster } from '../landing-content';
export function MockPosterCard({ poster, compact = false }: { poster: Poster; compact?: boolean }) {
  return (
    <Box
      component="article"
      sx={{ flex: '0 0 auto', width: compact ? { xs: 128, sm: 146 } : { xs: 145, sm: 172 } }}
    >
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          aspectRatio: '2 / 3',
          borderRadius: compact ? 1.5 : 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          boxShadow: '0 14px 28px rgba(0, 0, 0, 0.28)',
        }}
      >
        <Box
          component="img"
          src={poster.image}
          alt={poster.alt}
          loading="lazy"
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {poster.status ? (
          <Chip
            label={poster.status}
            size="small"
            sx={{
              position: 'absolute',
              top: 7,
              right: 7,
              height: 20,
              fontSize: 10,
              fontWeight: 700,
              color: 'primary.contrastText',
              bgcolor: 'primary.main',
            }}
          />
        ) : null}
      </Box>
      {!compact ? (
        <Stack spacing={0.25} pt={1}>
          <Typography variant="body2" fontWeight={700} noWrap>
            {poster.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {poster.type} · {poster.year}
          </Typography>
        </Stack>
      ) : null}
    </Box>
  );
}
