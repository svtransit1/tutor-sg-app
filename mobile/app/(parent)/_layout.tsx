import React, { useState, useEffect, useCallback } from 'react';
import { Stack, useRouter } from 'expo-router';
import { isPinSet } from '../../src/parent/pin-storage';
import PinGateScreen from '../../src/parent/PinGateScreen';
import PinSetupScreen from '../../src/parent/PinSetupScreen';

export default function ParentLayout() {
  const router = useRouter();
  const [gateState, setGateState] = useState<'loading' | 'pin-set' | 'no-pin' | 'authenticated'>('loading');
  useEffect(() => { (async () => { setGateState((await isPinSet()) ? 'pin-set' : 'no-pin'); })(); }, []);
  const onAuth = useCallback(() => setGateState('authenticated'), []);
  const onSetup = useCallback(() => setGateState('authenticated'), []);
  const onDismiss = useCallback(() => router.back(), [router]);
  if (gateState === 'loading') return null;
  if (gateState === 'no-pin') return <PinSetupScreen onComplete={onSetup} onDismiss={onDismiss} skippable={false} />;
  if (gateState === 'pin-set') return <PinGateScreen onAuthenticated={onAuth} onDismiss={onDismiss} />;
  return <Stack screenOptions={{ headerShown: false }}><Stack.Screen name="dashboard" /></Stack>;
}
