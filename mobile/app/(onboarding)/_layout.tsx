import React from 'react';
import { Stack } from 'expo-router';
import { OnboardingProvider } from '../../src/contexts/OnboardingContext';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="lang-pick" />
        <Stack.Screen name="age-gate" />
        <Stack.Screen name="parent-pin-setup" />
        <Stack.Screen name="parent-sign-in" />
        <Stack.Screen name="grade-subject-pick" />
        <Stack.Screen name="sibling-prompt" />
        <Stack.Screen name="device-tier-result" />
        <Stack.Screen name="permission-primer" />
        <Stack.Screen name="model-download" />
        <Stack.Screen name="ready-landing" />
      </Stack>
    </OnboardingProvider>
  );
}