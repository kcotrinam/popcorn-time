import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import {
  alpha,
  Box,
  Button,
  Chip,
  Paper,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import type { CatalogCard as CatalogCardModel, LibraryMembership } from '@popcorn-time/shared';
import { Link as RouterLink } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { addToLibrary } from '@/features/library/library.api';

const mediaLabels = { movie: 'Movie', tv: 'Series' } as const;

export function CatalogCard({
  item,
  membership,
}: {
  item: CatalogCardModel;
  membership?: LibraryMembership;
}) {
  const detailPath = `/explore/${item.mediaType}/${item.externalId}`;
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string>();
  const [justAdded, setJustAdded] = useState(false);
  const isInLibrary = Boolean(membership || justAdded);
  const add = useMutation({
    mutationFn: () =>
      addToLibrary({
        provider: item.provider,
        externalId: item.externalId,
        mediaType: item.mediaType,
      }),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['library'] });
      void queryClient.invalidateQueries({ queryKey: ['library-membership'] });
      setJustAdded(true);
      setMessage(
        result.created
          ? `${item.title} was added to Pending.`
          : `${item.title} is already in your library.`,
      );
    },
    onError: () => setMessage(`We could not add ${item.title}. Please try again.`),
  });

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

        {isInLibrary ? (
          <Chip
            icon={<CheckCircleRoundedIcon />}
            label="In your library"
            color="primary"
            size="small"
            sx={{
              position: 'absolute',
              zIndex: 3,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontWeight: 700,
              pointerEvents: 'none',
            }}
          />
        ) : null}

        <Stack
          className="catalog-card-actions"
          spacing={1.25}
          sx={{
            position: 'absolute',
            zIndex: 2,
            top: isInLibrary ? 'calc(50% + 54px)' : '50%',
            right: 14,
            left: 14,
            opacity: 0,
            transform: isInLibrary ? 'translateY(8px)' : 'translateY(calc(-50% + 8px))',
            transition: 'opacity 160ms ease, transform 160ms ease',
          }}
        >
          {!isInLibrary ? (
            <Tooltip title="Add to your Pending library" placement="top">
              <Button
                onClick={() => add.mutate()}
                disabled={add.isPending}
                fullWidth
                startIcon={<AddRoundedIcon />}
                variant="contained"
                aria-label={`Add ${item.title} to pending`}
                sx={{
                  minHeight: 44,
                  borderRadius: 1.5,
                }}
              >
                {add.isPending ? 'Adding…' : 'Add to pending'}
              </Button>
            </Tooltip>
          ) : null}
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
      <Snackbar
        open={Boolean(message)}
        autoHideDuration={5000}
        onClose={() => setMessage(undefined)}
        message={message}
      />
    </Paper>
  );
}
