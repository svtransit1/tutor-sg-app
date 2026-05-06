/**
 * Kid app navigation layout.
 *
 * Stack navigator for the kid-facing portion of the app.
 * This group is shown after onboarding is complete.
 */

import React from 'react';
import { Stack } from 'expo-router';

export default function KidLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="camera" />
      <Stack.Screen name="camera-result" />
    </Stack>
  );
}
