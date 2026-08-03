import { Box } from '@mui/material';
import type { CatalogCard as CatalogCardModel, LibraryMembership } from '@popcorn-time/shared';
import { CatalogCard } from './catalog-card';

export function CatalogGrid({
  items,
  memberships,
}: {
  items: CatalogCardModel[];
  memberships?: ReadonlyMap<string, LibraryMembership>;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          sm: 'repeat(3, minmax(0, 1fr))',
          md: 'repeat(4, minmax(0, 1fr))',
          lg: 'repeat(5, minmax(0, 1fr))',
        },
        gap: { xs: 1.25, md: 2 },
      }}
    >
      {items.map((item) => (
        <CatalogCard
          key={`${item.mediaType}-${item.externalId}`}
          item={item}
          membership={memberships?.get(`${item.mediaType}:${item.externalId}`)}
        />
      ))}
    </Box>
  );
}
