/**
 * Age Gate route — Onboarding step 3/10.
 * Route: /onboarding/age-gate
 *
 * Per Article 12 §3.3: Parent confirmation screen.
 * Uses OnboardingProvider for navigation and state machine.
 */
import React from 'react';
import AgeGateScreen from '../../src/screens/onboarding/AgeGateScreen';
import { useOnboarding } from '../../src/onboarding';

export default function AgeGateRoute() {
  const { goNext, goBack } = useOnboarding();

  return (
    <AgeGateScreen
      onComplete={goNext}
      onGoBack={goBack}
    />
  );
}
