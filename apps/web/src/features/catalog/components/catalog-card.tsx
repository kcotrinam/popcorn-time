import AddRoundedIcon from '@mui/icons-material/AddRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { alpha, Box, Button, Chip, Paper, Stack, Tooltip, Typography } from '@mui/material';
import type { CatalogCard as CatalogCardModel } from '@popcorn-time/shared';
import { Link as RouterLink } from 'react-router-dom';

const mediaLabels = { movie: 'Movie', tv: 'Series' } as const;

export function CatalogCard({ item }: { item: CatalogCardModel }) {
  const detailPath = `/explore/${item.mediaType}/${item.externalId}`;

  return (
    <Paper
      component="article"
      sx={{
        overflow: 'hidden',
        color: 'inherit',
        transition: 'transform 160ms ease, border-color 160ms ease',
        '&:focus-within': {
          transform: 'translateY(-4px)',
          borderColor: 'primary.main',
          '& .catalog-card-overlay, & .catalog-card-actions': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        '@media (hover: hover) and (pointer: fine)': {
          '&:hover': {
            transform: 'translateY(-4px)',
            borderColor: 'primary.main',
            '& .catalog-card-overlay, & .catalog-card-actions': {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
        },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          '& .catalog-card-overlay, & .catalog-card-actions': { transition: 'none' },
        },
      }}
    >
      <Box sx={{ position: 'relative', aspectRatio: '2 / 3', bgcolor: 'background.default' }}>
        <Box
          component={RouterLink}
          to={detailPath}
          aria-label={`View poster for ${item.title}`}
          sx={{
            display: 'block',
            height: '100%',
            '&:focus-visible': { outline: 3, outlineColor: 'primary.main', outlineOffset: -3 },
          }}
        >
          {item.posterUrl ? (
            <Box
              component="img"
              src={item.posterUrl}
              alt={`Poster for ${item.title}`}
              loading="lazy"
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <Stack
              role="img"
              aria-label={`Poster unavailable for ${item.title}`}
              alignItems="center"
              justifyContent="center"
              sx={{
                height: '100%',
                p: 2,
                textAlign: 'center',
                background: (theme) =>
                  `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.primary.dark})`,
              }}
            >
              <Typography variant="h6" noWrap maxWidth="100%">
                {item.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Poster unavailable
              </Typography>
            </Stack>
          )}
        </Box>

        <Box
          aria-hidden="true"
          className="catalog-card-overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            opacity: 0,
            bgcolor: (theme) => alpha(theme.palette.common.black, 0.66),
            transition: 'opacity 160ms ease',
          }}
        />

        {item.externalRating !== null ? (
          <Chip
            icon={<StarRoundedIcon />}
            label={item.externalRating.toFixed(1)}
            size="small"
            sx={{
              position: 'absolute',
              zIndex: 3,
              top: 8,
              right: 8,
              bgcolor: 'background.paper',
              fontWeight: 700,
            }}
          />
        ) : null}

        <Stack
          className="catalog-card-actions"
          spacing={1.25}
          sx={{
            position: 'absolute',
            zIndex: 2,
            top: '50%',
            right: 14,
            left: 14,
            opacity: 0,
            transform: 'translateY(calc(-50% + 8px))',
            transition: 'opacity 160ms ease, transform 160ms ease',
          }}
        >
          <Tooltip title="Coming in your personal library" placement="top">
            <Box component="span">
              <Button
                disabled
                fullWidth
                startIcon={<AddRoundedIcon />}
                variant="contained"
                aria-label={`Add ${item.title} to pending, coming in your personal library`}
                sx={{
                  minHeight: 44,
                  borderRadius: 1.5,
                  '&.Mui-disabled': (theme) => ({
                    bgcolor: alpha(theme.palette.primary.main, 0.72),
                    color: alpha(theme.palette.primary.contrastText, 0.86),
                    cursor: 'default',
                  }),
                }}
              >
                Add to pending
              </Button>
            </Box>
          </Tooltip>
          <Button
            component={RouterLink}
            to={detailPath}
            fullWidth
            startIcon={<InfoOutlinedIcon />}
            variant="outlined"
            aria-label={`Details for ${item.title}`}
            sx={{
              minHeight: 44,
              borderRadius: 1.5,
              borderColor: (theme) => alpha(theme.palette.common.white, 0.78),
              color: 'common.white',
              bgcolor: (theme) => alpha(theme.palette.common.black, 0.18),
              '&:hover': {
                borderColor: 'common.white',
                bgcolor: (theme) => alpha(theme.palette.common.black, 0.36),
              },
              '&:focus-visible': { outline: 3, outlineColor: 'primary.main', outlineOffset: 2 },
            }}
          >
            Details
          </Button>
        </Stack>
      </Box>

      <Stack spacing={0.5} sx={{ p: 1.25 }}>
        <Typography component="h3" variant="body2" fontWeight={700} noWrap title={item.title}>
          {item.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {[item.releaseYear, mediaLabels[item.mediaType]].filter(Boolean).join(' · ')}
        </Typography>
      </Stack>
    </Paper>
  );
}
