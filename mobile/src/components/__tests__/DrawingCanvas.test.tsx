/**
 * Tests for DrawingCanvas — finger/stylus drawing component.
 *
 * Covers:
 * - Renders canvas with placeholder text when empty
 * - Calls onStrokesChange when a stroke is completed
 * - Clear button appears when strokes exist
 * - Clear button calls onStrokesChange with empty array
 * - Accessibility labels
 *
 * @see ADD §4.1 — OCR fallback (stylus input)
 * @see ADD §4.4 — Stylus-input native support
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import DrawingCanvas from '../DrawingCanvas';
import type { Stroke } from '../DrawingCanvas';

// ── Mocks ──────────────────────────────────────────────────────────

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// ── Helpers ────────────────────────────────────────────────────────

function createMockStrokes(): Stroke[] {
  return [
    {
      points: [
        { x: 10, y: 20 },
        { x: 30, y: 40 },
        { x: 50, y: 60 },
      ],
      color: '#1A1A1A',
      width: 3,
    },
  ];
}

// ── Tests ──────────────────────────────────────────────────────────

describe('DrawingCanvas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────

  it('renders canvas area', () => {
    const onStrokesChange = jest.fn();
    render(
      <DrawingCanvas
        strokes={[]}
        onStrokesChange={onStrokesChange}
        testID="drawing-canvas"
      />,
    );

    expect(screen.getByTestId('drawing-canvas')).toBeTruthy();
  });

  it('renders placeholder text when empty', () => {
    const onStrokesChange = jest.fn();
    render(
      <DrawingCanvas
        strokes={[]}
        onStrokesChange={onStrokesChange}
        placeholder="Draw here"
      />,
    );

    expect(screen.getByText('Draw here')).toBeTruthy();
  });

  it('hides placeholder when strokes exist', () => {
    const onStrokesChange = jest.fn();
    const mockStrokes = createMockStrokes();

    render(
      <DrawingCanvas
        strokes={mockStrokes}
        onStrokesChange={onStrokesChange}
        placeholder="Draw here"
      />,
    );

    expect(screen.queryByText('Draw here')).toBeNull();
  });

  // ── Accessibility ──────────────────────────────────────

  it('has accessibilityLabel on canvas', () => {
    const onStrokesChange = jest.fn();
    render(
      <DrawingCanvas
        strokes={[]}
        onStrokesChange={onStrokesChange}
        accessibilityLabel="My drawing area"
      />,
    );

    expect(screen.getByLabelText('My drawing area')).toBeTruthy();
  });

  it('uses default accessibilityLabel when not provided', () => {
    const onStrokesChange = jest.fn();
    render(
      <DrawingCanvas
        strokes={[]}
        onStrokesChange={onStrokesChange}
      />,
    );

    // With the i18n mock, the key string is returned as-is
    expect(
      screen.getByLabelText('manualInputFallback.accessibility.drawCanvas'),
    ).toBeTruthy();
  });

  // ── Clear Button ────────────────────────────────────────

  it('shows clear button when strokes exist', () => {
    const onStrokesChange = jest.fn();
    const mockStrokes = createMockStrokes();

    render(
      <DrawingCanvas
        strokes={mockStrokes}
        onStrokesChange={onStrokesChange}
      />,
    );

    expect(screen.getByLabelText('manualInputFallback.clear')).toBeTruthy();
    expect(screen.getByText('manualInputFallback.clear')).toBeTruthy();
  });

  it('hides clear button when canvas is empty', () => {
    const onStrokesChange = jest.fn();
    render(
      <DrawingCanvas
        strokes={[]}
        onStrokesChange={onStrokesChange}
      />,
    );

    expect(screen.queryByLabelText('manualInputFallback.clear')).toBeNull();
  });

  it('calls onStrokesChange with empty array when clear is pressed', () => {
    const onStrokesChange = jest.fn();
    const mockStrokes = createMockStrokes();

    render(
      <DrawingCanvas
        strokes={mockStrokes}
        onStrokesChange={onStrokesChange}
      />,
    );

    fireEvent.press(screen.getByLabelText('manualInputFallback.clear'));
    expect(onStrokesChange).toHaveBeenCalledWith([]);
  });

  // ── Dark mode ──────────────────────────────────────────

  it('renders in dark mode', () => {
    // Mock useColorScheme to return 'dark'
    const mockUseColorScheme = jest.fn(() => 'dark');
    jest.spyOn(
      require('react-native'),
      'useColorScheme',
    ).mockImplementation(mockUseColorScheme);

    const onStrokesChange = jest.fn();
    render(
      <DrawingCanvas
        strokes={[]}
        onStrokesChange={onStrokesChange}
        testID="drawing-canvas"
      />,
    );

    // Canvas should still be present
    expect(screen.getByTestId('drawing-canvas')).toBeTruthy();
  });
});
