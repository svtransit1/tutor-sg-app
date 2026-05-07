/**
 * Tests for PinGateScreen.
 *
 * Uses React Native Testing Library with vitest.
 * expo-secure-store is globally mocked in vitest.setup.ts.
 */
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import PinGateScreen from '../PinGateScreen';

// Get the mock store from global (set up in vitest.setup.ts)
const mockStore = (globalThis as any).__SECURE_STORE_MOCK__ as Map<string, string>;

// Mock i18n
vi.mock('@tutor-sg/i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string>) => {
      const map: Record<string, string> = {
        'parent:pin_title': 'Parent PIN',
        'parent:pin_subtitle': 'Enter your 4-digit PIN to access the Parent area',
        'parent:pin_wrong': `Wrong PIN. ${params?.attempts ?? '0'} attempt(s) remaining.`,
        'parent:pin_locked': 'Too many attempts. Please wait 60 seconds.',
        'parent:digit_filled': `Digit ${params?.position ?? ''} entered`,
        'parent:digit_empty': `Digit ${params?.position ?? ''} — empty`,
        'parent:attempts_remaining': `${params?.count ?? '0'} attempt(s) remaining`,
        'parent:cooldown_timer': `Try again in ${params?.seconds ?? '0'}s`,
        'parent:keypad_digit': params?.value ?? '',
        'parent:keypad_backspace': 'Delete',
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

describe('PinGateScreen', () => {
  it('renders title and subtitle', () => {
    const { getByText } = render(
      <PinGateScreen onAuthenticated={vi.fn()} onDismiss={vi.fn()} />,
    );

    expect(getByText('Parent PIN')).toBeTruthy();
    expect(
      getByText('Enter your 4-digit PIN to access the Parent area'),
    ).toBeTruthy();
  });

  it('shows 4 empty digit slots', () => {
    const { getByLabelText } = render(
      <PinGateScreen onAuthenticated={vi.fn()} onDismiss={vi.fn()} />,
    );

    expect(getByLabelText('Digit 1 — empty')).toBeTruthy();
    expect(getByLabelText('Digit 2 — empty')).toBeTruthy();
    expect(getByLabelText('Digit 3 — empty')).toBeTruthy();
    expect(getByLabelText('Digit 4 — empty')).toBeTruthy();
  });

  it('calls onAuthenticated when correct PIN is entered', async () => {
    mockStore.set('parent.pin', '1234');
    mockStore.set('parent.pin_set', 'true');
    mockStore.set('parent.pin_failed_attempts', '0');

    const onAuth = vi.fn();
    const { getByLabelText } = render(
      <PinGateScreen onAuthenticated={onAuth} onDismiss={vi.fn()} />,
    );

    await pressDigits(getByLabelText, '1234');

    await waitFor(() => {
      expect(onAuth).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error on wrong PIN and clears input', async () => {
    mockStore.set('parent.pin', '1234');
    mockStore.set('parent.pin_set', 'true');
    mockStore.set('parent.pin_failed_attempts', '0');

    const { getByLabelText, getByText } = render(
      <PinGateScreen onAuthenticated={vi.fn()} onDismiss={vi.fn()} />,
    );

    await pressDigits(getByLabelText, '0000');

    await waitFor(() => {
      expect(getByText('Wrong PIN. 4 attempt(s) remaining.')).toBeTruthy();
    });

    // Input should be cleared (all slots empty)
    expect(getByLabelText('Digit 1 — empty')).toBeTruthy();
  });

  it('locks out after 5 wrong attempts', async () => {
    mockStore.set('parent.pin', '1234');
    mockStore.set('parent.pin_set', 'true');
    mockStore.set('parent.pin_failed_attempts', '0');

    const { getByLabelText, getByText } = render(
      <PinGateScreen onAuthenticated={vi.fn()} onDismiss={vi.fn()} />,
    );

    for (let i = 0; i < 5; i++) {
      await pressDigits(getByLabelText, '0000');
    }

    await waitFor(() => {
      expect(
        getByText('Too many attempts. Please wait 60 seconds.'),
      ).toBeTruthy();
    });
  });

  it('calls onDismiss when dismiss button pressed', () => {
    const onDismiss = vi.fn();
    const { getByLabelText } = render(
      <PinGateScreen onAuthenticated={vi.fn()} onDismiss={onDismiss} />,
    );

    fireEvent.press(getByLabelText('Back'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
