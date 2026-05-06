/**
 * Splash route — Onboarding step 1/10.
 * Route: /onboarding/splash
 *
 * Per Article 12 §3.1: Brand mark, no copy. 200ms hard cap.
 * If app was killed mid-download, on cold restart go straight to model-download.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useOnboarding } from '../../src/onboarding';

export default function SplashRoute() {
  const { goNext, state } = useOnboarding();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    // Check if we should resume from model download mid-progress
    const wasMidDownload = state.steps['model_download'] === 'in_progress' &&
      state.currentStep !== 'model_download';

    const delay = wasMidDownload ? 0 : 200; // Skip delay if resuming download

    const timer = setTimeout(() => {
      goNext();
    }, delay);

    return () => clearTimeout(timer);
  }, [goNext, state]);

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>tutor-sg</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563EB',
  },
  brand: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
