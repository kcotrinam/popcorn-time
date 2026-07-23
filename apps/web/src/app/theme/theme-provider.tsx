import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CssBaseline, ThemeProvider as MuiThemeProvider, createTheme, useMediaQuery } from '@mui/material';
export type ThemeMode = 'light' | 'dark' | 'system';
type ThemeContextValue = { mode: ThemeMode; setMode: (mode: ThemeMode) => void; resolvedMode: 'light' | 'dark' };
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const key = 'popcorn-time-theme-mode';

const emeraldNocturne = {
  background: '#0f1412',
  surface: '#1c211e',
  surfaceHigh: '#262b29',
  onSurface: '#dfe4e0',
  onSurfaceVariant: '#bbcabf',
  outline: '#86948a',
  outlineVariant: '#3c4a42',
  primary: '#4edea3',
  onPrimary: '#003824',
  secondary: '#4de082',
  onSecondary: '#003919',
  error: '#ffb4ab',
  onError: '#690005',
} as const;

function createAppTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: { main: emeraldNocturne.primary, contrastText: emeraldNocturne.onPrimary },
      secondary: { main: emeraldNocturne.secondary, contrastText: emeraldNocturne.onSecondary },
      error: { main: isDark ? emeraldNocturne.error : '#ba1a1a', contrastText: isDark ? emeraldNocturne.onError : '#ffffff' },
      background: isDark
        ? { default: emeraldNocturne.background, paper: emeraldNocturne.surface }
        : { default: emeraldNocturne.onSurface, paper: '#f5f8f5' },
      text: isDark
        ? { primary: emeraldNocturne.onSurface, secondary: emeraldNocturne.onSurfaceVariant }
        : { primary: '#18201c', secondary: '#425047' },
      divider: isDark ? emeraldNocturne.outlineVariant : '#b9c7bd',
      action: { hover: isDark ? 'rgba(223, 228, 224, 0.08)' : 'rgba(0, 56, 36, 0.06)' },
    },
    typography: {
      fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h4: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.01em' },
      h5: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.33 },
      body1: { fontSize: '1rem', lineHeight: 1.5 },
      body2: { fontSize: '0.875rem', lineHeight: 1.43 },
      button: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.43, letterSpacing: '0.01em', textTransform: 'none' },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCssBaseline: { styleOverrides: { body: { backgroundColor: isDark ? emeraldNocturne.background : emeraldNocturne.onSurface } } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none', border: `1px solid ${isDark ? emeraldNocturne.outlineVariant : '#b9c7bd'}`, boxShadow: 'none' } } },
      MuiButton: { styleOverrides: { containedPrimary: { '&:hover': { backgroundColor: '#6ffbbe' } } } },
    },
  });
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => (localStorage.getItem(key) as ThemeMode) || 'system');
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)'); const resolvedMode = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;
  const setMode = (next: ThemeMode) => { localStorage.setItem(key, next); setModeState(next); };
  const theme = useMemo(() => createAppTheme(resolvedMode), [resolvedMode]);
  return <ThemeContext.Provider value={{ mode, setMode, resolvedMode }}><MuiThemeProvider theme={theme}><CssBaseline />{children}</MuiThemeProvider></ThemeContext.Provider>;
}
export function useThemeMode() { const value = useContext(ThemeContext); if (!value) throw new Error('useThemeMode must be used within AppThemeProvider'); return value; }
