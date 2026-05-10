import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator } from 'react-native';

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={{ marginTop: 16, fontSize: 16, color: '#6B7280' }}>Loading...</Text>
    </View>
  );
}

export default function RootLayout() {
  const [ready] = React.useState(true);
  if (!ready) return <LoadingScreen />;

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(kid)" />
        <Stack.Screen name="(parent)" />
      </Stack>
    </SafeAreaProvider>
  );
}
