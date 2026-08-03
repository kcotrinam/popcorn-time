import type { SvgIconComponent } from '@mui/icons-material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CollectionsBookmarkRoundedIcon from '@mui/icons-material/CollectionsBookmarkRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';

export type Poster = {
  title: string;
  image: string;
  alt: string;
  type?: string;
  year?: string;
  status?: 'Watched' | 'Pending';
};

export type Feature = {
  title: string;
  description: string;
  icon: SvgIconComponent;
};

export const heroPosters: Poster[] = [
  { title: 'Neon Echo', image: '/posters/neon-echo.svg', alt: 'Illustrated poster for Neon Echo' },
  {
    title: 'Cyber Drift',
    image: '/posters/cyber-drift.svg',
    alt: 'Illustrated poster for Cyber Drift',
  },
  {
    title: 'The Silent Craft',
    image: '/posters/silent-craft.svg',
    alt: 'Illustrated poster for The Silent Craft',
  },
  {
    title: 'Rain Witness',
    image: '/posters/rain-witness.svg',
    alt: 'Illustrated poster for Rain Witness',
  },
  {
    title: "Aurora's Gate",
    image: '/posters/auroras-gate.svg',
    alt: "Illustrated poster for Aurora's Gate",
  },
  {
    title: 'Shadow Throne',
    image: '/posters/shadow-throne.svg',
    alt: 'Illustrated poster for Shadow Throne',
  },
];

export const features: Feature[] = [
  {
    title: 'Total organization',
    description: 'Manage your watchlist, history, and advanced filters without losing the thread.',
    icon: CollectionsBookmarkRoundedIcon,
  },
  {
    title: 'Shared plans',
    description: 'Invite your people and plan the next story to watch together.',
    icon: GroupsRoundedIcon,
  },
  {
    title: 'Private recommendations',
    description: 'Share suggestions with confidence, without intrusive algorithms.',
    icon: AutoAwesomeRoundedIcon,
  },
];

export const collectionPosters: Poster[] = [
  {
    title: 'Neon Echo',
    image: '/posters/neon-echo.svg',
    alt: 'Illustrated poster for Neon Echo',
    type: 'Drama',
    year: '2023',
    status: 'Watched',
  },
  {
    title: 'Cyber Drift',
    image: '/posters/cyber-drift.svg',
    alt: 'Illustrated poster for Cyber Drift',
    type: 'Anime',
    year: '2024',
    status: 'Pending',
  },
  {
    title: 'Crystal Abyss',
    image: '/posters/auroras-gate.svg',
    alt: 'Illustrated poster for Crystal Abyss',
    type: 'Documentary',
    year: '2022',
    status: 'Watched',
  },
  {
    title: 'A Summer in Rome',
    image: '/posters/rain-witness.svg',
    alt: 'Illustrated poster for A Summer in Rome',
    type: 'Romance',
    year: '2023',
    status: 'Pending',
  },
  {
    title: 'Shadow Throne',
    image: '/posters/shadow-throne.svg',
    alt: 'Illustrated poster for Shadow Throne',
    type: 'Series',
    year: '2024',
    status: 'Pending',
  },
];

export const footerLinks = ['Privacy', 'Terms', 'Contact', 'Blog'] as const;
