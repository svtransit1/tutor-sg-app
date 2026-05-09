import React, { useCallback } from 'react';
import { router } from 'expo-router';
import ParentPinSetupScreen from '../../src/screens/ParentPinSetupScreen';

export default function ParentPinSetupRoute() {
  return (
    <ParentPinSetupScreen
      mode="setup"
      onComplete={() => router.replace('/(kid)/home')}
      onSkip={() => router.replace('/(kid)/home')}
    />
  );
}
