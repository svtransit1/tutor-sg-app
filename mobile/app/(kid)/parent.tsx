/**
 * Parent tab route — PIN-gated entry to the parent area.
 *
 * Flow:
 * 1. On mount, checks if PIN exists in secure storage
 * 2. If no PIN set → shows PIN setup flow
 * 3. If PIN exists → shows PIN entry overlay
 * 4. On correct PIN → navigates to /parent/ (modal stack)
 * 5. On dismiss → returns to previous tab
 *
 * Per ADD §5.2: 4-digit PIN, 5 failed attempts → 60s cooldown.
 * Bilingual EN + zh-Hans. VoiceOver/TalkBack accessible.
 */
import React, { useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { usePinGate } from '../../src/hooks/usePinGate';
import PinGateOverlay from '../../src/components/PinGateOverlay';
import PinSetupScreen from '../../src/components/PinSetupScreen';

export default function ParentTabRoute() {
  const { t } = useTranslation();
  const router = useRouter();
  const pinGate = usePinGate();
  const hasChecked = useRef(false);

  // Check PIN on mount
  useEffect(() => {
    if (!hasChecked.current) {
      hasChecked.current = true;
      pinGate.checkPin();
    }
  }, [pinGate.checkPin]);

  // Show PIN entry when hasPin is true (PIN exists)
  useEffect(() => {
    if (pinGate.hasPin === true) {
      pinGate.showPinEntry();
    }
  }, [pinGate.hasPin]);

  // Handle successful PIN verification
  const handleVerified = useCallback(() => {
    router.push('/parent/');
  }, [router]);

  // Handle dismiss (cancel) of PIN entry — go back to home tab
  const handleDismiss = useCallback(() => {
    router.replace('/(kid)/home');
  }, [router]);

  // Handle PIN setup completion (first time) — navigate to parent area
  const handleSetupComplete = useCallback(() => {
    router.push('/parent/');
  }, [router]);

  // Handle skip of PIN setup
  const handleSkipSetup = useCallback(() => {
    pinGate.skipSetup();
    router.replace('/(kid)/home');
  }, [pinGate, router]);

  // Loading state — checking PIN
  if (pinGate.hasPin === null) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* First-time PIN setup */}
      {pinGate.hasPin === false && pinGate.needsSetup && (
        <PinSetupScreen
          actions={pinGate}
          onComplete={handleSetupComplete}
          onSkip={handleSkipSetup}
        />
      )}

      {/* PIN entry overlay (subsequent visits) */}
      {pinGate.hasPin === true && (
        <PinGateOverlay
          state={pinGate}
          actions={pinGate}
          onVerified={handleVerified}
          onDismiss={handleDismiss}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
  },
});
