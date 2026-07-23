import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import { Button, Stack } from '@mui/material';

type AuthActionsProps = {
  emailLabel: string;
  onEmail: () => void;
};

export function AuthActions({ emailLabel, onEmail }: AuthActionsProps) {
  return (
    <Stack spacing={3}>
      <Button
        variant="outlined"
        startIcon={<MailOutlineRoundedIcon aria-hidden="true" />}
        onClick={onEmail}
        sx={{
          minHeight: 48,
          bgcolor: '#181d1b',
          borderColor: 'primary.main',
          '&:hover': { bgcolor: '#1c211e', borderColor: 'primary.main' },
        }}
      >
        {emailLabel}
      </Button>
    </Stack>
  );
}
