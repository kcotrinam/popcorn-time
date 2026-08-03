import { Box, Paper, Stack, Typography } from '@mui/material';
import type { Feature } from '../landing-content';
export function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <Paper
      component="article"
      sx={{
        p: 3,
        minHeight: 190,
        bgcolor: 'background.paper',
        borderColor: 'divider',
        borderRadius: 3,
      }}
    >
      <Stack spacing={2}>
        <Box
          sx={{
            width: 38,
            height: 38,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 2,
            bgcolor: 'action.hover',
            color: 'primary.main',
          }}
        >
          <Icon fontSize="small" />
        </Box>
        <Typography variant="h6" fontWeight={700}>
          {feature.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {feature.description}
        </Typography>
      </Stack>
    </Paper>
  );
}
