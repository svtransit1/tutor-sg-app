/**
 * Tests for DeviceTierScreen.
 *
 * Uses the real detectDeviceInfo with fake timers to control the
 * async detection flow. No module-level overrides needed.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import DeviceTierScreen from '../DeviceTierScreen';

const mockT = (key: string) => key;
const mockI18n = { language: 'en', changeLanguage: jest.fn() };

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT, i18n: mockI18n }),
}));

jest.mock('../../../hooks/useNetworkStatus', () => ({
  useNetworkStatus: jest.fn(() => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  })),
}));

jest.mock('../../../components/OnboardingProgressIndicator', () => {
  const R = require('react');
  const N = require('react-native');
  const PFn = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) =>
    R.createElement(N.View, null, R.createElement(N.Text, null, `P:${currentStep}/${totalSteps}`));
  return PFn;
});

jest.mock('@tutor-sg/device-tier', () => {
  const R = require('react');
  const N = require('react-native');
  return {
    assignTier: (info: { totalRAM: number; chipset: string; npuAvailable: boolean }) => {
      if (info.totalRAM < 3) return { tier: 'low' as const, belowFloor: true };
      if (info.totalRAM >= 6 &&
          ['A14','A15','A16','A17','A18'].some((c: string) => info.chipset.includes(c)) &&
          info.npuAvailable) {
        return { tier: 'high' as const, belowFloor: false };
      }
      return { tier: 'mid' as const, belowFloor: false };
    },
    MODEL_MAP: {
      high: { llm: 'Gemma-2 4B', mt: 'Qwen 3.5 4B' },
      mid: { llm: 'Gemma-2 2B', mt: 'Qwen 3.5 2B' },
      low: { llm: 'none', mt: 'none' },
    },
    BELOW_FLOOR_MESSAGES: { en: 'Too old.', zh: '太旧。' },
    BelowFloorModal: ({ visible, language }: { visible: boolean; language?: string }) => {
      if (!visible) return null;
      return R.createElement(N.View, { testID: 'below-floor-modal' },
        R.createElement(N.Text, null, language === 'zh-Hans' ? '中文' : 'Too old')
      );
    },
    TIER_THRESHOLDS: { HIGH_RAM_GB: 6, MID_RAM_GB: 4, FLOOR_RAM_GB: 3 },
    HIGH_TIER_CHIPSETS: ['A14','A15','A16','A17','A18'],
    SETTINGS_KEY: 'device_tier',
  };
});

// ── Tests ──────────────────────────────────────────────────────────

describe('DeviceTierScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ── Loading state ──────────────────────────────────────────

  it('shows loading state on mount before detection resolves', () => {
    render(<DeviceTierScreen />);
    expect(screen.getByText('deviceTierResult.loading')).toBeTruthy();
  });

  // ── High tier ready state ──────────────────────────────────

  it('renders high tier badge after detection completes', async () => {
    render(<DeviceTierScreen />);

    // The real detectDeviceInfo uses setTimeout(1200) — advance past it
    act(() => { jest.advanceTimersByTime(1500); });
    // Flush microtasks from the async detection
    await act(() => Promise.resolve());

    expect(screen.getByText('deviceTierResult.title')).toBeTruthy();
    expect(screen.getByText('deviceTierResult.highPerformance')).toBeTruthy();
  });

  it('renders download CTAs', async () => {
    render(<DeviceTierScreen />);

    act(() => { jest.advanceTimersByTime(1500); });
    await act(() => Promise.resolve());

    expect(screen.getByLabelText('deviceTierResult.downloadNow')).toBeTruthy();
    expect(screen.getByLabelText('deviceTierResult.downloadLater')).toBeTruthy();
  });

  it('calls onComplete when download now pressed on Wi-Fi', async () => {
    const onComplete = jest.fn();
    render(<DeviceTierScreen onComplete={onComplete} />);

    act(() => { jest.advanceTimersByTime(1500); });
    await act(() => Promise.resolve());

    expect(screen.getByLabelText('deviceTierResult.downloadNow')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('deviceTierResult.downloadNow'));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onComplete when download later pressed', async () => {
    const onComplete = jest.fn();
    render(<DeviceTierScreen onComplete={onComplete} />);

    act(() => { jest.advanceTimersByTime(1500); });
    await act(() => Promise.resolve());

    fireEvent.press(screen.getByLabelText('deviceTierResult.downloadLater'));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  // ── Cellular warning ───────────────────────────────────────

  it('shows cellular warning modal on cellular', async () => {
    const useNetworkStatus = jest.requireMock('../../../hooks/useNetworkStatus').useNetworkStatus;
    useNetworkStatus.mockReturnValue({
      isConnected: true, isInternetReachable: true, type: 'cellular',
    });

    render(<DeviceTierScreen />);

    act(() => { jest.advanceTimersByTime(1500); });
    await act(() => Promise.resolve());

    fireEvent.press(screen.getByLabelText('deviceTierResult.downloadNow'));

    expect(screen.getByText('deviceTierResult.cellularWarning')).toBeTruthy();
    expect(screen.getByLabelText('deviceTierResult.cellularProceed')).toBeTruthy();
    expect(screen.getByLabelText('deviceTierResult.cellularCancel')).toBeTruthy();
  });

  it('proceeds on cellular when download anyway pressed', async () => {
    const onComplete = jest.fn();
    const useNetworkStatus = jest.requireMock('../../../hooks/useNetworkStatus').useNetworkStatus;
    useNetworkStatus.mockReturnValue({
      isConnected: true, isInternetReachable: true, type: 'cellular',
    });

    render(<DeviceTierScreen onComplete={onComplete} />);

    act(() => { jest.advanceTimersByTime(1500); });
    await act(() => Promise.resolve());

    fireEvent.press(screen.getByLabelText('deviceTierResult.downloadNow'));
    fireEvent.press(screen.getByLabelText('deviceTierResult.cellularProceed'));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('dismisses cellular warning on cancel', async () => {
    const useNetworkStatus = jest.requireMock('../../../hooks/useNetworkStatus').useNetworkStatus;
    useNetworkStatus.mockReturnValue({
      isConnected: true, isInternetReachable: true, type: 'cellular',
    });

    render(<DeviceTierScreen />);

    act(() => { jest.advanceTimersByTime(1500); });
    await act(() => Promise.resolve());

    fireEvent.press(screen.getByLabelText('deviceTierResult.downloadNow'));
    expect(screen.getByText('deviceTierResult.cellularWarning')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('deviceTierResult.cellularCancel'));
    expect(screen.getByLabelText('deviceTierResult.downloadNow')).toBeTruthy();
  });

  // ── Accessibility ─────────────────────────────────────────

  it('has accessibilityRole on buttons', async () => {
    render(<DeviceTierScreen />);

    act(() => { jest.advanceTimersByTime(1500); });
    await act(() => Promise.resolve());

    expect(screen.getByLabelText('deviceTierResult.downloadNow').props.accessibilityRole).toBe('button');
  });
});
