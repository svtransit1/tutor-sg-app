/**
 * Theme types for tutor-sg.
 *
 * Defines `ThemeMode` (kid / parent) and the full `Theme` shape
 * that flows through the React context.
 */

import type {
  KidColors,
  ParentColors,
  Typography,
  Spacing,
  ContentInset,
  TouchTarget,
  BorderRadius,
  BorderWidth,
  Shadows,
} from './tokens';

/** Which UI mode is active — kid-facing or parent-facing dashboard */
export type ThemeMode = 'kid' | 'parent';

/**
 * App mode selector — determines which color palette is used.
 * Extended in the future for dark mode, high-contrast mode, etc.
 */
export type AppMode = ThemeMode | 'dark';

/**
 * The complete theme object provided via React context.
 * Components access any part of this tree via `useTheme()`.
 */
export interface Theme {
  /** UI mode — determines which color set is active */
  mode: ThemeMode;

  /** Color palette for the current mode */
  colors: KidColors | ParentColors;

  /** Typography presets (fontSize, weights, lineHeight, style presets) */
  typography: Typography;

  /** Spacing scale (8-pt grid + micro step) */
  spacing: Spacing;

  /** Content inset presets */
  contentInset: ContentInset;

  /** Minimum touch target sizes */
  touchTarget: TouchTarget;

  /** Border radius scale */
  borderRadius: BorderRadius;

  /** Border width scale */
  borderWidth: BorderWidth;

  /** Shadow presets (platform-aware) */
  shadows: Shadows;
}

/**
 * Shape of the ThemeContext value.
 * Exposes the active theme + a setter to change mode.
 */
export interface ThemeContextValue {
  theme: Theme;
  setMode: (mode: ThemeMode) => void;
  mode: ThemeMode;
}
