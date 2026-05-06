/**
 * Device Tier Result route — Onboarding step 7/10.
 * Route: /onboarding/device-tier-result
 *
 * Per Article 12 §3.7: Detect device capabilities and show tier result.
 * Integrates with OnboardingProvider to persist device tier.
 */
import React, { useCallback } from 'react';
import DeviceTierScreen from '../../src/screens/onboarding/DeviceTierScreen';
import { useOnboarding } from '../../src/onboarding';

export default function DeviceTierResultRoute() {
  const { goNext, updateState } = useOnboarding();

  const handleComplete = useCallback(() => {
    goNext();
  }, [goNext]);

  return (
    <DeviceTierScreen onComplete={handleComplete} />
  );
}
