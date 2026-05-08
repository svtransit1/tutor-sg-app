import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CameraErrorScreen } from '../CameraErrors';

const mockT = jest.fn((key: string) => {
  const FALLBACKS: Record<string, string> = {
    'cameraErrors.permission.title': 'Camera access needed',
    'cameraErrors.permission.description': 'Camera access description',
    'cameraErrors.permission.openSettings': 'Open Settings',
    'cameraErrors.permission.typeInstead': 'Type my question instead',
    'cameraErrors.unavailable.title': 'Camera not available',
    'cameraErrors.unavailable.description': 'No camera detected',
    'cameraErrors.unavailable.tryAgain': 'Try again',
    'cameraErrors.unavailable.typeInput': 'Type my question',
    'cameraErrors.lowLight.title': 'Dark photo detected',
    'cameraErrors.lowLight.description': 'Photo looks dark',
    'cameraErrors.lowLight.retake': 'Try again',
    'cameraErrors.lowLight.continueAnyway': 'Continue anyway',
    'common.goBack': 'Go back',
  };
  return FALLBACKS[key] ?? key;
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

describe('CameraErrorScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('permission_denied', () => {
    it('renders title and description', () => {
      const { getByText } = render(<CameraErrorScreen kind="permission_denied" />);
      expect(getByText('Camera access needed')).toBeTruthy();
      expect(getByText('Camera access description')).toBeTruthy();
    });

    it('renders Open Settings button', () => {
      const { getByText } = render(<CameraErrorScreen kind="permission_denied" />);
      expect(getByText('Open Settings')).toBeTruthy();
    });

    it('renders type input when onTypeInput provided', () => {
      const { getByText } = render(
        <CameraErrorScreen kind="permission_denied" onTypeInput={jest.fn()} />,
      );
      expect(getByText('Type my question instead')).toBeTruthy();
    });

    it('hides type input when onTypeInput missing', () => {
      const { queryByText } = render(<CameraErrorScreen kind="permission_denied" />);
      expect(queryByText('Type my question instead')).toBeNull();
    });

    it('calls onTypeInput on press', () => {
      const fn = jest.fn();
      const { getByText } = render(
        <CameraErrorScreen kind="permission_denied" onTypeInput={fn} />,
      );
      fireEvent.press(getByText('Type my question instead'));
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('has accessibility alert role', () => {
      const { root } = render(<CameraErrorScreen kind="permission_denied" />);
      expect(root.props.accessibilityRole).toBe('alert');
    });
  });

  describe('unavailable', () => {
    it('renders title and description', () => {
      const { getByText } = render(<CameraErrorScreen kind="unavailable" />);
      expect(getByText('Camera not available')).toBeTruthy();
      expect(getByText('No camera detected')).toBeTruthy();
    });

    it('renders Try again when onRetake provided', () => {
      const { getByText } = render(
        <CameraErrorScreen kind="unavailable" onRetake={jest.fn()} />,
      );
      expect(getByText('Try again')).toBeTruthy();
    });

    it('calls onTypeInput on press', () => {
      const fn = jest.fn();
      const { getByText } = render(
        <CameraErrorScreen kind="unavailable" onTypeInput={fn} />,
      );
      fireEvent.press(getByText('Type my question'));
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('low_light', () => {
    it('renders title and description', () => {
      const { getByText } = render(<CameraErrorScreen kind="low_light" />);
      expect(getByText('Dark photo detected')).toBeTruthy();
      expect(getByText('Photo looks dark')).toBeTruthy();
    });

    it('renders Continue anyway when onContinueAnyway provided', () => {
      const { getByText } = render(
        <CameraErrorScreen kind="low_light" onContinueAnyway={jest.fn()} />,
      );
      expect(getByText('Continue anyway')).toBeTruthy();
    });

    it('calls onContinueAnyway on press', () => {
      const fn = jest.fn();
      const { getByText } = render(
        <CameraErrorScreen kind="low_light" onContinueAnyway={fn} />,
      );
      fireEvent.press(getByText('Continue anyway'));
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('has accessibility alert role', () => {
      const { root } = render(<CameraErrorScreen kind="low_light" />);
      expect(root.props.accessibilityRole).toBe('alert');
    });
  });

  describe('unhandled kinds', () => {
    it('returns null for capture_failed', () => {
      const { UNSAFE_root } = render(<CameraErrorScreen kind="capture_failed" />);
      expect(UNSAFE_root.children.length).toBe(0);
    });

    it('returns null for processing_failed', () => {
      const { UNSAFE_root } = render(<CameraErrorScreen kind="processing_failed" />);
      expect(UNSAFE_root.children.length).toBe(0);
    });
  });
});
