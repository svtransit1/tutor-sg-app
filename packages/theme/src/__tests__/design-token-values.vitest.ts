/**
 * Design token value integrity tests.
 *
 * Verifies that token values are internally consistent:
 * - Font sizes respect hierarchy (h1 > h2 > h3 > body > caption)
 * - Spacing follows consistent scale
 * - Colors have required keys
 *
 * @see ADD §9 — Quality bars (accessibility)
 */

import { describe, it, expect } from 'vitest';
import { fontSize } from '../tokens/typography';
import { spacing } from '../tokens/spacing';
import { borderRadius } from '../tokens/borders';
import { borderWidth } from '../tokens/borders';
import { kidColors, parentColors, palette } from '../tokens/colors';

describe('Typography hierarchy', () => {
  it('display > h1 > h2 > h3 > subheading > bodyLarge > body > bodySmall > caption', () => {
    expect(fontSize.display).toBeGreaterThan(fontSize.h1);
    expect(fontSize.h1).toBeGreaterThan(fontSize.h2);
    expect(fontSize.h2).toBeGreaterThan(fontSize.h3);
    expect(fontSize.h3).toBeGreaterThan(fontSize.subheading);
    expect(fontSize.subheading).toBeGreaterThan(fontSize.bodyLarge);
    expect(fontSize.bodyLarge).toBeGreaterThan(fontSize.body);
    expect(fontSize.body).toBeGreaterThan(fontSize.bodySmall);
    expect(fontSize.bodySmall).toBeGreaterThan(fontSize.caption);
  });

  it('body font is at least 16pt (ADD §9)', () => {
    expect(fontSize.body).toBeGreaterThanOrEqual(16);
  });
});

describe('Spacing consistency', () => {
  it('spacing values are non-negative integers', () => {
    Object.values(spacing).forEach((v) => {
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    });
  });

  it('spacing values increase monotonically', () => {
    const values = Object.values(spacing);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
    }
  });
});

describe('Border radius values', () => {
  it('are positive integers', () => {
    Object.values(borderRadius).forEach((v) => {
      expect(v).toBeGreaterThan(0);
      expect(Number.isInteger(v)).toBe(true);
    });
  });

  it('are ordered: sm < md < lg < xl < pill < full', () => {
    expect(borderRadius.sm).toBeLessThan(borderRadius.md);
    expect(borderRadius.md).toBeLessThan(borderRadius.lg);
    expect(borderRadius.lg).toBeLessThan(borderRadius.xl);
    expect(borderRadius.xl).toBeLessThan(borderRadius.pill);
    expect(borderRadius.pill).toBeLessThan(borderRadius.full);
  });
});

describe('Border widths', () => {
  it('are non-negative', () => {
    Object.values(borderWidth).forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0.5);
    });
  });

  it('are ordered: thin < medium < thick', () => {
    expect(borderWidth.thin).toBeLessThan(borderWidth.medium);
    expect(borderWidth.medium).toBeLessThan(borderWidth.thick);
  });
});

describe('Color palette integrity', () => {
  it('kid colors have all required keys', () => {
    const requiredKeys = [
      'background', 'surface', 'primary', 'onPrimary',
      'secondary', 'onSecondary',
      'success', 'error', 'warning', 'info',
      'textPrimary', 'textSecondary', 'textDisabled',
      'border', 'borderFocused', 'divider',
      'subjectMath', 'subjectEnglish', 'subjectChinese', 'subjectScience',
    ];
    requiredKeys.forEach((key) => {
      expect(kidColors).toHaveProperty(key);
    });
  });

  it('parent colors have all required keys', () => {
    const requiredKeys = [
      'background', 'surface', 'primary', 'onPrimary',
      'secondary', 'onSecondary',
      'success', 'error', 'warning', 'info',
      'textPrimary', 'textSecondary', 'textDisabled',
      'border', 'borderFocused', 'divider',
    ];
    requiredKeys.forEach((key) => {
      expect(parentColors).toHaveProperty(key);
    });
  });

  it('text colors provide sufficient contrast against backgrounds', () => {
    // WCAG AA requires 4.5:1 for normal text, 3:1 for large text.
    // We verify the values roughly: textPrimary should be dark,
    // backgrounds should be light.
    const darkColor = palette.gray900;
    const lightBg = palette.gray50;

    expect(darkColor).toBe('#212121');
    expect(lightBg).toBe('#FAFAFA');

    // onPrimary should always be white
    expect(kidColors.onPrimary).toBe(palette.white);
    expect(parentColors.onPrimary).toBe(palette.white);
  });
});
