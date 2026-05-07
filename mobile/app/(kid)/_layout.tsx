import { Stack } from 'expo-router';

export default function KidLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="camera" />
      <Stack.Screen name="history" />
      <Stack.Screen name="camera-result" />
      <Stack.Screen name="ocr-review" />
      <Stack.Screen name="manual-input" />
    </Stack>
  );
}
