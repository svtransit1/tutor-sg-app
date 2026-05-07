import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
<<<<<<< HEAD
      <Stack.Screen name="welcome" />
=======
      <Stack.Screen name="index" />
      <Stack.Screen name="kid-setup" />
>>>>>>> origin/feat/aaas-42-consent-privacy-current
    </Stack>
  );
}
