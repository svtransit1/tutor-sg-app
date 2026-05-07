<<<<<<< HEAD
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/src/i18n';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(kid)" />
        <Stack.Screen name="(parent)" />
      </Stack>
    </SafeAreaProvider>
  );
}
=======
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import '../src/i18n';
import i18n from '../src/i18n';
import { getLocale } from '../src/storage';
import { OnboardingProvider } from '../src/onboarding';

SplashScreen.preventAutoHideAsync();

function RootContent() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await getLocale();
      if (saved) await i18n.changeLanguage(saved);
      await SplashScreen.hideAsync();
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </OnboardingProvider>
  );
}

export default function RootLayout() {
  return <RootContent />;
}
>>>>>>> origin/feat/aaas-42-consent-privacy-current
