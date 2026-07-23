import MovieFilterRoundedIcon from '@mui/icons-material/MovieFilterRounded';
import { Box, Container, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { APP_NAME } from '@popcorn-time/shared';

const theaterImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB3_MYmnWQxv4USbphCEp26rBs8rXJFPsVIkmTSduy6DZgC00X-l_R7CbLiJrW68MGeVlwiGWRI8KoQt4SSrlc2egSeeGDOIGt--VmUnXka_lgDFA3vVYrKzzYokgaInoYvJUQg_7I9CZZMfU8VMV9iGGzXcoL3vYnh_BEUvU1mCULGUvSEB14BIEROhH2aIQ6DFchnL9U2J5J59Md3IfhOIzjAnc2P7LBWCdiGi8aTmUnWBsv07wbdMughZiSZ-_ucuwQn58yfdsA';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Box minHeight="100vh" display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}>
      <Box
        display={{ xs: 'none', md: 'flex' }}
        alignItems="center"
        overflow="hidden"
        color="text.primary"
        sx={{
          backgroundImage: `linear-gradient(90deg, rgba(0, 33, 19, 0.96) 0%, rgba(15, 20, 18, 0.62) 100%), url(${theaterImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Stack spacing={3} maxWidth={500} sx={{ px: { md: 6, lg: 12 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <MovieFilterRoundedIcon color="primary" sx={{ fontSize: 40 }} aria-hidden="true" />
            <Typography fontSize={32} fontWeight={700} letterSpacing="-0.03em">
              {APP_NAME}
            </Typography>
          </Stack>
          <Typography
            component="h1"
            sx={{
              color: 'primary.main',
              fontSize: { md: 42, lg: 48 },
              fontWeight: 700,
              lineHeight: 1.17,
              letterSpacing: '-0.02em',
            }}
          >
            Your Personal Cinematic Archive.
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 18, lineHeight: 1.55, maxWidth: 440 }}>
            Organize your library, track your watch history, and discover your next obsession with
            professional precision and dark mode elegance.
          </Typography>
          <Stack
            direction="row"
            spacing={7}
            pt={3}
            sx={{ borderTop: 1, borderColor: 'rgba(60, 74, 66, 0.6)' }}
          >
            <Box>
              <Typography variant="h5">15k+</Typography>
              <Typography variant="body2" color="secondary.main">
                Movies cataloged
              </Typography>
            </Box>
            <Box>
              <Typography variant="h5">99%</Typography>
              <Typography variant="body2" color="secondary.main">
                Sync Accuracy
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Box>
      <Box display="flex" alignItems="center" bgcolor="background.default" py={{ xs: 5, md: 8 }}>
        <Container maxWidth="sm" sx={{ px: { xs: 3, sm: 6 } }}>
          <Box width="100%">{children}</Box>
        </Container>
      </Box>
    </Box>
  );
}
