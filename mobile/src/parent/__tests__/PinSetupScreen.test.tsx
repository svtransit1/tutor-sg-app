/**
 * Tests for PinSetupScreen.
 *
 * Uses React Native Testing Library with vitest.
 * expo-secure-store is globally mocked in vitest.setup.ts.
 */
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import PinSetupScreen from '../PinSetupScreen';

// Get the mock store from global (set up in vitest.setup.ts)
const mockStore = (globalThis as any).__SECURE_STORE_MOCK__ as Map<string, string>;

// Mock i18n
vi.mock('@tutor-sg/i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string>) => {
      const map: Record<string, string> = {
        'parent:pin_setup_title': 'Set Your Parent PIN',
        'parent:pin_setup_desc': 'Create a 4-digit PIN to protect the Parent area.',
        'parent:pin_setup': 'Set a 4-digit PIN',
        'parent:pin_confirm': 'Confirm PIN',
        'parent:pin_mismatch': "PINs don't match. Try again.",
        'parent:digit_confirm': `Confirm digit ${params?.position ?? ''}`,
        'parent:digit_empty': `Digit ${params?.position ?? ''} — empty`,
        'parent:keypad_digit': params?.value ?? '',
        'parent:keypad_backspace': 'Delete',
        'parent:back_to_enter': 'Go back to enter PIN',
        'parent:skip_pin_setup': 'Skip — set up later',
        'common:back': 'Back',
      };
      return map[key] ?? key;
    },
  }),
}));

beforeEach(() => {
  mockStore.clear();
  vi.clearAllMocks();
});

// Helper to simulate keypad presses — each press wrapped in act for state updates
async function pressDigits(getByLabelText: (text: string) => any, digits: string) {
  for (const digit of digits) {
    await act(async () => {
      fireEvent.press(getByLabelText(digit));
    });
  }
}

// ── Tests ──────────────────────────────────────────────────────────

describe('PinSetupScreen', () => {
  it('renders title and step label', () => {
    const { getByText } = render(<PinSetupScreen onComplete={vi.fn()} onSkip={vi.fn()} />);

    expect(getByText('Set Your Parent PIN')).toBeTruthy();
    expect(getByText('Set a 4-digit PIN')).toBeTruthy();
  });

  it('shows 4 empty digit slots', () => {
    const { getByLabelText } = render(<PinSetupScreen onComplete={vi.fn()} onSkip={vi.fn()} />);

    expect(getByLabelText('Digit 1 — empty')).toBeTruthy();
    expect(getByLabelText('Digit 2 — empty')).toBeTruthy();
    expect(getByLabelText('Digit 3 — empty')).toBeTruthy();
    expect(getByLabelText('Digit 4 — empty')).toBeTruthy();
  });

  it('transitions to confirm step when 4 digits entered', async () => {
    const { getByLabelText, getByText } = render(
      <PinSetupScreen onComplete={vi.fn()} onSkip={vi.fn()} />,
    );

    await pressDigits(getByLabelText, '1234');

    await waitFor(() => {
      expect(getByText('Confirm PIN')).toBeTruthy();
    });
  });

  it('calls onComplete when PIN and confirm match', async () => {
    const onComplete = vi.fn();
    const { getByLabelText } = render(<PinSetupScreen onComplete={onComplete} onSkip={vi.fn()} />);

    await pressDigits(getByLabelText, '1234');
    await pressDigits(getByLabelText, '1234');

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    expect(mockStore.get('parent.pin')).toBe('1234');
  });

  it('shows mismatch error when PINs do not match', async () => {
    vi.useFakeTimers();

    const { getByLabelText, getByText } = render(
      <PinSetupScreen onComplete={vi.fn()} onSkip={vi.fn()} />,
    );

    await pressDigits(getByLabelText, '1234');
    await pressDigits(getByLabelText, '5678');

    await waitFor(() => {
      expect(getByText("PINs don't match. Try again.")).toBeTruthy();
    });

    // Advance timers past the 1-second mismatch reset
    await vi.advanceTimersByTimeAsync(1100);

    await waitFor(() => {
      expect(getByText('Set a 4-digit PIN')).toBeTruthy();
    });

    vi.useRealTimers();
  });

  it('calls onSkip when skip button pressed', () => {
    const onSkip = vi.fn();
    const { getByLabelText } = render(<PinSetupScreen onComplete={vi.fn()} onSkip={onSkip} />);

    fireEvent.press(getByLabelText('Skip — set up later'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('does not show skip button when skippable is false', () => {
    const { queryByLabelText } = render(
      <PinSetupScreen onComplete={vi.fn()} onSkip={vi.fn()} skippable={false} />,
    );

    expect(queryByLabelText('Skip — set up later')).toBeNull();
  });
});
