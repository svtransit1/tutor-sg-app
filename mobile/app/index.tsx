import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { isOnboardingCompleted } from '@/storage/onboarding-state';

/**
 * Entry point — checks onboarding completion state.
 * Redirects to onboarding if not completed, otherwise to kid home.
 * Reads from MMKV-persisted onboarding state.
 */
export default function EntryPoint() {
  const [ready, setReady] = useState(false);
  const [hasOnboarding, setHasOnboarding] = useState(false);

  useEffect(() => {
    // Check MMKV-persisted onboarding state
    const completed = isOnboardingCompleted();
    setHasOnboarding(completed);
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Loading…</Text>
      </View>
    );
  }

  if (hasOnboarding) {
    return <Redirect href="/(kid)/home" />;
  }

  return <Redirect href="/(onboarding)/welcome" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
});
