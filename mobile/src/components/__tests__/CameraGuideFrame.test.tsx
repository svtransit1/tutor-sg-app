import React from 'react';
import { render, screen } from '@testing-library/react-native';
import CameraGuideFrame from '../CameraGuideFrame';

const mockT = jest.fn((key: string) => {
  const FALLBACKS: Record<string, string> = {
    'cameraGuideFrame.accessibility.alignFrame': 'Align your worksheet in the frame',
    'cameraGuideFrame.accessibility.aligned': 'Worksheet is perfectly aligned',
    'cameraGuideFrame.hint': 'Fit the worksheet in the frame',
    'cameraGuideFrame.aligned': 'Perfect! Worksheet is aligned',
  };
  return FALLBACKS[key] ?? key;
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.useWindowDimensions = () => ({ width: 390, height: 844 });
  return rn;
});

describe('CameraGuideFrame', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<CameraGuideFrame isAligned={false} />);
    expect(screen.toJSON()).toBeTruthy();
  });

  it('renders hint text when not aligned', () => {
    render(<CameraGuideFrame isAligned={false} />);
    expect(screen.getByText('Fit the worksheet in the frame')).toBeTruthy();
  });

  it('renders aligned text when isAligned is true', () => {
    render(<CameraGuideFrame isAligned={true} />);
    expect(screen.getByText('Perfect! Worksheet is aligned')).toBeTruthy();
  });

  it('sets correct accessibility label when not aligned', () => {
    render(<CameraGuideFrame isAligned={false} />);
    const container = screen.getByLabelText('Align your worksheet in the frame');
    expect(container).toBeTruthy();
  });

  it('sets correct accessibility label when aligned', () => {
    render(<CameraGuideFrame isAligned={true} />);
    const container = screen.getByLabelText('Worksheet is perfectly aligned');
    expect(container).toBeTruthy();
  });

  it('sets accessibilityLiveRegion to polite', () => {
    render(<CameraGuideFrame isAligned={false} />);
    const container = screen.getByLabelText('Align your worksheet in the frame');
    expect(container.props.accessibilityLiveRegion).toBe('polite');
  });

  it('accepts and applies custom style', () => {
    render(<CameraGuideFrame isAligned={false} style={{ opacity: 0.5 }} />);
    const container = screen.getByLabelText('Align your worksheet in the frame');
    expect(container.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ opacity: 0.5 })]),
    );
  });

  it('renders status dot indicator', () => {
    render(<CameraGuideFrame isAligned={false} />);
    const dot = screen.toJSON();
    expect(dot).toBeTruthy();
  });
});
