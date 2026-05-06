/**
 * @tutor-sg/theme — Design tokens + ThemeProvider
 *
 * Kid-friendly React Native theme system for tutor-sg.
 * Provides color tokens, typography, spacing, borders, shadows,
 * and a React context provider for theme propagation.
 *
 * @see ADD §9 — Accessibility (high contrast, min 16pt body)
 * @see packages/theme/src/tokens/ — individual token modules
 */

// ── Theme provider & hook ──────────────────────────────────────────
export { ThemeProvider, ThemeContext } from './ThemeProvider';
export type { ThemeProviderProps } from './ThemeProvider';
export { useTheme } from './useTheme';

// ── Types ──────────────────────────────────────────────────────────
export type {
  ThemeMode,
  AppMode,
  Theme,
  ThemeContextValue,
} from './types';

// ── Design tokens ──────────────────────────────────────────────────
export {
  // Colors (full palette + kid/parent mode colors)
  palette,
  kidColors,
  parentColors,
  // Typography
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
  typography,
  // Spacing
  spacing,
  contentInset,
  touchTarget,
  // Borders
  borderRadius,
  borderWidth,
  // Shadows
  shadowLevels,
  shadows,
} from './tokens';

// ── Token types ────────────────────────────────────────────────────
export type {
  Palette,
  KidColors,
  ParentColors,
  FontSize,
  LineHeight,
  FontWeight,
  LetterSpacing,
  Typography,
  Spacing,
  ContentInset,
  TouchTarget,
  BorderRadius,
  BorderWidth,
  ShadowLevels,
  Shadows,
} from './tokens';
