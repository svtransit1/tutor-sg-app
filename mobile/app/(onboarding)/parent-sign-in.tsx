/**
 * Parent Sign-In screen — Onboarding step 5.
 *
 * Route: /onboarding/parent-sign-in
 *
 * Provides email magic link, Google OAuth, and Apple OAuth sign-in
 * for the parent account. Uses the OnboardingProvider to navigate
 * after sign-in or skip.
 */
import ParentSignInScreen from '../../src/screens/onboarding/ParentSignInScreen';
import { useOnboarding } from '../../src/onboarding/OnboardingProvider';

export default function ParentSignInRoute() {
  const { goNext, updateState } = useOnboarding();

  const handleSignedIn = () => {
    updateState({ signedInViaParentAuth: true });
    goNext();
  };

  const handleSkip = () => {
    goNext();
  };

  return (
    <ParentSignInScreen onSignedIn={handleSignedIn} onSkip={handleSkip} />
  );
}
