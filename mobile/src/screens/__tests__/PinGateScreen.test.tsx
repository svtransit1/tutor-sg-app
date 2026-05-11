import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import PinGateScreen from '../PinGateScreen';
import * as pinStorage from '../../storage/pin-storage';
jest.mock('expo-secure-store');
const resetSecureStore = () => (jest.requireMock('expo-secure-store') as any).__resetStore();
jest.mock('react-i18next', () => {
  const map: Record<string, string> = {
    'parentAuth.title': 'Parent Access',
    'parentAuth.enterPin': 'Enter your PIN',
    'parentAuth.wrongPin': 'Wrong PIN.',
    'parentAuth.cooldown': 'Too many attempts. Please wait Xs',
    'parentAuth.cooldownTimer': 'Try again in {{seconds}}s',
    'parentAuth.attemptsRemaining': 'N attempt remaining',
    'parentAuth.attemptsRemaining_plural': 'N attempts remaining',
    'parentAuth.cancel': 'Cancel',
    'parentAuth.accessibility.dismissOverlay': 'Dismiss PIN screen',
    'parentAuth.accessibility.cancelButton': 'Cancel PIN entry',
    'parentAuth.accessibility.digitSlot': 'Digit {{n}}',
    'parentAuth.accessibility.digitSlotFilled': 'Digit {{n}} entered',
    'parentAuth.accessibility.keypadKey': 'Key {{key}}',
    'parentAuth.accessibility.keypadBackspace': 'Delete',
  };
  const t = (k: string, opts?: Record<string, unknown>) => {
    let val = map[k];
    if (val === undefined) return k;
    if (opts) {
      for (const [key, value] of Object.entries(opts)) {
        val = val.replace(`{{${key}}}`, String(value));
      }
    }
    return val;
  };
  return { useTranslation: () => ({ t, i18n: { language: 'en' } }), initReactI18next: { type: '3rdParty', init: jest.fn() } };
});

function press(d: string) {
  const label = d === '\u232B' ? 'Delete' : `Key ${d}`;
  fireEvent.press(screen.getByLabelText(label));
}
function enter(d: string) { for (const c of d) press(c); }

describe('PinGateScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useRealTimers();
    resetSecureStore();
    await pinStorage.savePin('123456');
  });

  it('renders title and keypad', () => {
    render(<PinGateScreen onSuccess={jest.fn()} onDismiss={jest.fn()} />);
    expect(screen.getByText('Parent Access')).toBeTruthy();
    expect(screen.getByText('Enter your PIN')).toBeTruthy();
    for (const d of ['0','1','2','3','4','5','6','7','8','9']) {
      expect(screen.getByLabelText(`Key ${d}`)).toBeTruthy();
    }
    expect(screen.getByLabelText('Delete')).toBeTruthy();
  });

  it('has accessible title with header role', () => {
    render(<PinGateScreen onSuccess={jest.fn()} onDismiss={jest.fn()} />);
    const title = screen.getByText('Parent Access');
    expect(title.props.accessibilityRole).toBe('header');
  });

  it('has accessible dismiss overlay', () => {
    render(<PinGateScreen onSuccess={jest.fn()} onDismiss={jest.fn()} />);
    expect(screen.getByLabelText('Dismiss PIN screen')).toBeTruthy();
  });

  it('has accessible cancel button', () => {
    render(<PinGateScreen onSuccess={jest.fn()} onDismiss={jest.fn()} />);
    expect(screen.getByLabelText('Cancel PIN entry')).toBeTruthy();
  });

  it('shows attempts remaining with alert role when <= 3', async () => {
    render(<PinGateScreen onSuccess={jest.fn()} onDismiss={jest.fn()} />);
    // Enter wrong PIN 2 times to get attempts left to 3
    enter('000000');
    await act(async () => { await new Promise(r => setImmediate(r)); });
    enter('000000');
    await act(async () => { await new Promise(r => setImmediate(r)); });
    const el = screen.getByText(/attempt/i);
    expect(el.props.accessibilityRole).toBe('alert');
  });

  it('lock icon is hidden from accessibility', () => {
    const { toJSON } = render(<PinGateScreen onSuccess={jest.fn()} onDismiss={jest.fn()} />);
    const root = toJSON() as any;
    const find = (node: any): any => {
      if (!node || typeof node !== 'object') return null;
      if (node.props?.accessible === false && node.props?.accessibilityElementsHidden) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = find(child);
          if (found) return found;
        }
      }
      return null;
    };
    const lockView = find(root);
    expect(lockView).toBeTruthy();
    expect(lockView.props.accessible).toBe(false);
    expect(lockView.props.accessibilityElementsHidden).toBe(true);
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
    expect(screen.getByLabelText('Key 0')).toBeTruthy();
  });

  it('triggers cooldown after 5 wrong attempts', async () => {
    render(<PinGateScreen onSuccess={jest.fn()} onDismiss={jest.fn()} />);
    for (let i = 0; i < 5; i++) {
      enter('000000');
      await act(async () => { await new Promise(r => setImmediate(r)); });
    }
    expect(screen.getByText(/Try again/i)).toBeTruthy();
  });

  it('calls onDismiss on cancel button press', () => {
    const od = jest.fn();
    render(<PinGateScreen onSuccess={jest.fn()} onDismiss={od} />);
    fireEvent.press(screen.getByLabelText('Cancel PIN entry'));
    expect(od).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when tapping dismiss overlay', () => {
    const od = jest.fn();
    render(<PinGateScreen onSuccess={jest.fn()} onDismiss={od} />);
    fireEvent.press(screen.getByLabelText('Dismiss PIN screen'));
    expect(od).toHaveBeenCalledTimes(1);
  });
});
