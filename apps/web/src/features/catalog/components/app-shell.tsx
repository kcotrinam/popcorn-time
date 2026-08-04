import AddRoundedIcon from '@mui/icons-material/AddRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import MovieFilterRoundedIcon from '@mui/icons-material/MovieFilterRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import RecommendRoundedIcon from '@mui/icons-material/RecommendRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';
import {
  Avatar,
  Box,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { getCurrentUser } from '@/features/auth/auth.api';

const items = [
  { label: 'Home', icon: <HomeRoundedIcon />, to: '/home' },
  { label: 'Explore', icon: <MovieFilterRoundedIcon />, to: '/explore' },
  { label: 'My Library', icon: <VideoLibraryRoundedIcon />, to: '/library' },
  { label: 'Shared', icon: <PeopleOutlineRoundedIcon /> },
  { label: 'Recommendations', icon: <RecommendRoundedIcon /> },
  { label: 'Notifications', icon: <NotificationsNoneRoundedIcon /> },
];
function Menu() {
  const location = useLocation();
  return (
    <List>
      {items.map((item) => (
        <Tooltip key={item.label} title={!item.to ? 'Próximamente' : ''} placement="right">
          <span>
            <ListItemButton
              disabled={!item.to}
              selected={Boolean(item.to && location.pathname.startsWith(item.to))}
              component={item.to ? RouterLink : 'button'}
              to={item.to}
              sx={{ borderRadius: 1, mb: 0.5 }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </span>
        </Tooltip>
      ))}
    </List>
  );
}
export function AppShell({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const [moreOpen, setMoreOpen] = useState(false);
  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: getCurrentUser });
  const sidebar = (
    <Stack height="100%" sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={800} sx={{ px: 1, mb: 2 }}>
        Popcorn Time
      </Typography>
      <Menu />
      <Box flexGrow={1} />
      <Button
        component={RouterLink}
        to="/library/manual"
        variant="contained"
        startIcon={<AddRoundedIcon />}
        fullWidth
      >
        Add content
      </Button>
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mt: 2, px: 1 }}>
        <Avatar src={user?.avatarUrl ?? undefined}>{user?.displayName?.[0]}</Avatar>
        <Box minWidth={0} flexGrow={1}>
          <Typography variant="body2" fontWeight={700} noWrap>
            {user?.displayName ?? 'User'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user?.email}
          </Typography>
        </Box>
        <Tooltip title="Settings coming soon">
          <SettingsOutlinedIcon color="action" />
        </Tooltip>
      </Stack>
    </Stack>
  );
  return (
    <Box minHeight="100vh" sx={{ bgcolor: 'background.default' }}>
      <Box
        component="aside"
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'fixed',
          inset: '0 auto 0 0',
          width: 254,
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        {sidebar}
      </Box>
      <Box component="main" sx={{ ml: { md: '254px' }, pb: { xs: 9, md: 4 }, minHeight: '100vh' }}>
        {children}
      </Box>
      {!desktop ? (
        <>
          <Box
            component="nav"
            aria-label="Primary navigation"
            sx={{
              position: 'fixed',
              zIndex: theme.zIndex.appBar,
              bottom: 0,
              left: 0,
              right: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              bgcolor: 'background.paper',
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <Button
              component={RouterLink}
              to="/home"
              startIcon={<HomeRoundedIcon />}
              sx={{ minHeight: 64, fontSize: '0.7rem' }}
            >
              Home
            </Button>
            <Button
              component={RouterLink}
              to="/explore"
              startIcon={<MovieFilterRoundedIcon />}
              sx={{ minHeight: 64, fontSize: '0.7rem' }}
            >
              Explore
            </Button>
            <Button
              component={RouterLink}
              to="/library"
              startIcon={<VideoLibraryRoundedIcon />}
              sx={{ minHeight: 64, fontSize: '0.7rem' }}
            >
              Library
            </Button>
            <Button
              onClick={() => setMoreOpen(true)}
              startIcon={<MoreHorizRoundedIcon />}
              sx={{ minHeight: 64, fontSize: '0.7rem' }}
            >
              More
            </Button>
          </Box>
          <Drawer anchor="bottom" open={moreOpen} onClose={() => setMoreOpen(false)}>
            <Box sx={{ p: 1.5 }}>
              <Menu />
            </Box>
          </Drawer>
        </>
      ) : null}
    </Box>
  );
}
