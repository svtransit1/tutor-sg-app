/**
 * Parent PIN Setup route — Onboarding step 4/10.
 * Route: /onboarding/parent-pin-setup
 *
 * Per Article 12 §3.4:
 * Two-step 4-digit PIN entry with confirmation.
 * PIN stored in OS keychain via expo-secure-store.
 * Integrates with OnboardingProvider state machine.
 */
import React, { useCallback } from 'react';
import ParentPinSetupScreen from '../../src/screens/onboarding/ParentPinSetupScreen';
import { useOnboarding } from '../../src/onboarding';

export default function ParentPinSetupRoute() {
  const { goNext, updateState } = useOnboarding();

  const handleComplete = useCallback(() => {
    // Mark that PIN is set
    updateState({ pinSet: true });
    goNext();
  }, [goNext, updateState]);

  const handleSkip = useCallback(() => {
    // PIN not set — first time parent opens Parent Log, force PIN setup
    updateState({ pinSet: false });
    goNext();
  }, [goNext, updateState]);

  return (
    <ParentPinSetupScreen
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}
