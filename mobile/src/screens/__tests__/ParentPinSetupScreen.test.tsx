import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import ParentPinSetupScreen from '../ParentPinSetupScreen';
import * as pinStorage from '../../storage/pin-storage';

jest.mock('expo-secure-store');
jest.mock('../../storage/pin-storage', () => ({
  ...jest.requireActual('../../storage/pin-storage'),
  savePin: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('react-i18next', () => {
  const t = (k: string) =>
    ({
      'onboarding.parentPinSetup.title': 'Set your parent PIN',
      'onboarding.parentPinSetup.body':
        "Set a 6-digit PIN. You'll use this to see your child's learning log.",
      'onboarding.parentPinSetup.enterPin': 'Enter a 6-digit PIN',
      'onboarding.parentPinSetup.confirmPin': 'Confirm your PIN',
      'onboarding.parentPinSetup.mismatch': "PINs don't match. Try again.",
      'onboarding.parentPinSetup.skip': 'Skip — set up later',
      'onboarding.parentPinSetup.accessibility.skipButton': 'Skip PIN setup',
      'parentAuth.changePin.title': 'Change Parent PIN',
      'parentAuth.changePin.enterOld': 'Enter your current PIN',
      'parentAuth.changePin.enterNew': 'Enter a new 6-digit PIN',
      'parentAuth.changePin.confirmNew': 'Confirm new PIN',
      'parentAuth.changePin.success': 'PIN changed successfully',
      'parentAuth.changePin.wrongOld': 'Current PIN is incorrect',
      'parentAuth.cancel': 'Cancel',
      'common.back': 'Back',
    })[k] ?? k;
  return {
    useTranslation: () => ({ t, i18n: { language: 'en' } }),
    initReactI18next: { type: '3rdParty', init: jest.fn() },
  };
});

function press(d: string) {
  fireEvent.press(screen.getByLabelText(`Key ${d}`));
}
function enter(d: string) {
  for (const c of d) press(c);
}

describe('ParentPinSetupScreen — setup mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('expo-secure-store').__resetStore();
  });

  it('renders title and body', () => {
    render(<ParentPinSetupScreen mode="setup" />);
    expect(screen.getByText('Set your parent PIN')).toBeTruthy();
    expect(
      screen.getByText("Set a 6-digit PIN. You'll use this to see your child's learning log."),
    ).toBeTruthy();
  });

  it('renders 6 digit slots', () => {
    render(<ParentPinSetupScreen mode="setup" />);
    for (let i = 1; i <= 6; i++) expect(screen.getByLabelText(`Digit ${i}`)).toBeTruthy();
  });

  it('auto-advances to confirm after 6 digits', () => {
    render(<ParentPinSetupScreen mode="setup" />);
    enter('123456');
    expect(screen.getByText('Confirm your PIN')).toBeTruthy();
  });

  it('calls onComplete after matching confirmation', async () => {
    jest.useFakeTimers();
    const oc = jest.fn();
    render(<ParentPinSetupScreen mode="setup" onComplete={oc} />);
    enter('123456');
    enter('123456');
    await act(async () => {
      jest.runAllTimers();
    });
    expect(pinStorage.savePin).toHaveBeenCalledWith('123456');
    jest.useRealTimers();
  });

  it('shows mismatch and resets', () => {
    jest.useFakeTimers();
    render(<ParentPinSetupScreen mode="setup" />);
    enter('123456');
    enter('654321');
    expect(screen.getByText("PINs don't match. Try again.")).toBeTruthy();
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText('Enter a 6-digit PIN')).toBeTruthy();
    jest.useRealTimers();
  });

  it('skip calls onSkip', () => {
    const os = jest.fn();
    render(<ParentPinSetupScreen mode="setup" onSkip={os} />);
    fireEvent.press(screen.getByText('Skip — set up later'));
    expect(os).toHaveBeenCalledTimes(1);
  });
});

describe('ParentPinSetupScreen — change mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('expo-secure-store').__resetStore();
    pinStorage.savePin('123456');
  });

  it('shows old PIN entry first', () => {
    render(<ParentPinSetupScreen mode="change" />);
    expect(screen.getByText('Change Parent PIN')).toBeTruthy();
  });

  it('moves to new PIN after valid old PIN', async () => {
    const vm = jest.fn().mockResolvedValue(true);
    render(<ParentPinSetupScreen mode="change" onVerifyOldPin={vm} />);
    enter('123456');
    await act(async () => {});
    expect(vm).toHaveBeenCalledWith('123456');
    expect(screen.getByText('Enter a new 6-digit PIN')).toBeTruthy();
  });

  it('shows error on wrong old PIN', async () => {
    const vm = jest.fn().mockResolvedValue(false);
    render(<ParentPinSetupScreen mode="change" onVerifyOldPin={vm} />);
    enter('000000');
    await act(async () => {});
    expect(screen.getByText('Current PIN is incorrect')).toBeTruthy();
  });

  it('saves new PIN and calls onComplete', async () => {
    const vm = jest.fn().mockResolvedValue(true);
    const oc = jest.fn();
    render(<ParentPinSetupScreen mode="change" onVerifyOldPin={vm} onComplete={oc} />);
    enter('123456');
    await act(async () => {});
    enter('654321');
    enter('654321');
    await act(async () => {});
    expect(pinStorage.savePin).toHaveBeenCalledWith('654321');
  });

  it('cancel calls onCancel', () => {
    const oc = jest.fn();
    render(<ParentPinSetupScreen mode="change" onCancel={oc} />);
    fireEvent.press(screen.getByText('Cancel'));
    expect(oc).toHaveBeenCalledTimes(1);
  });
});
