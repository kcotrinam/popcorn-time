import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  CssBaseline,
  ThemeProvider as MuiThemeProvider,
  createTheme,
  useMediaQuery,
} from '@mui/material';
export type ThemeMode = 'light' | 'dark' | 'system';
type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedMode: 'light' | 'dark';
};
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const key = 'popcorn-time-theme-mode';

const quietScreeningRoom = {
  background: '#0f1412',
  surface: '#1c211e',
  surfaceHigh: '#262b29',
  onSurface: '#dfe4e0',
  onSurfaceVariant: '#bbcabf',
  outline: '#86948a',
  outlineVariant: '#3c4a42',
  mint: '#4edea3',
  mintHover: '#6ffbbe',
  mintPressed: '#20bd80',
  onMint: '#003824',
  success: '#67d99a',
  onSuccess: '#063d25',
  warning: '#f0bd68',
  onWarning: '#3a2600',
  info: '#91bac5',
  onInfo: '#0a343e',
  error: '#ffb4ab',
  onError: '#690005',
} as const;

const daylightScreeningRoom = {
  background: '#edf3ee',
  surface: '#f8fbf8',
  surfaceHigh: '#e1ebe3',
  onSurface: '#18201c',
  onSurfaceVariant: '#425047',
  outline: '#65736a',
  outlineVariant: '#b9c7bd',
  primary: '#006c43',
  primaryLight: '#3d956a',
  primaryDark: '#004c2d',
  onPrimary: '#ffffff',
  success: '#167a45',
  onSuccess: '#ffffff',
  warning: '#8a5a00',
  onWarning: '#ffffff',
  info: '#276b7a',
  onInfo: '#ffffff',
  error: '#ba1a1a',
  onError: '#ffffff',
} as const;

function createAppTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark';
  const colors = isDark ? quietScreeningRoom : daylightScreeningRoom;
  const primary = isDark
    ? {
        main: quietScreeningRoom.mint,
        light: quietScreeningRoom.mintHover,
        dark: quietScreeningRoom.mintPressed,
        contrastText: quietScreeningRoom.onMint,
      }
    : {
        main: daylightScreeningRoom.primary,
        light: daylightScreeningRoom.primaryLight,
        dark: daylightScreeningRoom.primaryDark,
        contrastText: daylightScreeningRoom.onPrimary,
      };
  return createTheme({
    palette: {
      mode,
      primary,
      secondary: { main: colors.success, contrastText: colors.onSuccess },
      success: { main: colors.success, contrastText: colors.onSuccess },
      warning: { main: colors.warning, contrastText: colors.onWarning },
      info: { main: colors.info, contrastText: colors.onInfo },
      error: {
        main: colors.error,
        contrastText: colors.onError,
      },
      background: { default: colors.background, paper: colors.surface },
      text: { primary: colors.onSurface, secondary: colors.onSurfaceVariant },
      divider: colors.outlineVariant,
      action: {
        active: colors.outline,
        hover: isDark ? 'rgba(223, 228, 224, 0.08)' : 'rgba(0, 76, 45, 0.06)',
        selected: isDark ? 'rgba(78, 222, 163, 0.16)' : 'rgba(0, 108, 67, 0.12)',
        focus: isDark ? 'rgba(78, 222, 163, 0.2)' : 'rgba(0, 108, 67, 0.16)',
        disabled: isDark ? '#7b8780' : '#78857c',
        disabledBackground: isDark ? '#303a34' : '#d9e3db',
      },
    },
    typography: {
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h4: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.01em' },
      h5: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.33 },
      body1: { fontSize: '1rem', lineHeight: 1.5 },
      body2: { fontSize: '0.875rem', lineHeight: 1.43 },
      button: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.43,
        letterSpacing: '0.01em',
        textTransform: 'none',
      },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: colors.background,
            colorScheme: mode,
            '&::selection': {
              backgroundColor: isDark ? 'rgba(78, 222, 163, 0.35)' : 'rgba(0, 108, 67, 0.22)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: colors.outlineVariant,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${colors.outlineVariant}`,
            boxShadow: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          containedPrimary: { '&:hover': { backgroundColor: primary.light } },
          root: {
            '&.Mui-focusVisible': {
              outline: `2px solid ${colors.outline}`,
              outlineOffset: 3,
            },
          },
        },
      },
    },
  });
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(
    () => (localStorage.getItem(key) as ThemeMode) || 'system',
  );
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)');
  const resolvedMode = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;
  const setMode = (next: ThemeMode) => {
    localStorage.setItem(key, next);
    setModeState(next);
  };
  const theme = useMemo(() => createAppTheme(resolvedMode), [resolvedMode]);
  return (
    <ThemeContext.Provider value={{ mode, setMode, resolvedMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
export function useThemeMode() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useThemeMode must be used within AppThemeProvider');
  return value;
}
