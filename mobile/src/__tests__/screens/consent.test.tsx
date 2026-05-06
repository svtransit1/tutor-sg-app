import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ConsentScreen from '../../../app/(onboarding)/consent';

describe('ConsentScreen', () => {
  it('renders without crash', () => {
    render(<ConsentScreen />);
    // i18n mock returns the key itself
    expect(screen.getByText('onboarding.consent.title')).toBeTruthy();
  });

  it('displays title and subtitle via i18n keys', () => {
    render(<ConsentScreen />);
    expect(screen.getByText('onboarding.consent.title')).toBeTruthy();
    expect(screen.getByText('onboarding.consent.subtitle')).toBeTruthy();
  });

  it('renders the device-only card', () => {
    render(<ConsentScreen />);
    expect(screen.getByText('onboarding.consent.deviceOnlyTitle')).toBeTruthy();
    expect(screen.getByText('onboarding.consent.deviceOnlyBody')).toBeTruthy();
  });

  it('renders the telemetry card with a toggle switch', () => {
    render(<ConsentScreen />);
    expect(screen.getByText('onboarding.consent.telemetryTitle')).toBeTruthy();
    // Switch accessibilityLabel reflects initial state (off)
    const toggle = screen.getByRole('switch', { name: 'onboarding.consent.telemetryToggleOff' });
    expect(toggle).toBeTruthy();
  });

  it('toggles telemetry switch on press', () => {
    render(<ConsentScreen />);
    const toggle = screen.getByRole('switch', { name: 'onboarding.consent.telemetryToggleOff' });
    fireEvent(toggle, 'onValueChange', true);
    // After toggle to on, accessibilityLabel should reflect on state
    expect(screen.getByText('onboarding.consent.telemetryToggleOn')).toBeTruthy();
  });

  it('renders the privacy policy link', () => {
    render(<ConsentScreen />);
    const link = screen.getByRole('link', { name: 'onboarding.consent.privacyPolicyLink' });
    expect(link).toBeTruthy();
  });

  it('renders the Continue button with correct accessibility', () => {
    render(<ConsentScreen />);
    const button = screen.getByRole('button', { name: 'onboarding.consent.continue' });
    expect(button).toBeTruthy();
  });

  it('renders a footer with Continue button', () => {
    render(<ConsentScreen />);
    const button = screen.getByRole('button', { name: 'onboarding.consent.continue' });
    expect(button).toBeTruthy();
    expect(screen.getByText('onboarding.consent.continue')).toBeTruthy();
  });
});
