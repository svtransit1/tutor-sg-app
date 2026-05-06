/**
 * Root layout for the app.
 *
 * Uses expo-router's Stack navigator.
 * Configures the navigation structure for onboarding and main app flow.
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import '../../src/i18n';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        {/* Onboarding group — no header, full-screen */}
        <Stack.Screen
          name="(onboarding)"
          options={{ headerShown: false, animation: 'fade' }}
        />
      </Stack>
    </>
  );
}
