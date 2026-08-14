import AddRoundedIcon from '@mui/icons-material/AddRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MovieFilterRoundedIcon from '@mui/icons-material/MovieFilterRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import { Badge } from '@mui/material';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import RecommendRoundedIcon from '@mui/icons-material/RecommendRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';
import {
  Avatar,
  Box,
  Button,
  Drawer,
  IconButton,
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { getCurrentUser, logout } from '@/features/auth/auth.api';
import { UsernameSetupDialog } from '@/features/auth/components/username-setup-dialog';
import { clearCsrfToken } from '@/services/http-client';
import { getUnreadNotificationCount } from '@/features/notifications/notifications.api';

const items = [
  { label: 'Home', icon: <HomeRoundedIcon />, to: '/home' },
  { label: 'Explore', icon: <MovieFilterRoundedIcon />, to: '/explore' },
  { label: 'My Library', icon: <VideoLibraryRoundedIcon />, to: '/library' },
  { label: 'Shared', icon: <PeopleOutlineRoundedIcon />, to: '/shared' },
  { label: 'Recommendations', icon: <RecommendRoundedIcon />, to: '/recommendations' },
  { label: 'Notifications', icon: <NotificationsNoneRoundedIcon />, to: '/notifications' },
];
function Menu({ unreadCount }: { unreadCount: number }) {
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
              <ListItemIcon>
                {item.label === 'Notifications' ? (
                  <Badge
                    badgeContent={unreadCount > 99 ? '99+' : unreadCount}
                    color="primary"
                    invisible={!unreadCount}
                  >
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
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
  const [signingOut, setSigningOut] = useState(false);
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: getCurrentUser });
  const { data: notifications } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: ({ signal }) => getUnreadNotificationCount(signal),
    refetchOnWindowFocus: false,
  });
  const signOut = () => {
    setSigningOut(true);
    void logout().finally(() => {
      clearCsrfToken();
      queryClient.clear();
      window.location.assign('/sign-in');
    });
  };
  const sidebar = (
    <Stack height="100%" sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={800} sx={{ px: 1, mb: 2 }}>
        Popcorn Time
      </Typography>
      <Menu unreadCount={notifications?.unreadCount ?? 0} />
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
        <Box
          sx={{
            position: 'relative',
            width: 40,
            height: 40,
            '&:hover .sign-out-action, &:focus-within .sign-out-action': { opacity: 1 },
          }}
        >
          <Avatar src={user?.avatarUrl ?? undefined}>{user?.displayName?.[0]}</Avatar>
          <Tooltip title="Sign out">
            <IconButton
              className="sign-out-action"
              aria-label="Sign out"
              onClick={signOut}
              disabled={signingOut}
              sx={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                color: 'common.white',
                bgcolor: 'action.active',
                transition: 'opacity 150ms ease',
                '&:hover': { bgcolor: 'action.active' },
              }}
            >
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
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
              <Menu unreadCount={notifications?.unreadCount ?? 0} />
            </Box>
          </Drawer>
        </>
      ) : null}
      <UsernameSetupDialog open={Boolean(user && !user.username)} />
    </Box>
  );
}
