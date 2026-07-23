import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CssBaseline, ThemeProvider as MuiThemeProvider, createTheme, useMediaQuery } from '@mui/material';
export type ThemeMode = 'light' | 'dark' | 'system';
type ThemeContextValue = { mode: ThemeMode; setMode: (mode: ThemeMode) => void; resolvedMode: 'light' | 'dark' };
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const key = 'popcorn-time-theme-mode';
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => (localStorage.getItem(key) as ThemeMode) || 'system');
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)'); const resolvedMode = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;
  const setMode = (next: ThemeMode) => { localStorage.setItem(key, next); setModeState(next); };
  const theme = useMemo(() => createTheme({ palette: { mode: resolvedMode } }), [resolvedMode]);
  return <ThemeContext.Provider value={{ mode, setMode, resolvedMode }}><MuiThemeProvider theme={theme}><CssBaseline />{children}</MuiThemeProvider></ThemeContext.Provider>;
}
export function useThemeMode() { const value = useContext(ThemeContext); if (!value) throw new Error('useThemeMode must be used within AppThemeProvider'); return value; }
