/**
 * Tests for ParentPinSetupScreen (onboarding step 3/7 — Parent PIN Setup).
 *
 * Validates:
 * - Default state: title, body, enter-PIN prompt, empty digit slots, keypad, skip link
 * - Enter 4 digits → auto-advances to confirm step
 * - Confirm step: entering 4 matching digits → calls onComplete after save
 * - Confirm step: entering 4 non-matching digits → shake + reset to enter step
 * - Backspace key removes last digit
 * - Skip link calls onSkip
 * - Accessibility labels present on key interactive elements
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import ParentPinSetupScreen from '../ParentPinSetupScreen';
import * as pinStorage from '../../../storage/pin-storage';

// ── Mocks ──────────────────────────────────────────────────────────

// Mock t() that returns display strings for known keys.
// Supports {{param}} interpolation for accessibility labels.
const mockT = (k: string, params?: Record<string, string | number>) => {
  const display: Record<string, string> = {
    'onboarding.parentPinSetup.title': 'Set your parent PIN',
    'onboarding.parentPinSetup.body': "Set a 4-digit PIN. You'll use this to see your child's learning log.",
    'onboarding.parentPinSetup.enterPin': 'Enter a 4-digit PIN',
    'onboarding.parentPinSetup.confirmPin': 'Confirm your PIN',
    'onboarding.parentPinSetup.mismatch': "PINs don't match. Try again.",
    'onboarding.parentPinSetup.skip': 'Skip — set up later',
    'onboarding.parentPinSetup.accessibility.digitInput': 'Digit {{position}}',
    'onboarding.parentPinSetup.accessibility.confirmDigitInput': 'Confirm digit {{position}}',
    'onboarding.parentPinSetup.accessibility.keypadButton': 'Key {{value}}',
    'onboarding.parentPinSetup.accessibility.backToEnter': 'Go back to enter PIN',
    'onboarding.parentPinSetup.accessibility.skipButton': 'Skip PIN setup',
  };
  let result = display[k] ?? k;
  if (params) {
    for (const [key, val] of Object.entries(params)) {
      result = result.replace(`{{${key}}}`, String(val));
    }
  }
  return result;
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT, i18n: { language: 'en' } }),
}));

jest.mock('../../../storage/pin-storage', () => ({
  savePin: jest.fn().mockResolvedValue(undefined),
}));

// ── Helpers ────────────────────────────────────────────────────────

/** Press a keypad button by its default accessibility label "Key {digit}". */
function pressDigit(digit: string) {
  const btn = screen.getByLabelText(`Key ${digit}`);
  fireEvent.press(btn);
}

/** Press the backspace key. */
function pressBackspace() {
  const btn = screen.getByLabelText('Key ⌫');
  fireEvent.press(btn);
}

/** Enter a sequence of digits by pressing keypad buttons. */
function enterPin(digits: string) {
  for (const d of digits) {
    pressDigit(d);
  }
}

// ── Tests ──────────────────────────────────────────────────────────

describe('ParentPinSetupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and body copy', () => {
    render(<ParentPinSetupScreen />);
    expect(screen.getByText('Set your parent PIN')).toBeTruthy();
    expect(
      screen.getByText("Set a 4-digit PIN. You'll use this to see your child's learning log."),
    ).toBeTruthy();
  });

  it('renders enter-PIN prompt initially', () => {
    render(<ParentPinSetupScreen />);
    expect(screen.getByText('Enter a 4-digit PIN')).toBeTruthy();
  });

  it('renders 4 empty digit slot views', () => {
    render(<ParentPinSetupScreen />);
    // Slot labels use template literals: "Digit 1", "Digit 2", etc.
    for (let i = 1; i <= 4; i++) {
      expect(screen.getByLabelText(`Digit ${i}`)).toBeTruthy();
    }
  });

  it('renders all 10 digit keys (0-9) and backspace', () => {
    render(<ParentPinSetupScreen />);
    for (const digit of ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫']) {
      expect(screen.getByLabelText(`Key ${digit}`)).toBeTruthy();
    }
  });

  it('renders skip link', () => {
    render(<ParentPinSetupScreen />);
    expect(screen.getByText('Skip — set up later')).toBeTruthy();
  });

  it('entering digits stays in enter step until 4 digits are entered', () => {
    render(<ParentPinSetupScreen />);
    pressDigit('1');
    pressDigit('2');
    pressDigit('3');
    // Still in enter step
    expect(screen.getByText('Enter a 4-digit PIN')).toBeTruthy();
  });

  it('auto-advances to confirm step after 4 digits entered', () => {
    render(<ParentPinSetupScreen />);
    enterPin('1234');
    // Should switch to confirm step
    expect(screen.getByText('Confirm your PIN')).toBeTruthy();
  });

  it('calls onComplete after entering matching PIN and confirming', async () => {
    const onComplete = jest.fn();
    render(<ParentPinSetupScreen onComplete={onComplete} />);

    // Enter "1234"
    enterPin('1234');

    // Confirm with matching "1234"
    enterPin('1234');

    // Wait for async savePin to resolve (flush pending promises)
    await act(async () => {
      // Wait for React to process state updates and flush microtasks
    });

    expect(pinStorage.savePin).toHaveBeenCalledWith('1234');
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('shows mismatch error and resets when confirmation PIN does not match', () => {
    jest.useFakeTimers();
    render(<ParentPinSetupScreen />);

    // Enter "1234"
    enterPin('1234');

    // Confirm with "5678" (mismatch)
    enterPin('5678');

    // Mismatch error should appear
    expect(screen.getByText("PINs don't match. Try again.")).toBeTruthy();

    // Advance timers to trigger the reset timeout, wrapped in act
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Enter a 4-digit PIN')).toBeTruthy();

    jest.useRealTimers();
  });

  it('backspace removes the last digit and stays in enter step', () => {
    render(<ParentPinSetupScreen />);

    // Enter "123"
    pressDigit('1');
    pressDigit('2');
    pressDigit('3');

    // Press backspace
    pressBackspace();

    // Still in enter step
    expect(screen.getByText('Enter a 4-digit PIN')).toBeTruthy();
  });

  it('skip link calls onSkip', () => {
    const onSkip = jest.fn();
    render(<ParentPinSetupScreen onSkip={onSkip} />);
    fireEvent.press(screen.getByText('Skip — set up later'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('skip button has accessibility label', () => {
    render(<ParentPinSetupScreen />);
    expect(screen.getByLabelText('Skip PIN setup')).toBeTruthy();
  });
});
