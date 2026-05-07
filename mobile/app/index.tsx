/**
 * App entry — redirects to onboarding or kid home based on state.
 */
import { useOnboarding } from '../src/onboarding';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { initialized } = useOnboarding();

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // The OnboardingProvider handles navigation via the router effect
  return null;
}
