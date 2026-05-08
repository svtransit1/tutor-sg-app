import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import PinGateScreen from '../PinGateScreen';
import * as pinStorage from '../../storage/pin-storage';

jest.mock('expo-secure-store');
jest.mock('react-i18next', () => {
  const t = (k: string, opts?: Record<string, unknown>) => ({
    'parentAuth.title': 'Parent Access',
    'parentAuth.enterPin': 'Enter your PIN',
    'parentAuth.wrongPin': 'Wrong PIN.',
    'parentAuth.cooldown': 'Too many attempts. Please wait Xs',
    'parentAuth.attemptsRemaining': 'N attempt remaining',
    'parentAuth.attemptsRemaining_plural': 'N attempts remaining',
    'parentAuth.cancel': 'Cancel',
  })[k] ?? k;
  return { useTranslation: () => ({ t, i18n: { language: 'en' } }), initReactI18next: { type: '3rdParty', init: jest.fn() } };
});

function press(d: string) { fireEvent.press(screen.getByLabelText(`Key ${d}`)); }
function enter(d: string) { for (const c of d) press(c); }

describe('PinGateScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useRealTimers();
    require('expo-secure-store').__resetStore();
    await pinStorage.savePin('123456');
  });

  it('renders title and keypad', () => {
    render(<PinGateScreen onSuccess={jest.fn()} onDismiss={jest.fn()} />);
    expect(screen.getByText('Parent Access')).toBeTruthy();
    expect(screen.getByText('Enter your PIN')).toBeTruthy();
    for (const d of ['0','1','2','3','4','5','6','7','8','9','⌫']) {
      expect(screen.getByLabelText(`Key ${d}`)).toBeTruthy();
    }
  });

  it('calls onSuccess for correct PIN', async () => {
    const os = jest.fn();
    render(<PinGateScreen onSuccess={os} onDismiss={jest.fn()} />);
    enter('123456');
    await act(async () => { await new Promise(r => setImmediate(r)); });
    expect(os).toHaveBeenCalledTimes(1);
  });

  it('shows error for wrong PIN', async () => {
    render(<PinGateScreen onSuccess={jest.fn()} onDismiss={jest.fn()} />);
    enter('654321');
    await act(async () => { await new Promise(r => setImmediate(r)); });
    // After wrong PIN, screen should still show keypad (pin reset)
    expect(screen.getByLabelText('Key 0')).toBeTruthy();
  });

  it('triggers cooldown after 5 wrong attempts', async () => {
    render(<PinGateScreen onSuccess={jest.fn()} onDismiss={jest.fn()} />);
    for (let i = 0; i < 5; i++) {
      enter('000000');
      await act(async () => { await new Promise(r => setImmediate(r)); });
    }
    expect(screen.getByText(/Too many attempts/i)).toBeTruthy();
  });

  it('calls onDismiss on cancel', () => {
    const od = jest.fn();
    render(<PinGateScreen onSuccess={jest.fn()} onDismiss={od} />);
    fireEvent.press(screen.getByText('Cancel'));
    expect(od).toHaveBeenCalledTimes(1);
  });
});
