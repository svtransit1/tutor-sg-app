/**
 * Root layout — controls top-level navigation structure.
 *
 * Stack navigator with groups:
 * - (onboarding): First-launch flow (device tier detection, model download)
 * - (kid): Main kid app with bottom tab navigation (Home, Camera, History, Parent)
 * - camera-result: Result screen after camera capture (no tabs, full screen)
 * - parent: Modal parent area (PIN-gated, with its own tab navigator)
 *
 * After onboarding completes, the app transitions to the kid group.
 * Per ADD §4.2: parent area is PIN-protected and presented modally.
 */
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import '../src/i18n/config'; // Initialize i18n

// Prevent splash screen auto-hide — manage it after i18n is ready
import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { i18n, ready } = useTranslation();

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Onboarding flow — shown on first launch */}
        <Stack.Screen
          name="(onboarding)"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />

        {/* Main kid tab navigator — shown after onboarding */}
        <Stack.Screen
          name="(kid)"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />

        {/* Camera result — full screen, no tabs */}
        <Stack.Screen
          name="camera-result"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />

        {/* Parent area — presented modally after PIN verification */}
        <Stack.Screen
          name="parent"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </>
  );
}
