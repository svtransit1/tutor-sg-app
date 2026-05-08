import React, { useCallback } from 'react';
import { router } from 'expo-router';
import ParentPinSetupScreen from '../../src/screens/ParentPinSetupScreen';
import { verifyPin } from '../../src/storage/pin-storage';

export default function ChangePinRoute() {
  return (
    <ParentPinSetupScreen
      mode="change"
      onVerifyOldPin={async (p) => verifyPin(p)}
      onComplete={() => router.back()}
      onCancel={() => router.back()}
    />
  );
}
