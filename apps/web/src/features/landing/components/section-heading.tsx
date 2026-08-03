import { Stack, Typography } from '@mui/material';
type SectionHeadingProps = { title: string; subtitle: string; align?: 'left' | 'center' };
export function SectionHeading({ title, subtitle, align = 'center' }: SectionHeadingProps) {
  return (
    <Stack
      spacing={1.25}
      textAlign={align}
      alignItems={align === 'center' ? 'center' : 'flex-start'}
    >
      <Typography component="h2" variant="h4" fontWeight={750}>
        {title}
      </Typography>
      <Typography color="text.secondary" maxWidth={560}>
        {subtitle}
      </Typography>
    </Stack>
  );
}
