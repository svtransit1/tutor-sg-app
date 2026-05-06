import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import '../src/i18n';
import i18n from '../src/i18n';
import { getLocale } from '../src/storage';
import { OnboardingProvider } from '../src/onboarding';
import { TelemetryProvider } from '../src/services/TelemetryProvider';

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
    <TelemetryProvider>
      <OnboardingProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </OnboardingProvider>
    </TelemetryProvider>
  );
}

export default function RootLayout() {
  return <RootContent />;
}
