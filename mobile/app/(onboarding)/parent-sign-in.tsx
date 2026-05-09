import ParentSignInScreen from '../../src/screens/onboarding/ParentSignInScreen';
import { router } from 'expo-router';
export default function ParentSignInRoute() {
  return <ParentSignInScreen onSignedIn={() => router.replace('/(onboarding)/parent-pin-setup')} onSkip={() => router.replace('/(onboarding)/parent-pin-setup')} />;
}
