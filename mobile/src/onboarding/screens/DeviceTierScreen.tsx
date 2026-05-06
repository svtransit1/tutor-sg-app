import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useOnboarding } from '../OnboardingProvider';
import { useTranslation } from 'react-i18next';
import { detectDeviceTier, clearDeviceTierCache, DeviceTierResult } from '../../services/deviceTier';
import type { DeviceTier } from '@tutor-sg/shared';

export function DeviceTierScreen() {
  const { t } = useTranslation();
  const { goNext, goBack, updateProgress } = useOnboarding();
  const [checking, setChecking] = useState(true);
  const [tier, setTier] = useState<DeviceTier>('mid');
  const [result, setResult] = useState<DeviceTierResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const detected = await detectDeviceTier();
        if (cancelled) return;
        setTier(detected.tier);
        setResult(detected);
        updateProgress({ deviceTier: detected.tier });
      } catch {
        if (!cancelled) {
          setTier('mid');
          updateProgress({ deviceTier: 'mid' });
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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

  // Low tier = device below floor per decisions-locked
  if (tier === 'low') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          {t('onboarding.deviceTier.low', 'Device Not Supported')}
        </Text>
        <Text style={styles.body}>
          {t(
            'onboarding.deviceTier.lowBody',
            'Your device does not meet the minimum requirements. This app needs a device with at least 4 GB RAM and 5 GB free storage.',
          )}
        </Text>
      </View>
    );
  }

  const thermalWarning =
    result?.capabilities.thermalHeadroom === 'poor'
      ? t(
          'onboarding.deviceTier.thermalWarning',
          'Your device may slow down during long study sessions.',
        )
      : null;

  const storageWarning =
    result &&
    result.capabilities.freeStorageBytes < 10 * 1024 * 1024 * 1024
      ? t(
          'onboarding.deviceTier.storageWarning',
          'You are low on storage. The AI model needs about 2–5 GB free space.',
        )
      : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t('onboarding.deviceTier.title', 'Device Ready!')}
      </Text>
      <Text style={styles.subtitle}>
        {tier === 'high'
          ? t(
              'onboarding.deviceTier.highSubtitle',
              'Your device can run the most powerful AI tutor.',
            )
          : t(
              'onboarding.deviceTier.midSubtitle',
              'Your device can run the standard AI tutor.',
            )}
      </Text>
      {thermalWarning && (
        <Text style={styles.warningText}>{thermalWarning}</Text>
      )}
      {storageWarning && (
        <Text style={styles.warningText}>{storageWarning}</Text>
      )}
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBack}
          testID="deviceTier-back"
        >
          <Text style={styles.backButtonText}>
            {t('onboarding.common.back', 'Back')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={goNext}
          testID="deviceTier-continue"
        >
          <Text style={styles.buttonText}>
            {t('onboarding.common.next', 'Next')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, marginBottom: 24, textAlign: 'center' },
  body: { fontSize: 16, lineHeight: 24, textAlign: 'center', marginBottom: 24 },
  warningText: {
    fontSize: 14,
    color: '#E8A838',
    backgroundColor: '#FFF8E7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    textAlign: 'center',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
  },
  button: {
    backgroundColor: '#4A90D9',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    flex: 1,
    alignItems: 'center',
  },
  backButtonText: { fontSize: 18, color: '#666' },
});
