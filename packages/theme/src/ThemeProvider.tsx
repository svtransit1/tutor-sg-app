/**
 * ThemeProvider — React context provider for the tutor-sg design token system.
 *
 * Wraps the entire app (or individual mode-switchable sections) with
 * the full theme object. Supports kid mode (vibrant, playful) and
 * parent mode (professional, calm).
 *
 * Usage:
 * ```tsx
 * <ThemeProvider initialMode="kid">
 *   <App />
 * </ThemeProvider>
 * ```
 *
 * Inside any component:
 * ```tsx
 * const { theme, setMode } = useTheme();
 * const style = { color: theme.colors.textPrimary, fontSize: theme.typography.body.fontSize };
 * ```
 *
 * @see ADD §9 — Accessibility, kid-friendly font sizes
 */

import React, { createContext, useState, useMemo, useCallback } from 'react';
import type { ThemeMode, Theme, ThemeContextValue } from './types';
import { kidColors, parentColors } from './tokens/colors';
import { typography } from './tokens/typography';
import { spacing, contentInset, touchTarget } from './tokens/spacing';
import { borderRadius, borderWidth } from './tokens/borders';
import { shadows } from './tokens/shadows';

// ── Context ───────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ── Theme factory ──────────────────────────────────────────────────

function buildTheme(mode: ThemeMode): Theme {
  return {
    mode,
    colors: mode === 'kid' ? kidColors : parentColors,
    typography,
    spacing,
    contentInset,
    touchTarget,
    borderRadius,
    borderWidth,
    shadows,
  };
}

// ── Props ──────────────────────────────────────────────────────────

interface ThemeProviderProps {
  /** Initial UI mode — defaults to 'kid' */
  initialMode?: ThemeMode;
  /** Children to wrap with theme context */
  children: React.ReactNode;
}

// ── Provider ───────────────────────────────────────────────────────

export function ThemeProvider({
  initialMode = 'kid',
  children,
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  const theme = useMemo(() => buildTheme(mode), [mode]);

  const handleSetMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setMode: handleSetMode, mode }),
    [theme, handleSetMode, mode],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export { ThemeContext };
export type { ThemeProviderProps };
