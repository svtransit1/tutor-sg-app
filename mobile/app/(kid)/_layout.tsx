import { Stack } from 'expo-router';

export default function KidLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="camera" />
      <Stack.Screen name="feedback" />
      <Stack.Screen name="manual-input" />
      <Stack.Screen name="history" />
    </Stack>
  );
}
