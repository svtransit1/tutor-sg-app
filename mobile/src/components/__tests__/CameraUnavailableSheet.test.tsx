import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import CameraUnavailableSheet from '../CameraUnavailableSheet';

const t = (k: string) =>
  ({
    'homeworkError.noCamera.title': 'Camera not found',
    'homeworkError.noCamera.description':
      "This device doesn't have a camera. You can type your answers instead.",
    'homeworkError.noCamera.typeItOut': 'Type it out instead',
    'homeworkError.noCamera.goBack': 'Go back home',
  })[k] ?? k;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t, i18n: { language: 'en' } }),
  initReactI18next: { type: '3rdParty', init: jest.fn() },
}));

const defaultProps = {
  onDismiss: jest.fn(),
  onManualInput: jest.fn(),
};

describe('CameraUnavailableSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and description', () => {
    render(<CameraUnavailableSheet {...defaultProps} />);
    expect(screen.getByText('Camera not found')).toBeTruthy();
    expect(
      screen.getByText(
        "This device doesn't have a camera. You can type your answers instead.",
      ),
    ).toBeTruthy();
  });

  it('renders manual input option', () => {
    render(<CameraUnavailableSheet {...defaultProps} />);
    expect(screen.getByText('Type it out instead')).toBeTruthy();
  });

  it('renders go back dismiss button', () => {
    render(<CameraUnavailableSheet {...defaultProps} />);
    expect(screen.getByText('Go back home')).toBeTruthy();
  });

  it('calls onDismiss when go back is tapped', () => {
    render(<CameraUnavailableSheet {...defaultProps} />);
    fireEvent.press(screen.getByText('Go back home'));
    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onManualInput when type-it-out is pressed', () => {
    render(<CameraUnavailableSheet {...defaultProps} />);
    fireEvent.press(screen.getByText('Type it out instead'));
    expect(defaultProps.onManualInput).toHaveBeenCalledTimes(1);
  });
});
