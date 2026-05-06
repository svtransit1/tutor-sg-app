/**
 * Parent Sign-In screen — Onboarding step 5/7.
 *
 * Route: /onboarding/parent-sign-in
 *
 * Provides email magic link, Google OAuth, and Apple OAuth sign-in
 * for the parent account.
 */
import ParentSignInScreen from '../../src/screens/onboarding/ParentSignInScreen';
import { router } from 'expo-router';

export default function ParentSignInRoute() {
  const handleSignedIn = () => {
    // Navigate to the final onboarding step (step 7 — ready landing)
    router.replace('/(onboarding)/done');
  };

  const handleSkip = () => {
    // Skip sign-in, go to the final onboarding step
    router.replace('/(onboarding)/done');
  };

  return (
    <ParentSignInScreen onSignedIn={handleSignedIn} onSkip={handleSkip} />
  );
}
