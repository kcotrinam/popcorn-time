import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { APP_NAME } from '@popcorn-time/shared';
import { ThemeSelector } from '@/components/theme-selector';
import { getHealth } from '@/services/health';
export function StatusPage() {
  const health = useQuery({ queryKey: ['health'], queryFn: getHealth });
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Stack spacing={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">{APP_NAME}</Typography>
          <ThemeSelector />
        </Box>
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography>Project foundation is running</Typography>
            {health.isPending && (
              <Box display="flex" gap={1} alignItems="center">
                <CircularProgress size={20} />
                Loading service status…
              </Box>
            )}
            {health.isError && (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={() => void health.refetch()}>
                    Retry
                  </Button>
                }
              >
                Unable to reach the API: {health.error.message}
              </Alert>
            )}
            {health.data && (
              <Stack spacing={1}>
                <Typography>Web: Healthy</Typography>
                <Typography>
                  API: {health.data.services.api === 'up' ? 'Healthy' : 'Unavailable'}
                </Typography>
                <Typography>
                  Database: {health.data.services.database === 'up' ? 'Healthy' : 'Unavailable'}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
