/**
 * Tests for ManualInputFallbackScreen — the full-screen fallback when
 * OCR can't read homework items.
 *
 * Covers:
 * - Renders with valid items param
 * - Shows parse error state when items param is invalid
 * - Text input updates answer state
 * - Submit validates at least one answer
 * - Submit navigates back to camera with results
 * - Accessibility labels on key elements
 *
 * @see ADD §4.1 — OCR fallback
 * @see ADD §4.4 — Stylus-input native support
 *
 * NOTE: Uses the module-level mock for react-i18next (returns i18n keys),
 * so tests match on i18n key strings, not translated values.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import ManualInputFallbackScreen from '../../../app/(kid)/manual-input';

// ── Mocks ──────────────────────────────────────────────────────────

const mockRouter = { push: jest.fn(), back: jest.fn() };

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: jest.fn(),
}));

// ── Helpers ────────────────────────────────────────────────────────

function mockSearchParams(params: Record<string, string>) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('expo-router').useLocalSearchParams.mockReturnValue(params);
}

const VALID_ITEMS = JSON.stringify([
  { index: 1, originalText: 'unclear text 1', confidence: 0.3 },
  { index: 2, originalText: 'unclear text 2', confidence: 0.45 },
]);

// ── Tests ──────────────────────────────────────────────────────────

describe('ManualInputFallbackScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams({
      items: VALID_ITEMS,
      capturedPageUris: JSON.stringify(['file://photo1.jpg']),
    });
  });

  // ── Rendering ──────────────────────────────────────────

  it('renders with valid items param', () => {
    render(<ManualInputFallbackScreen />);
    expect(screen.getByText('manualInputFallback.title')).toBeTruthy();
  });

  it('shows parse error state when items param is invalid', () => {
    mockSearchParams({
      items: 'invalid-json',
      capturedPageUris: '',
    });
    render(<ManualInputFallbackScreen />);

    // Parse error state shows cameraScreen.error.title
    expect(
      screen.getByText('cameraScreen.error.title'),
    ).toBeTruthy();
  });

  it('renders back button', () => {
    render(<ManualInputFallbackScreen />);
    // Back button renders as "← {t('common.back')}"
    expect(screen.getByText('← common.back')).toBeTruthy();
  });

  // ── Mode Segmented Control ─────────────────────────────

  it('renders mode segmented control with Type and Draw tabs', () => {
    render(<ManualInputFallbackScreen />);
    expect(screen.getByText('manualInputFallback.typeTab')).toBeTruthy();
    expect(screen.getByText('manualInputFallback.drawTab')).toBeTruthy();
  });

  it('shows TextInput fields in type mode', async () => {
    render(<ManualInputFallbackScreen />);
    // Type placeholders
    const placeholders = await waitFor(() =>
      screen.getAllByPlaceholderText(
        'manualInputFallback.typePlaceholder',
      ),
    );
    expect(placeholders.length).toBe(2);
  });

  // ── Submit ─────────────────────────────────────────────

  it('shows submit button with remaining count', async () => {
    render(<ManualInputFallbackScreen />);

    await waitFor(() => {
      expect(
        screen.getByText('manualInputFallback.submit (2)'),
      ).toBeTruthy();
    });
  });

  it('validates at least one answer before submitting', async () => {
    render(<ManualInputFallbackScreen />);

    const submitButton = await waitFor(() =>
      screen.getByText('manualInputFallback.submit (2)'),
    );

    await act(async () => {
      fireEvent.press(submitButton);
    });

    expect(
      screen.getByText('manualInputFallback.error.noInputs'),
    ).toBeTruthy();
  });

  it('navigates back to camera on submit when an answer is provided', async () => {
    render(<ManualInputFallbackScreen />);

    const textInputs = await waitFor(() =>
      screen.getAllByPlaceholderText(
        'manualInputFallback.typePlaceholder',
      ),
    );
    fireEvent.changeText(textInputs[0], 'my answer');

    const submitButton = await waitFor(() =>
      screen.getByText('manualInputFallback.submit (1)'),
    );

    await act(async () => {
      fireEvent.press(submitButton);
    });

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/(kid)/camera',
      params: expect.objectContaining({
        manualInputResult: expect.stringContaining('my answer'),
      }),
    });
  });

  it('includes captured page URIs when navigating back on submit', async () => {
    mockSearchParams({
      items: VALID_ITEMS,
      capturedPageUris: JSON.stringify([
        'file://photo1.jpg',
        'file://photo2.jpg',
      ]),
    });

    render(<ManualInputFallbackScreen />);

    const textInputs = await waitFor(() =>
      screen.getAllByPlaceholderText(
        'manualInputFallback.typePlaceholder',
      ),
    );
    fireEvent.changeText(textInputs[0], 'answer text');

    const submitButton = await waitFor(() =>
      screen.getByText('manualInputFallback.submit (1)'),
    );

    await act(async () => {
      fireEvent.press(submitButton);
    });

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/(kid)/camera',
      params: expect.objectContaining({
        capturedPageUris: expect.stringContaining('photo1'),
      }),
    });
  });

  // ── Navigation ────────────────────────────────────────

  it('navigates back when back button is pressed', () => {
    render(<ManualInputFallbackScreen />);
    fireEvent.press(screen.getByText('← common.back'));
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });

  // ── Accessibility ──────────────────────────────────────

  it('has accessibility label on skip buttons', () => {
    render(<ManualInputFallbackScreen />);
    const skipButtons = screen.getAllByLabelText(
      'manualInputFallback.accessibility.skip',
    );
    expect(skipButtons.length).toBe(2);
  });
});
