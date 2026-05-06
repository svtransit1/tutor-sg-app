import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { OnboardingOrchestrator } from '../../src/onboarding/screens/OnboardingOrchestrator';
import { useOnboarding } from '../../src/onboarding';

/**
 * Onboarding entry point — renders the current step via the state machine.
 * When onboarding is complete, automatically redirects to home.
 */
export default function OnboardingIndex() {
  const { isComplete } = useOnboarding();
  const router = useRouter();

  useEffect(() => {
    if (isComplete) {
      router.replace('/(app)');
    }
  }, [isComplete]);

  if (isComplete) return null;

  return <OnboardingOrchestrator />;
}
