import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import CameraDarkEnvironmentSheet from '../CameraDarkEnvironmentSheet';

const t = (k: string) =>
  ({
    'homeworkError.darkEnvironment.title': 'Too dark to read',
    'homeworkError.darkEnvironment.description':
      "The camera can't see your homework clearly. Try turning on more lights or use flash.",
    'homeworkError.darkEnvironment.retry': 'Try again',
    'homeworkError.darkEnvironment.typeItOut': 'Type it out instead',
    'homeworkError.darkEnvironment.goBack': 'Go back home',
  })[k] ?? k;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t, i18n: { language: 'en' } }),
  initReactI18next: { type: '3rdParty', init: jest.fn() },
}));

const defaultProps = {
  onDismiss: jest.fn(),
  onManualInput: jest.fn(),
  onRetry: jest.fn(),
};

describe('CameraDarkEnvironmentSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and description', () => {
    render(<CameraDarkEnvironmentSheet {...defaultProps} />);
    expect(screen.getByText('Too dark to read')).toBeTruthy();
    expect(
      screen.getByText(
        "The camera can't see your homework clearly. Try turning on more lights or use flash.",
      ),
    ).toBeTruthy();
  });

  it('renders retry button', () => {
    render(<CameraDarkEnvironmentSheet {...defaultProps} />);
    expect(screen.getByText('Try again')).toBeTruthy();
  });

  it('renders manual input option', () => {
    render(<CameraDarkEnvironmentSheet {...defaultProps} />);
    expect(screen.getByText('Type it out instead')).toBeTruthy();
  });

  it('renders go back dismiss button', () => {
    render(<CameraDarkEnvironmentSheet {...defaultProps} />);
    expect(screen.getByText('Go back home')).toBeTruthy();
  });

  it('calls onDismiss when go back is tapped', () => {
    render(<CameraDarkEnvironmentSheet {...defaultProps} />);
    fireEvent.press(screen.getByText('Go back home'));
    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onManualInput when type-it-out is pressed', () => {
    render(<CameraDarkEnvironmentSheet {...defaultProps} />);
    fireEvent.press(screen.getByText('Type it out instead'));
    expect(defaultProps.onManualInput).toHaveBeenCalledTimes(1);
  });

  it('calls onRetry when retry is pressed', () => {
    render(<CameraDarkEnvironmentSheet {...defaultProps} />);
    fireEvent.press(screen.getByText('Try again'));
    expect(defaultProps.onRetry).toHaveBeenCalledTimes(1);
  });
});
