import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import MovieFilterRoundedIcon from '@mui/icons-material/MovieFilterRounded';
import { Box, Container, IconButton, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { footerLinks } from '../landing-content';
export function LandingFooter() {
  return (
    <Box
      component="footer"
      sx={{ bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', py: 4 }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3} alignItems="center">
          <Stack
            width="100%"
            direction={{ xs: 'column', md: 'row' }}
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Stack
              component={RouterLink}
              to="/"
              direction="row"
              spacing={1}
              alignItems="center"
              color="inherit"
              sx={{ textDecoration: 'none' }}
            >
              <MovieFilterRoundedIcon color="primary" fontSize="small" />
              <Typography fontWeight={750}>Popcorn Time</Typography>
            </Stack>
            <Stack direction="row" spacing={2.5}>
              {footerLinks.map((link) => (
                <Link
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  underline="hover"
                  color="text.secondary"
                  variant="caption"
                >
                  {link}
                </Link>
              ))}
            </Stack>
            <Stack direction="row">
              <IconButton aria-label="Visit community" size="small" color="primary">
                <LanguageRoundedIcon fontSize="small" />
              </IconButton>
              <IconButton aria-label="Contact Popcorn Time" size="small" color="primary">
                <AlternateEmailRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            © 2026 Popcorn Time. All rights reserved.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
