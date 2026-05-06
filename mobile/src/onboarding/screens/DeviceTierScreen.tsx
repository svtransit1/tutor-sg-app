import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { useOnboarding } from '../OnboardingProvider';
import { useTranslation } from 'react-i18next';

function detectDeviceTier(): 'high' | 'mid' | 'unsupported' {
  // TODO: Replace with native module for accurate RAM/NPU detection.
  // iOS: NSProcessInfo.processInfo.physicalMemory via native module
  // Android: /proc/meminfo + ActivityManager.MemoryInfo via native module
  // For now, use a heuristic based on platform.
  if (Platform.OS === 'ios') {
    // iOS devices that support iOS 16+ are generally capable
    return 'high';
  }
  // Android — assume mid for now; native module will refine
  return 'mid';
}

export function DeviceTierScreen() {
  const { t } = useTranslation();
  const { goNext, goBack, updateProgress } = useOnboarding();
  const [checking, setChecking] = useState(true);
  const [tier, setTier] = useState<'high' | 'mid' | 'unsupported'>('mid');

  useEffect(() => {
    const detected = detectDeviceTier();
    setTier(detected);
    const timer = setTimeout(() => {
      updateProgress({ deviceTier: detected });
      setChecking(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4A90D9" />
        <Text style={styles.subtitle}>
          {t('onboarding.deviceTier.checking', 'Checking your device...')}
        </Text>
      </View>
    );
  }

  if (tier === 'unsupported') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          {t('onboarding.deviceTier.unsupported', 'Device Not Supported')}
        </Text>
        <Text style={styles.body}>
          {t(
            'onboarding.deviceTier.unsupportedBody',
            'Your device does not meet the minimum requirements. This app needs a device with at least 4 GB RAM.',
          )}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t('onboarding.deviceTier.title', 'Device Ready!')}
      </Text>
      <Text style={styles.subtitle}>
        {t('onboarding.deviceTier.subtitle', 'Your device can run the AI tutor.')}
      </Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.backButton} onPress={goBack} testID="deviceTier-back">
          <Text style={styles.backButtonText}>{t('onboarding.common.back', 'Back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={goNext} testID="deviceTier-continue">
          <Text style={styles.buttonText}>{t('onboarding.common.next', 'Next')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, marginBottom: 24, textAlign: 'center' },
  body: { fontSize: 16, lineHeight: 24, textAlign: 'center', marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, width: '100%' },
  button: { backgroundColor: '#4A90D9', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 12, flex: 1, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  backButton: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, borderWidth: 1, borderColor: '#ccc', flex: 1, alignItems: 'center' },
  backButtonText: { fontSize: 18, color: '#666' },
});
