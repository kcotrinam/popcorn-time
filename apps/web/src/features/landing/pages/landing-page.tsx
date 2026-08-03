import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { alpha, Box, Button, Container, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { collectionPosters, features, heroPosters } from '../landing-content';
import { FeatureCard } from '../components/feature-card';
import { LandingFooter } from '../components/landing-footer';
import { LandingNavbar } from '../components/landing-navbar';
import { MockPosterCard } from '../components/mock-poster-card';
import { SectionHeading } from '../components/section-heading';

const primaryButton = {
  bgcolor: 'primary.main',
  color: 'primary.contrastText',
  px: 3,
  minHeight: 46,
  '&:hover': { bgcolor: 'primary.dark' },
};
export function LandingPage() {
  return (
    <Box
      minHeight="100vh"
      sx={{
        color: 'text.primary',
        bgcolor: 'background.default',
        backgroundImage: (theme) =>
          `radial-gradient(circle at 50% -15%, ${alpha(theme.palette.primary.main, 0.2)}, transparent 36%)`,
      }}
    >
      <LandingNavbar />
      <Box component="main">
        <Container maxWidth="lg">
          <Stack
            component="section"
            alignItems="center"
            textAlign="center"
            spacing={3}
            pt={{ xs: 8, md: 12 }}
            pb={{ xs: 8, md: 11 }}
          >
            <Typography
              component="h1"
              sx={{
                maxWidth: 850,
                fontWeight: 800,
                fontSize: { xs: '2.5rem', sm: '3.6rem', md: '4.25rem' },
                lineHeight: 1.05,
                letterSpacing: '-0.055em',
              }}
            >
              Everything you want to watch,{' '}
              <Box component="span" sx={{ color: 'primary.main' }}>
                all in one place.
              </Box>
            </Typography>
            <Typography color="text.secondary" maxWidth={620}>
              Organize movies, series, anime, and documentaries. Keep track of what you watched,
              recommend stories, and make plans to share with your people.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                component={RouterLink}
                to="/sign-in"
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={primaryButton}
              >
                Create my library
              </Button>
              <Button
                component={RouterLink}
                to="/sign-in"
                variant="outlined"
                sx={{
                  color: 'text.primary',
                  borderColor: 'divider',
                  px: 3,
                  minHeight: 46,
                }}
              >
                See how it works
              </Button>
            </Stack>
            <Box
              aria-label="Cinematic poster showcase"
              sx={{
                width: '100%',
                mt: { xs: 3, md: 4 },
                p: { xs: 1.25, sm: 2 },
                overflow: 'hidden',
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Stack
                direction="row"
                spacing={{ xs: 1.25, sm: 1.75 }}
                sx={{
                  overflowX: 'auto',
                  pb: 1,
                  justifyContent: { md: 'center' },
                  '&::-webkit-scrollbar': { height: 7 },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'primary.main',
                    borderRadius: 4,
                  },
                }}
              >
                {heroPosters.map((poster) => (
                  <MockPosterCard key={poster.title} poster={poster} compact />
                ))}
              </Stack>
            </Box>
          </Stack>
        </Container>
        <Box
          id="features"
          component="section"
          sx={{
            py: { xs: 8, md: 11 },
            bgcolor: 'background.default',
            borderTop: 1,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Container maxWidth="lg">
            <Stack spacing={5}>
              <SectionHeading
                title="Made for movie lovers"
                subtitle="Personal tools to organize your audiovisual collection with calm and intention."
              />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                  gap: 2,
                }}
              >
                {features.map((feature) => (
                  <FeatureCard key={feature.title} feature={feature} />
                ))}
              </Box>
            </Stack>
          </Container>
        </Box>
        <Box
          component="section"
          sx={{
            py: { xs: 9, md: 13 },
            background: (theme) =>
              `radial-gradient(circle at 18% 40%, ${alpha(theme.palette.primary.main, 0.18)}, transparent 30%), radial-gradient(circle at 83% 55%, ${alpha(theme.palette.secondary.main, 0.1)}, transparent 28%)`,
          }}
        >
          <Container maxWidth="md">
            <SectionHeading
              title="Your personal library, without social noise."
              subtitle="Focus on your stories."
            />
            <Box
              mx="auto"
              mt={2}
              width={48}
              borderBottom={3}
              borderColor="primary.main"
              borderRadius={2}
            />
          </Container>
        </Box>
        <Box
          id="coleccion"
          component="section"
          sx={{ py: { xs: 7, md: 9 }, bgcolor: 'background.paper' }}
        >
          <Container maxWidth="lg">
            <Stack spacing={3}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ sm: 'flex-end' }}
                justifyContent="space-between"
                spacing={1}
              >
                <Stack spacing={0.5}>
                  <Typography component="h2" variant="h5" fontWeight={750}>
                    Explore your collection
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    See your content with a refined and functional design.
                  </Typography>
                </Stack>
                <Link
                  component={RouterLink}
                  to="/sign-in"
                  color="primary.main"
                  underline="hover"
                  variant="body2"
                >
                  View full gallery ↗
                </Link>
              </Stack>
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  overflowX: 'auto',
                  pb: 2,
                  scrollSnapType: 'x mandatory',
                  '& > article': { scrollSnapAlign: 'start' },
                  '&::-webkit-scrollbar': { height: 7 },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'primary.main',
                    borderRadius: 4,
                  },
                }}
              >
                {collectionPosters.map((poster) => (
                  <MockPosterCard key={poster.title} poster={poster} />
                ))}
              </Stack>
            </Stack>
          </Container>
        </Box>
        <Box
          component="section"
          sx={{
            py: { xs: 9, md: 11 },
            textAlign: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            backgroundImage: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          }}
        >
          <Container maxWidth="sm">
            <Stack spacing={2.5} alignItems="center">
              <Typography component="h2" variant="h4" fontWeight={800}>
                Start organizing your collection today.
              </Typography>
              <Typography color="primary.contrastText">
                Enjoy everything you watch in a more personal way.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  component={RouterLink}
                  to="/sign-in"
                  variant="contained"
                  sx={{
                    bgcolor: 'background.paper',
                    color: 'primary.main',
                    px: 3,
                    '&:hover': { bgcolor: 'background.default' },
                  }}
                >
                  Create a free account
                </Button>
                <Button
                  component={RouterLink}
                  to="/sign-in"
                  variant="outlined"
                  sx={{ color: 'primary.contrastText', borderColor: 'primary.contrastText', px: 3 }}
                >
                  Explore features
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>
      </Box>
      <LandingFooter />
    </Box>
  );
}
