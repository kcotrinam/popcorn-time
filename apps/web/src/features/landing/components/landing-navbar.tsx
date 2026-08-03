import MovieFilterRoundedIcon from '@mui/icons-material/MovieFilterRounded';
import { useQuery } from '@tanstack/react-query';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { getCurrentUser } from '@/features/auth/auth.api';

function userInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function LandingNavbar() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  return (
    <AppBar
      position="static"
      elevation={0}
      component="header"
      sx={{ bgcolor: 'transparent', borderBottom: 1, borderColor: 'divider' }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{ minHeight: { xs: 64, md: 72 }, justifyContent: 'space-between', gap: 2 }}
        >
          <Stack
            component={RouterLink}
            to="/"
            direction="row"
            alignItems="center"
            spacing={1}
            color="inherit"
            sx={{ textDecoration: 'none' }}
            aria-label="Popcorn Time, home"
          >
            <MovieFilterRoundedIcon color="primary" />
            <Typography fontWeight={800} letterSpacing="-0.03em">
              Popcorn Time
            </Typography>
          </Stack>
          <Box
            component="nav"
            aria-label="Main navigation"
            sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}
          >
            <Button href="#features" color="inherit">
              Features
            </Button>
            <Button href="#coleccion" color="inherit">
              Collection
            </Button>
          </Box>
          {user ? (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button component={RouterLink} to="/explore" variant="contained">
                Explorar
              </Button>
              <Tooltip title="Abrir aplicación">
                <Box
                  component={RouterLink}
                  to="/explore"
                  aria-label={`Abrir aplicación para ${user.displayName}`}
                  sx={{ display: 'inline-flex', borderRadius: '50%', textDecoration: 'none' }}
                >
                  <Avatar
                    src={user.avatarUrl ?? undefined}
                    alt={user.displayName}
                    sx={{
                      width: 38,
                      height: 38,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: 700,
                    }}
                  >
                    {userInitials(user.displayName)}
                  </Avatar>
                </Box>
              </Tooltip>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button
                component={RouterLink}
                to="/sign-in"
                color="inherit"
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Sign in
              </Button>
              <Button component={RouterLink} to="/sign-up" variant="contained" color="primary">
                Sign up
              </Button>
            </Stack>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
