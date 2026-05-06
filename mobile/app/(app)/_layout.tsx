import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="camera" />
      <Stack.Screen name="feedback" />
      <Stack.Screen name="manual-input" />
    </Stack>
  );
}
