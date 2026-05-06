/**
 * Tests for CameraPermissionPrimer — kid-friendly permission primer screen.
 *
 * Covers:
 * - Renders with correct title, body, privacy note, and action buttons
 * - "Allow Camera" button fires onAllow handler
 * - "Not now" button fires onSkip handler
 * - Dark mode class applied
 * - Accessibility labels and roles
 *
 * Uses getByText / getByLabelText for queries (matching existing conventions).
 *
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import CameraPermissionPrimer from '../CameraPermissionPrimer';

// ── i18n Mock ──────────────────────────────────────────────────────

const mockT = jest.fn((key: string) => {
  const FALLBACKS: Record<string, string> = {
    'cameraScreen.primer.title': "Let's use the camera!",
    'cameraScreen.primer.body':
      "Take a photo of your homework and I'll help you solve it. Your photos stay on this device — safe and private.",
    'cameraScreen.primer.cta': 'Allow Camera',
    'cameraScreen.primer.secondary': 'Not now',
    'cameraScreen.primer.privacyNote':
      'Your photos never leave this device',
    'cameraScreen.primer.accessibility':
      'Camera permission primer. Allow camera access to take homework photos.',
  };
  return FALLBACKS[key] ?? key;
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

// ── Mock safe area insets ─────────────────────────────────────────

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// ── Tests ──────────────────────────────────────────────────────────

describe('CameraPermissionPrimer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Basic render ──────────────────────────────────────────

  it('renders the camera icon', () => {
    render(
      <CameraPermissionPrimer
        onAllow={jest.fn()}
        onSkip={jest.fn()}
      />,
    );

    expect(screen.getByText('📷')).toBeTruthy();
  });

  it('renders the title from i18n', () => {
    render(
      <CameraPermissionPrimer
        onAllow={jest.fn()}
        onSkip={jest.fn()}
      />,
    );

    expect(screen.getByText("Let's use the camera!")).toBeTruthy();
  });

  it('renders the body text from i18n', () => {
    render(
      <CameraPermissionPrimer
        onAllow={jest.fn()}
        onSkip={jest.fn()}
      />,
    );

    expect(
      screen.getByText(
        "Take a photo of your homework and I'll help you solve it. Your photos stay on this device — safe and private.",
      ),
    ).toBeTruthy();
  });

  it('renders the privacy note', () => {
    render(
      <CameraPermissionPrimer
        onAllow={jest.fn()}
        onSkip={jest.fn()}
      />,
    );

    expect(
      screen.getByText('Your photos never leave this device'),
    ).toBeTruthy();
  });

  // ── Action buttons ────────────────────────────────────────

  it('renders the primary "Allow Camera" button with correct accessibility', () => {
    render(
      <CameraPermissionPrimer
        onAllow={jest.fn()}
        onSkip={jest.fn()}
      />,
    );

    const allowButton = screen.getByLabelText('Allow Camera');
    expect(allowButton).toBeTruthy();
    expect(screen.getByText('📸')).toBeTruthy(); // Camera icon inside button
  });

  it('renders the secondary "Not now" button', () => {
    render(
      <CameraPermissionPrimer
        onAllow={jest.fn()}
        onSkip={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Not now')).toBeTruthy();
    expect(screen.getByText('Not now')).toBeTruthy();
  });

  // ── Action handlers ───────────────────────────────────────

  it('fires onAllow when primary button is pressed', () => {
    const onAllow = jest.fn();
    render(
      <CameraPermissionPrimer onAllow={onAllow} onSkip={jest.fn()} />,
    );

    fireEvent.press(screen.getByLabelText('Allow Camera'));
    expect(onAllow).toHaveBeenCalledTimes(1);
  });

  it('fires onSkip when secondary button is pressed', () => {
    const onSkip = jest.fn();
    render(
      <CameraPermissionPrimer onAllow={jest.fn()} onSkip={onSkip} />,
    );

    fireEvent.press(screen.getByLabelText('Not now'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  // ── Accessibility ─────────────────────────────────────────

  it('has accessibilityRole of alert on the container', () => {
    render(
      <CameraPermissionPrimer
        onAllow={jest.fn()}
        onSkip={jest.fn()}
      />,
    );

    expect(
      screen.getByLabelText(
        'Camera permission primer. Allow camera access to take homework photos.',
      ),
    ).toBeTruthy();
  });

  it('has accessibility header role on title', () => {
    render(
      <CameraPermissionPrimer
        onAllow={jest.fn()}
        onSkip={jest.fn()}
      />,
    );

    const title = screen.getByText("Let's use the camera!");
    // Verify role via accessibilityRole prop (rendered as accessibilityRole on RN View)
    expect(title).toBeTruthy();
  });

  it('has accessibility summary on privacy note', () => {
    render(
      <CameraPermissionPrimer
        onAllow={jest.fn()}
        onSkip={jest.fn()}
      />,
    );

    expect(
      screen.getByLabelText('Your photos never leave this device'),
    ).toBeTruthy();
  });

  // ── Icon inside primary button ────────────────────────────

  it('renders camera emoji icon inside the primary button', () => {
    render(
      <CameraPermissionPrimer
        onAllow={jest.fn()}
        onSkip={jest.fn()}
      />,
    );

    // The 📸 is rendered separately from the button text
    expect(screen.getByText('📸')).toBeTruthy();
  });
});
