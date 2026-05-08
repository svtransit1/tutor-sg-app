/**
 * Typography design tokens for tutor-sg.
 *
 * Kid-first: minimum 17pt body (exceeds ADD §9 requirement of 16pt).
 * Uses system fonts (SF Pro on iOS, Roboto on Android) — no custom fonts in v1.
 *
 * Font scale based on 1.25 ratio (Major Third) with manual adjustments
 * for kid-readability.
 */

import { Platform, TextStyle } from 'react-native';

// ── Font family (system) ──────────────────────────────────────────

const fontFamily = Platform.select({
  ios: 'SF Pro',
  android: 'Roboto',
  default: 'System',
});

const fontFamilyMono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

// ── Font sizes ────────────────────────────────────────────────────

export const fontSize = {
  /** Caption / label — 13pt, use sparingly, only for non-critical info */
  caption: 13,
  /** Body small — 15pt, secondary info, metadata */
  bodySmall: 15,
  /** Body — 17pt, primary reading text (ADD §9 minimum 16pt, we exceed) */
  body: 17,
  /** Body large — 19pt, emphasis */
  bodyLarge: 19,
  /** Subheading — 21pt */
  subheading: 21,
  /** Heading 3 — 24pt */
  h3: 24,
  /** Heading 2 — 28pt */
  h2: 28,
  /** Heading 1 — 34pt */
  h1: 34,
  /** Display — 40pt, hero / splash */
  display: 40,
} as const;

export type FontSize = typeof fontSize;

// ── Line heights ───────────────────────────────────────────────────

export const lineHeight = {
  /** Tight — for headings, keeps compact */
  tight: 1.15,
  /** Normal — body text */
  normal: 1.4,
  /** Relaxed — long-form reading */
  relaxed: 1.6,
} as const;

export type LineHeight = typeof lineHeight;

// ── Font weights ───────────────────────────────────────────────────

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export type FontWeight = typeof fontWeight;

// ── Letter spacing ─────────────────────────────────────────────────

export const letterSpacing = {
  tight: -0.3,
  normal: 0,
  wide: 0.5,
} as const;

export type LetterSpacing = typeof letterSpacing;

// ── Typography presets (composable style objects) ──────────────────

function typographyPreset(
  size: number,
  weight: TextStyle['fontWeight'],
  lh: number,
  ls: number,
): TextStyle {
  return {
    fontFamily,
    fontSize: size,
    fontWeight: weight,
    lineHeight: Math.round(size * lh),
    letterSpacing: ls,
  };
}

export const typography = {
  display: typographyPreset(fontSize.display, fontWeight.bold, lineHeight.tight, letterSpacing.tight),
  h1: typographyPreset(fontSize.h1, fontWeight.bold, lineHeight.tight, letterSpacing.tight),
  h2: typographyPreset(fontSize.h2, fontWeight.bold, lineHeight.tight, letterSpacing.tight),
  h3: typographyPreset(fontSize.h3, fontWeight.semibold, lineHeight.tight, letterSpacing.normal),
  subheading: typographyPreset(fontSize.subheading, fontWeight.semibold, lineHeight.normal, letterSpacing.normal),
  bodyLarge: typographyPreset(fontSize.bodyLarge, fontWeight.regular, lineHeight.relaxed, letterSpacing.normal),
  body: typographyPreset(fontSize.body, fontWeight.regular, lineHeight.relaxed, letterSpacing.normal),
  bodySmall: typographyPreset(fontSize.bodySmall, fontWeight.regular, lineHeight.relaxed, letterSpacing.wide),
  caption: typographyPreset(fontSize.caption, fontWeight.medium, lineHeight.normal, letterSpacing.wide),
  /** Button text — slightly more weight */
  button: typographyPreset(fontSize.body, fontWeight.semibold, lineHeight.normal, letterSpacing.wide),
  /** Label — small, uppercase */
  label: {
    ...typographyPreset(fontSize.caption, fontWeight.semibold, lineHeight.normal, letterSpacing.wide),
    textTransform: 'uppercase' as const,
  },
  /** Mono — for code blocks, math expressions */
  mono: {
    fontFamily: fontFamilyMono,
    fontSize: fontSize.body,
    lineHeight: Math.round(fontSize.body * lineHeight.relaxed),
  } as TextStyle,
} as const;

export type Typography = typeof typography;
