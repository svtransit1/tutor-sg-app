import React, { useState } from 'react';
import { Stack, router } from 'expo-router';
import PinGateScreen from '../../src/screens/PinGateScreen';

export default function KidLayout() {
  const [showPinGate, setShowPinGate] = useState(false);

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="home" />
        <Stack.Screen name="photo-review" />
      </Stack>
      {showPinGate && (
        <PinGateScreen
          onSuccess={() => { setShowPinGate(false); router.push('/(parent)'); }}
          onDismiss={() => setShowPinGate(false)}
        />
      )}
    </>
  );
}
