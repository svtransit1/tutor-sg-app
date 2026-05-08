/**
 * Tests for DeviceTierScreen.
 * Uses fake timers to control the async detection (1200ms setTimeout).
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import DeviceTierScreen from '../DeviceTierScreen';

const mockT = (k: string) => k;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT, i18n: { language: 'en', changeLanguage: jest.fn() } }),
}));

jest.mock('@tutor-sg/device-tier', () => {
  return {
    assignTier: (info: { totalRAM: number; chipset: string; npuAvailable: boolean }) => {
      if (info.totalRAM < 3) return { tier: 'low' as const, belowFloor: true };
      if (info.totalRAM >= 6 && ['A14','A15','A16','A17','A18'].some((c: string) => info.chipset.includes(c)) && info.npuAvailable) {
        return { tier: 'high' as const, belowFloor: false };
      }
      return { tier: 'mid' as const, belowFloor: false };
    },
    MODEL_MAP: {
      high: { llm: 'Gemma-2 4B', mt: 'Qwen 3.5 4B' },
      mid: { llm: 'Gemma-2 2B', mt: 'Qwen 3.5 2B' },
      low: { llm: 'none', mt: 'none' },
    },
    BelowFloorModal: ({ visible }: { visible: boolean }) => visible ? 'too-old' : null,
  };
});

describe('DeviceTierScreen', () => {
  beforeEach(() => { jest.useFakeTimers(); });
  afterEach(() => { jest.useRealTimers(); });

  it('shows loading state on mount', () => {
    render(<DeviceTierScreen />);
    const loaders = screen.getAllByLabelText('Loading');
    expect(loaders.length).toBeGreaterThan(0);
  });

  it('renders high tier badge after detection', async () => {
    render(<DeviceTierScreen />);
    act(() => { jest.advanceTimersByTime(1500); });
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
    const fn = jest.fn();
    render(<DeviceTierScreen onComplete={fn} />);
    act(() => { jest.advanceTimersByTime(1500); });
    await act(() => Promise.resolve());

    fireEvent.press(screen.getByLabelText('deviceTierResult.downloadNow'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('calls onComplete when download later pressed', async () => {
    const fn = jest.fn();
    render(<DeviceTierScreen onComplete={fn} />);
    act(() => { jest.advanceTimersByTime(1500); });
    await act(() => Promise.resolve());

    fireEvent.press(screen.getByLabelText('deviceTierResult.downloadLater'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('shows cellular warning overlay on cellular', async () => {
    render(<DeviceTierScreen _testCellular />);
    act(() => { jest.advanceTimersByTime(1500); });
    await act(() => Promise.resolve());

    fireEvent.press(screen.getByLabelText('deviceTierResult.downloadNow'));
    expect(screen.getByLabelText('deviceTierResult.cellularProceed')).toBeTruthy();
    expect(screen.getByLabelText('deviceTierResult.cellularCancel')).toBeTruthy();
  });

  it('proceeds on cellular when download anyway pressed', async () => {
    const fn = jest.fn();
    render(<DeviceTierScreen onComplete={fn} _testCellular />);
    act(() => { jest.advanceTimersByTime(1500); });
    await act(() => Promise.resolve());

    fireEvent.press(screen.getByLabelText('deviceTierResult.downloadNow'));
    fireEvent.press(screen.getByLabelText('deviceTierResult.cellularProceed'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('dismisses cellular warning on cancel', async () => {
    render(<DeviceTierScreen _testCellular />);
    act(() => { jest.advanceTimersByTime(1500); });
    await act(() => Promise.resolve());

    fireEvent.press(screen.getByLabelText('deviceTierResult.downloadNow'));
    expect(screen.getByLabelText('deviceTierResult.cellularProceed')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('deviceTierResult.cellularCancel'));
    expect(screen.getByLabelText('deviceTierResult.downloadNow')).toBeTruthy();
  });

  it('has accessibilityRole button on download button', async () => {
    render(<DeviceTierScreen />);
    act(() => { jest.advanceTimersByTime(1500); });
    await act(() => Promise.resolve());

    expect(screen.getByLabelText('deviceTierResult.downloadNow').props.accessibilityRole).toBe('button');
  });
});
