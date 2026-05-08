/**
 * Tests for @tutor-sg/theme — ThemeProvider + design tokens.
 *
 * Uses React Test Renderer for component rendering (avoids @testing-library/react-native
 * peer dep conflict with react-test-renderer).
 *
 * @see ADD §9 — Quality bars
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import TestRenderer from 'react-test-renderer';
import { Text, View } from 'react-native';

import { ThemeProvider } from '../ThemeProvider';
import { useTheme } from '../useTheme';
import { kidColors, parentColors } from '../tokens/colors';
import { fontSize } from '../tokens/typography';
import { spacing } from '../tokens/spacing';
import { borderRadius } from '../tokens/borders';
import { touchTarget } from '../tokens/spacing';
import type { Theme } from '../types';

// ── Helper component that reads theme context ─────────────────────

function ThemeReader({ onTheme }: { onTheme: (t: Theme) => void }) {
  const { theme, mode } = useTheme();
  onTheme(theme);
  return (
    <View>
      <Text>{mode}</Text>
    </View>
  );
}

// ── Clean render helper ────────────────────────────────────────────

function renderWithTheme(ui: React.ReactElement, initialMode?: 'kid' | 'parent') {
  const captured: { theme: Theme | null } = { theme: null };
  const element = (
    <ThemeProvider initialMode={initialMode}>
      <ThemeReader onTheme={(t) => { captured.theme = t; }} />
    </ThemeProvider>
  );
  const renderer = TestRenderer.create(element);
  return { ...captured, renderer };
}

// ── Tests ──────────────────────────────────────────────────────────

describe('ThemeProvider', () => {
  it('renders children', () => {
    const renderer = TestRenderer.create(
      <ThemeProvider>
        <Text>Hello Theme</Text>
      </ThemeProvider>,
    );
    expect(renderer.root.findByType(Text).props.children).toBe('Hello Theme');
  });

  it('defaults to kid mode', () => {
    const { theme } = renderWithTheme(<View />);
    expect(theme).not.toBeNull();
    expect(theme!.mode).toBe('kid');
  });

  it('provides kid colors in kid mode', () => {
    const { theme } = renderWithTheme(<View />, 'kid');
    expect(theme!.colors).toBe(kidColors);
    expect(theme!.colors.textPrimary).toBe(kidColors.textPrimary);
    expect(theme!.colors.primary).toBe(kidColors.primary);
    expect(theme!.colors.subjectMath).toBeDefined();
  });

  it('provides parent colors in parent mode', () => {
    const { theme } = renderWithTheme(<View />, 'parent');
    expect(theme!.colors).toBe(parentColors);
    expect(theme!.colors.textPrimary).toBe(parentColors.textPrimary);
    expect(theme!.colors.primary).toBe(parentColors.primary);
  });
});

describe('useTheme', () => {
  it('throws when used outside ThemeProvider', () => {
    // Suppress console.error for the expected error boundary
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      TestRenderer.create(<ThemeReader onTheme={() => {}} />);
    }).toThrow('useTheme');

    spy.mockRestore();
  });
});

// ── Design token integrity ─────────────────────────────────────────

describe('Design tokens — ADD §9 compliance', () => {
  it('body font size meets minimum 16pt requirement', () => {
    expect(fontSize.body).toBeGreaterThanOrEqual(16);
  });

  it('kid mode has subject accent colors', () => {
    expect(kidColors.subjectMath).toBeDefined();
    expect(kidColors.subjectEnglish).toBeDefined();
    expect(kidColors.subjectChinese).toBeDefined();
    expect(kidColors.subjectScience).toBeDefined();
  });

  it('touch targets meet minimum 44pt', () => {
    expect(touchTarget.minimum).toBeGreaterThanOrEqual(44);
    expect(touchTarget.icon).toBeGreaterThanOrEqual(44);
  });

  it('spacing follows consistent subgrid', () => {
    // All spacing values should be integers (whole DP values)
    // and follow a roughly increasing sequence
    const values = Object.values(spacing);
    values.forEach((v) => {
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    });
    // Check that most values are multiples of 2
    const multiplesOf2 = values.filter((v) => v % 2 === 0);
    expect(multiplesOf2.length).toBeGreaterThanOrEqual(values.length - 1);
  });

  it('border radius values are non-negative integers', () => {
    Object.values(borderRadius).forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(v)).toBe(true);
    });
  });

  it('parent mode does not include subject colors', () => {
    const pColors = parentColors as Record<string, unknown>;
    expect(pColors.subjectMath).toBeUndefined();
  });
});
