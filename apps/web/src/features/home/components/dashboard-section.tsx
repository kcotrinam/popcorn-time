import { Box, Button, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export function DashboardSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: { label: string; to: string };
  children: ReactNode;
}) {
  return (
    <Box
      component="section"
      aria-labelledby={`${title.toLowerCase().replaceAll(' ', '-')}-heading`}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Typography
          id={`${title.toLowerCase().replaceAll(' ', '-')}-heading`}
          component="h2"
          variant="h6"
        >
          {title}
        </Typography>
        {action ? (
          <Button href={action.to} size="small">
            {action.label}
          </Button>
        ) : null}
      </Stack>
      {children}
    </Box>
  );
}
