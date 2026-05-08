/**
 * Border & border-radius design tokens for tutor-sg.
 *
 * Kid-friendly: generous rounding (soft, approachable).
 * No sharp corners in kid-facing UI.
 */

import { Platform } from 'react-native';

export const borderRadius = {
  /** 4px — subtle rounding, for small elements */
  sm: 4,
  /** 8px — default rounding for cards, inputs */
  md: 8,
  /** 12px — generous rounding for buttons, modals */
  lg: 12,
  /** 16px — extra rounding for dialogs */
  xl: 16,
  /** 24px — pill shape */
  pill: 24,
  /** 9999px — full round (circles, avatars) */
  full: 9999,
} as const;

export type BorderRadius = typeof borderRadius;

export const borderWidth = {
  /** Hairline — 0.5px (or 1px on Android) */
  hairline: Platform.select({ ios: 0.5, default: 1 }) as number,
  /** Thin — 1px */
  thin: 1,
  /** Medium — 2px */
  medium: 2,
  /** Thick — 3px (focus ring) */
  thick: 3,
} as const;

export type BorderWidth = typeof borderWidth;
