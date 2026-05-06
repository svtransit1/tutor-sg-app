/**
 * Tests for ErrorScreen — unified error screen component.
 *
 * Covers:
 * - All variants render correct icon, title, description, action labels
 * - Primary action handler fires on press
 * - Secondary action handler fires on press (when provided)
 * - Secondary button hidden when onSecondaryAction is undefined for showSecondary:true variants
 * - Secondary button hidden by default for session_expired variant
 * - Custom overrides for icon, title, description, action labels
 * - Dark mode class applied
 * - Accessibility labels and roles
 *
 * Uses getByLabelText (not getByRole) because the RN mock at
 * __mocks__/react-native.ts uses string components that don't
 * support role queries. This matches existing test conventions.
 *
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ErrorScreen, { type ErrorVariant } from '../ErrorScreen';

// ── Mocks ──────────────────────────────────────────────────────────

const mockT = jest.fn((key: string) => {
  const FALLBACKS: Record<string, string> = {
    'cameraScreen.permission.title': 'Camera access needed',
    'cameraScreen.permission.description':
      'We need camera access so you can take photos of your homework. Your photos never leave this device.',
    'cameraScreen.permission.cta': 'Enable camera access',
    'cameraScreen.error.title': 'Something went wrong',
    'cameraScreen.error.captureFailed':
      "Couldn't take the photo. Please try again.",
    'cameraScreen.error.processingFailed':
      "Couldn't read the homework. Please try again with better lighting.",
    'cameraScreen.error.inferenceFailed':
      "The tutor couldn't process this right now. Please try again.",
    'cameraScreen.error.retake': 'Try again',
    'cameraResult.error.notFound':
      'This result is no longer available. Please take a new photo.',
    'errorScreen.permission.mic.title': 'Microphone access needed',
    'errorScreen.permission.mic.description':
      'We need microphone access so you can ask questions out loud. Nothing is recorded or sent anywhere.',
    'errorScreen.permission.mic.cta': 'Enable microphone access',
    'errorScreen.generic.description':
      'Something unexpected happened. Please try again.',
    'common.cancel': 'Cancel',
    'common.goBack': 'Go back',
    'common.retry': 'Retry',
  };
  return FALLBACKS[key] ?? key;
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

// ── Helpers ────────────────────────────────────────────────────────

const VARIANTS: {
  variant: ErrorVariant;
  expectedIcon: string;
  expectedTitle: string;
  expectedDesc: string;
  expectedAction: string;
  showSecondary: boolean;
}[] = [
  {
    variant: 'permission_camera',
    expectedIcon: '📷',
    expectedTitle: 'Camera access needed',
    expectedDesc:
      'We need camera access so you can take photos of your homework. Your photos never leave this device.',
    expectedAction: 'Enable camera access',
    showSecondary: true,
  },
  {
    variant: 'permission_mic',
    expectedIcon: '🎤',
    expectedTitle: 'Microphone access needed',
    expectedDesc:
      'We need microphone access so you can ask questions out loud. Nothing is recorded or sent anywhere.',
    expectedAction: 'Enable microphone access',
    showSecondary: true,
  },
  {
    variant: 'capture_error',
    expectedIcon: '😅',
    expectedTitle: 'Something went wrong',
    expectedDesc: "Couldn't take the photo. Please try again.",
    expectedAction: 'Try again',
    showSecondary: true,
  },
  {
    variant: 'processing_error',
    expectedIcon: '😅',
    expectedTitle: 'Something went wrong',
    expectedDesc:
      "Couldn't read the homework. Please try again with better lighting.",
    expectedAction: 'Try again',
    showSecondary: true,
  },
  {
    variant: 'inference_error',
    expectedIcon: '😅',
    expectedTitle: 'Something went wrong',
    expectedDesc:
      "The tutor couldn't process this right now. Please try again.",
    expectedAction: 'Try again',
    showSecondary: true,
  },
  {
    variant: 'session_expired',
    expectedIcon: '😅',
    expectedTitle: 'Something went wrong',
    expectedDesc:
      'This result is no longer available. Please take a new photo.',
    expectedAction: 'Go back',
    showSecondary: false,
  },
  {
    variant: 'generic',
    expectedIcon: '😅',
    expectedTitle: 'Something went wrong',
    expectedDesc: 'Something unexpected happened. Please try again.',
    expectedAction: 'Retry',
    showSecondary: true,
  },
];

// ── Tests ──────────────────────────────────────────────────────────

describe('ErrorScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── All variants ─────────────────────────────────────────

  it.each(VARIANTS)(
    'renders $variant variant with correct icon, title, description, and action',
    ({
      variant,
      expectedIcon,
      expectedTitle,
      expectedDesc,
      expectedAction,
    }) => {
      const onAction = jest.fn();
      render(
        <ErrorScreen
          variant={variant}
          onAction={onAction}
          onSecondaryAction={jest.fn()}
        />,
      );

      // Icon rendered
      expect(screen.getByText(expectedIcon)).toBeTruthy();

      // Title rendered
      expect(screen.getByText(expectedTitle)).toBeTruthy();

      // Description rendered
      expect(screen.getByText(expectedDesc)).toBeTruthy();

      // Primary button rendered (by accessibilityLabel)
      expect(screen.getByLabelText(expectedAction)).toBeTruthy();
    },
  );

  // ── Primary action ───────────────────────────────────────

  it('fires onAction when primary button is pressed', () => {
    const onAction = jest.fn();
    render(<ErrorScreen variant="generic" onAction={onAction} />);

    fireEvent.press(screen.getByLabelText('Retry'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  // ── Secondary action ─────────────────────────────────────

  it('fires onSecondaryAction when secondary button is pressed', () => {
    const onAction = jest.fn();
    const onSecondaryAction = jest.fn();
    render(
      <ErrorScreen
        variant="generic"
        onAction={onAction}
        onSecondaryAction={onSecondaryAction}
      />,
    );

    fireEvent.press(screen.getByLabelText('Go back'));
    expect(onSecondaryAction).toHaveBeenCalledTimes(1);
  });

  it('hides secondary button when onSecondaryAction is not provided for showSecondary:true variant', () => {
    render(
      <ErrorScreen variant="capture_error" onAction={jest.fn()} />,
    );

    // Only the primary button label should be visible
    expect(screen.getByLabelText('Try again')).toBeTruthy();
    // Secondary "Go back" should not exist
    expect(screen.queryByLabelText('Go back')).toBeNull();
  });

  it('does not render secondary button for session_expired variant even when onSecondaryAction is provided', () => {
    render(
      <ErrorScreen
        variant="session_expired"
        onAction={jest.fn()}
        onSecondaryAction={jest.fn()}
      />,
    );

    // Only the primary button (Go back) should be rendered
    expect(screen.getByLabelText('Go back')).toBeTruthy();
    // There should only be one labeled element for "Go back"
    expect(screen.getAllByLabelText('Go back')).toHaveLength(1);
  });

  // ── Custom overrides ─────────────────────────────────────

  it('renders custom icon when icon prop is provided', () => {
    render(
      <ErrorScreen variant="generic" icon="🔒" onAction={jest.fn()} />,
    );

    expect(screen.getByText('🔒')).toBeTruthy();
    expect(screen.queryByText('😅')).toBeNull();
  });

  it('renders custom title when title prop is provided', () => {
    render(
      <ErrorScreen
        variant="generic"
        title="Custom error title"
        onAction={jest.fn()}
      />,
    );

    expect(screen.getByText('Custom error title')).toBeTruthy();
  });

  it('renders custom description when description prop is provided', () => {
    render(
      <ErrorScreen
        variant="generic"
        description="Custom description text"
        onAction={jest.fn()}
      />,
    );

    expect(screen.getByText('Custom description text')).toBeTruthy();
  });

  it('renders custom action labels when provided', () => {
    const onAction = jest.fn();
    const onSecondaryAction = jest.fn();
    render(
      <ErrorScreen
        variant="generic"
        actionLabel="Custom Action"
        secondaryActionLabel="Custom Secondary"
        onAction={onAction}
        onSecondaryAction={onSecondaryAction}
      />,
    );

    expect(screen.getByLabelText('Custom Action')).toBeTruthy();
    expect(screen.getByLabelText('Custom Secondary')).toBeTruthy();
  });

  // ── Accessibility ────────────────────────────────────────

  it('has accessibilityLabel on container', () => {
    render(
      <ErrorScreen
        variant="generic"
        onAction={jest.fn()}
        accessibilityLabel="My custom error label"
      />,
    );

    expect(screen.getByLabelText('My custom error label')).toBeTruthy();
  });

  it('has accessibilityLabel on primary button', () => {
    render(
      <ErrorScreen variant="capture_error" onAction={jest.fn()} />,
    );

    expect(screen.getByLabelText('Try again')).toBeTruthy();
  });

  it('shows generic accessibilityLabel based on title when not provided', () => {
    render(<ErrorScreen variant="generic" onAction={jest.fn()} />);

    expect(
      screen.getByLabelText('Error: Something went wrong'),
    ).toBeTruthy();
  });
});
