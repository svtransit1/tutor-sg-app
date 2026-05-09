import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { CameraPermissionDeniedSheet } from '@/components/CameraPermissionDeniedSheet';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
    ready: true,
  }),
}));

const defaultProps = {
  visible: true,
  canAskAgain: true,
  onClose: jest.fn(),
  onOpenSettings: jest.fn(),
  onRequestPermission: jest.fn().mockResolvedValue(undefined),
  onManualInput: jest.fn(),
};

describe('CameraPermissionDeniedSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the sheet structure when visible', () => {
    render(<CameraPermissionDeniedSheet {...defaultProps} />);
    expect(screen.getByText('cameraPermission.denied.title')).toBeTruthy();
    expect(screen.getByText('cameraPermission.denied.body')).toBeTruthy();
    expect(screen.getByText('cameraPermission.denied.privacyBadge', { exact: false })).toBeTruthy();
    expect(screen.getByText('cameraPermission.denied.manualInput', { exact: false })).toBeTruthy();
  });

  it('shows Grant Permission button when canAskAgain is true', () => {
    render(<CameraPermissionDeniedSheet {...defaultProps} canAskAgain />);
    expect(screen.getByText('cameraPermission.denied.grantPermission')).toBeTruthy();
  });

  it('shows Open Settings button when canAskAgain is false', () => {
    render(<CameraPermissionDeniedSheet {...defaultProps} canAskAgain={false} />);
    expect(screen.getByText('cameraPermission.denied.openSettings')).toBeTruthy();
  });

  it('shows cancel button', () => {
    render(<CameraPermissionDeniedSheet {...defaultProps} />);
    expect(screen.getByText('cameraPermission.denied.cancel')).toBeTruthy();
  });

  it('calls onRequestPermission when Grant Permission is pressed', async () => {
    const onRequestPermission = jest.fn().mockResolvedValue(undefined);
    render(
      <CameraPermissionDeniedSheet
        {...defaultProps}
        canAskAgain
        onRequestPermission={onRequestPermission}
      />,
    );
    fireEvent.press(screen.getByText('cameraPermission.denied.grantPermission'));
    expect(onRequestPermission).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenSettings when Open Settings is pressed', () => {
    const onOpenSettings = jest.fn();
    render(
      <CameraPermissionDeniedSheet
        {...defaultProps}
        canAskAgain={false}
        onOpenSettings={onOpenSettings}
      />,
    );
    fireEvent.press(screen.getByText('cameraPermission.denied.openSettings'));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('calls onManualInput when manual input is pressed', () => {
    const onManualInput = jest.fn();
    render(
      <CameraPermissionDeniedSheet
        {...defaultProps}
        onManualInput={onManualInput}
      />,
    );
    fireEvent.press(screen.getByText('cameraPermission.denied.manualInput', { exact: false }));
    expect(onManualInput).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel is pressed', () => {
    const onClose = jest.fn();
    render(
      <CameraPermissionDeniedSheet {...defaultProps} onClose={onClose} />,
    );
    fireEvent.press(screen.getByText('cameraPermission.denied.cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows loading state while requesting permission', async () => {
    let resolvePromise!: () => void;
    const onRequestPermission = jest.fn(
      () => new Promise<void>((resolve) => { resolvePromise = resolve; }),
    );
    render(
      <CameraPermissionDeniedSheet
        {...defaultProps}
        canAskAgain
        onRequestPermission={onRequestPermission}
      />,
    );

    fireEvent.press(screen.getByText('cameraPermission.denied.grantPermission'));

    expect(screen.getByText('common.loading')).toBeTruthy();

    await waitFor(() => {
      resolvePromise();
    });

    await waitFor(() => {
      expect(screen.queryByText('common.loading')).toBeNull();
    });
  });
});
