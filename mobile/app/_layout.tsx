/**
 * Root layout — wraps the entire app in providers.
 *
 * - DeviceTierProvider for device capability detection + below-floor guard
 * - OnboardingProvider for state machine
 * - SafeAreaProvider for safe area insets
 * - StatusBar for system UI styling
 * - i18n initialization
 */

import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

import { OnboardingProvider } from '../src/onboarding';
import { DeviceTierProvider } from '@tutor-sg/device-tier';
import i18n from '../src/i18n';

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.loadingText}>tutor-sg — loading...</Text>
    </View>
  );
}

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    // Ensure i18n is initialized
    if (i18n.isInitialized) {
      setI18nReady(true);
    } else {
      i18n.on('initialized', () => setI18nReady(true));
    }
  }, []);

  if (!i18nReady) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <DeviceTierProvider>
        <OnboardingProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            {/* Root index handles redirect logic */}
            <Stack.Screen name="index" />
            {/* Onboarding group */}
            <Stack.Screen name="(onboarding)" />
            {/* Kid app group */}
            <Stack.Screen name="(kid)" />
          </Stack>
        </OnboardingProvider>
      </DeviceTierProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});
