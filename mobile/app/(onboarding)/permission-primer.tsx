/**
 * Permission Primer route — Onboarding step 8/10.
 * Route: /onboarding/permission-primer
 *
 * Per Article 12 §3.8: Soft-ask camera + notification permissions
 * with WHY copy before the OS system prompt.
 * Both deferrable. Non-blocking.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../../src/onboarding';

export default function PermissionPrimerRoute() {
  const { t } = useTranslation();
  const { goNext, updateState, state } = useOnboarding();

  const [cameraGranted, setCameraGranted] = useState(state.cameraPermissionGranted);
  const [notifGranted, setNotifGranted] = useState(state.notificationPermissionGranted);
  const [step, setStep] = useState<'camera' | 'notifications' | 'done'>('camera');

  const handleCameraAllow = useCallback(() => {
    // In a real app, this fires the OS system prompt.
    // For now, we optimistically mark it as granted.
    // TODO: Wire real expo-camera permission request
    setCameraGranted(true);
    setStep('notifications');
  }, []);

  const handleCameraNotNow = useCallback(() => {
    setStep('notifications');
  }, []);

  const handleNotifAllow = useCallback(() => {
    // TODO: Wire real expo-notifications permission request
    setNotifGranted(true);
    setStep('done');
  }, []);

  const handleNotifNotNow = useCallback(() => {
    setStep('done');
  }, []);

  const handleContinue = useCallback(() => {
    updateState({
      cameraPermissionGranted: cameraGranted,
      notificationPermissionGranted: notifGranted,
    });
    goNext();
  }, [cameraGranted, notifGranted, goNext, updateState]);

  if (step === 'done') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>✅</Text>
          </View>
          <Text style={styles.title}>
            {t('common.done', 'All set!')}
          </Text>
          <Text style={styles.body}>
            {cameraGranted && notifGranted
              ? 'You can always change permissions later in Settings.'
              : 'You can enable permissions later in Settings.'}
          </Text>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.btnPrimaryText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isCamera = step === 'camera';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{isCamera ? '📷' : '🔔'}</Text>
        </View>

        <Text style={styles.title}>
          {isCamera
            ? t('cameraScreen.permission.title', 'Camera access needed')
            : 'Notifications'}
        </Text>

        <Text style={styles.body}>
          {isCamera
            ? t('cameraScreen.permission.description', "We need camera access so you can take photos of your homework. Your photos never leave this device.")
            : "We'll send a gentle weekly summary to you (the parent), so you can see how your child is doing. No spam."}
        </Text>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={isCamera ? handleCameraAllow : handleNotifAllow}
          activeOpacity={0.8}
        >
          <Text style={styles.btnPrimaryText}>
            {isCamera
              ? t('cameraScreen.permission.cta', 'Enable camera access')
              : 'Allow notifications'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnNotNow}
          onPress={isCamera ? handleCameraNotNow : handleNotifNotNow}
          activeOpacity={0.7}
        >
          <Text style={styles.btnNotNowText}>
            {t('common.cancel', 'Not now')}
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
    justifyContent: 'center',
  },

  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  icon: { fontSize: 40 },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 8,
  },

  btnPrimary: {
    width: '100%',
    maxWidth: 400,
    height: 56,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

  btnNotNow: {
    width: '100%',
    maxWidth: 400,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  btnNotNowText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
} as TextStyle);
