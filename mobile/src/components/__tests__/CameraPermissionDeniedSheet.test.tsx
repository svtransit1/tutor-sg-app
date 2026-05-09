import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import CameraPermissionDeniedSheet from '../CameraPermissionDeniedSheet';

const t = (k: string) =>
  ({
    'homeworkError.cameraDenied.title': 'Camera not available',
    'homeworkError.cameraDenied.description':
      'We need the camera to read your homework. Please allow camera access in Settings.',
    'homeworkError.cameraDenied.openSettings': 'Open Settings',
    'homeworkError.cameraDenied.grantPermission': 'Allow Camera',
    'homeworkError.cameraDenied.typeItOut': 'Type it out instead',
    'homeworkError.cameraDenied.goBack': 'Go back home',
  })[k] ?? k;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t, i18n: { language: 'en' } }),
  initReactI18next: { type: '3rdParty', init: jest.fn() },
}));

const defaultProps = {
  onDismiss: jest.fn(),
  onManualInput: jest.fn(),
  onOpenSettings: jest.fn(),
  onRequestPermission: jest.fn(),
};

describe('CameraPermissionDeniedSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and description', () => {
    render(<CameraPermissionDeniedSheet {...defaultProps} />);
    expect(screen.getByText('Camera not available')).toBeTruthy();
    expect(
      screen.getByText(
        'We need the camera to read your homework. Please allow camera access in Settings.',
      ),
    ).toBeTruthy();
  });

  it('renders manual input option', () => {
    render(<CameraPermissionDeniedSheet {...defaultProps} />);
    expect(screen.getByText('Type it out instead')).toBeTruthy();
  });

  it('renders go back dismiss button', () => {
    render(<CameraPermissionDeniedSheet {...defaultProps} />);
    expect(screen.getByText('Go back home')).toBeTruthy();
  });

  it('calls onDismiss when dismiss area is tapped', () => {
    render(<CameraPermissionDeniedSheet {...defaultProps} />);
    fireEvent.press(screen.getByText('Go back home'));
    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onManualInput when type-it-out is pressed', () => {
    render(<CameraPermissionDeniedSheet {...defaultProps} />);
    fireEvent.press(screen.getByText('Type it out instead'));
    expect(defaultProps.onManualInput).toHaveBeenCalledTimes(1);
  });
});
