import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * Entry point — checks onboarding completion state.
 * Redirects to onboarding if not completed, otherwise to kid home.
 * Onboarding state persistence will be wired in M2 (AsyncStorage/MMKV).
 */
export default function EntryPoint() {
  const [ready, setReady] = useState(false);
  const [hasOnboarding, setHasOnboarding] = useState(false);

  useEffect(() => {
    // TODO: Replace with actual onboarding state check (MMKV/AsyncStorage)
    // const completed = storage.get('onboarding_completed');
    // setHasOnboarding(!!completed);
    setHasOnboarding(false);
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
