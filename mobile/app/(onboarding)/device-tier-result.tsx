/**
 * Device Tier Result route — Onboarding step 7/10.
 * Route: /onboarding/device-tier-result
 *
 * Per Article 12 §3.7: Show device tier result.
 *
 * Device tier detection runs in background as soon as LANG_PICK
 * completes (started by OnboardingProvider). This screen reads the
 * cached result and displays it immediately — no blocking spinner.
 *
 * If detection hasn't finished yet (race condition), fall back to a
 * brief "Checking..." state that resolves as soon as the background
 * task finishes.
 */

import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../../src/onboarding';

const TIER_LABELS: Record<string, { label: string; desc: string; icon: string }> = {
  high: { label: 'High Performance', desc: 'Full AI model (~4.5 GB) — fastest responses', icon: '⚡' },
  mid: { label: 'Standard', desc: 'Optimized AI model (~1.7 GB) — great balance', icon: '🔄' },
  unsupported: { label: 'Unsupported', desc: 'This device does not meet minimum requirements', icon: '⚠️' },
};

export default function DeviceTierResultRoute() {
  const { t } = useTranslation();
  const { goNext, state } = useOnboarding();
  const [isWaiting, setIsWaiting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // If background detection hasn't resolved yet, poll for up to 5s
  useEffect(() => {
    if (state.deviceTier !== null) {
      if (pollRef.current) clearInterval(pollRef.current);
      setIsWaiting(false);
      return;
    }

    setIsWaiting(true);
    pollRef.current = setInterval(() => {
      // Detection is handled by OnboardingProvider's background effect
      // The state will update automatically when it completes
      // If it takes too long, let the user know
    }, 500);

    // Safety timeout — show fallback after 5s
    const timeout = setTimeout(() => {
      if (pollRef.current) clearInterval(pollRef.current);
      setIsWaiting(false);
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      clearTimeout(timeout);
    };
  }, [state.deviceTier]);

  const handleContinue = useCallback(() => {
    goNext();
  }, [goNext]);

  // Waiting state — tier detection still in progress
  if (state.deviceTier === null || isWaiting) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.checkingTitle}>
            {t('deviceTierResult.loading', 'Checking device capabilities...')}
          </Text>
          <Text style={styles.checkingBody}>
            This happens automatically and will only take a moment.
          </Text>
        </View>
      </View>
    );
  }

  // Unsupported device
  if (state.deviceTier === 'unsupported') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.tierIcon}>⚠️</Text>
          <Text style={styles.title}>Unsupported Device</Text>
          <Text style={styles.body}>
            This device does not meet the minimum requirements to run the AI tutor.
            Please try on a newer device with at least 4 GB of RAM.
          </Text>
        </View>
      </View>
    );
  }

  // Known tier — show result
  const info = TIER_LABELS[state.deviceTier] ?? TIER_LABELS.mid;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.tierIcon}>{info.icon}</Text>
        <Text style={styles.title}>{info.label}</Text>
        <Text style={styles.body}>{info.desc}</Text>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardIcon}>🧠</Text>
            <Text style={styles.cardLabel}>
              AI Model: {state.deviceTier === 'high' ? 'Gemma 2B + NMT' : 'Gemma 0.5B + NMT'}
            </Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardIcon}>🔒</Text>
            <Text style={styles.cardLabel}>
              All AI runs on-device. Your data never leaves this device.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.btnPrimaryText}>
            {t('common.continue', 'Continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 48,
    alignItems: 'center',
  },

  checkingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  checkingBody: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },

  tierIcon: {
    fontSize: 56,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 36,
    paddingHorizontal: 8,
  },

  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 36,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cardIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  cardLabel: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 20,
    fontWeight: '500',
    flex: 1,
  },

  btnPrimary: {
    width: '100%',
    maxWidth: 400,
    height: 56,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
