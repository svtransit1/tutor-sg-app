import { router } from 'expo-router';
import ParentSignInScreen from '../../src/screens/parent/ParentSignInScreen';

export default function ParentSignInRoute() {
  return (
    <ParentSignInScreen
      onSignedIn={() => router.replace('/(kid)/home')}
      onSkip={() => router.back()}
    />
  );
}
