/**
 * Kid Profile route — Onboarding kid name + language step.
 * Route: /onboarding/kid-profile
 */
import KidProfileScreen from '../../src/screens/onboarding/KidProfileScreen';

export default function KidProfileRoute() {
  return (
    <KidProfileScreen
      gradeLabel=""
      onComplete={() => {
        // Navigation handled by OnboardingProvider via goNext
      }}
    />
  );
}
