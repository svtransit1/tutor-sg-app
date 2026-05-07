/**
 * Root index — first screen the app renders.
 *
 * The OnboardingProvider's internal useEffect handles navigation
 * to the correct onboarding or kid screen once initialized.
 * This screen shows a branded skeleton loading state while
 * i18n and the onboarding provider hydrate.
 *
 * @see ADD §3.5 — First-launch model download
 * @see ADD §12 — Milestones, M2
 */

import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  SkeletonCircle,
  SkeletonLine,
  SkeletonBox,
} from '../src/components';

export default function RootIndexScreen() {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const bg = isDark ? '#121212' : '#FFFFFF';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Brand mark */}
      <SkeletonBox
        width={80}
        height={80}
        borderRadius={20}
        style={styles.logo}
        isDark={isDark}
      />

      {/* App name */}
      <SkeletonLine
        width={180}
        height={28}
        style={styles.appName}
        isDark={isDark}
      />

      {/* Tagline skeleton */}
      <SkeletonLine
        width={140}
        height={14}
        style={styles.tagline}
        isDark={isDark}
      />

      {/* Progress dots indicator */}
      <View style={styles.dotsRow} accessibilityRole="image" accessibilityLabel={t('app.loading')}>
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBox
            key={i}
            width={i === 1 ? 28 : 8}
            height={8}
            borderRadius={4}
            style={{ marginHorizontal: 4 }}
            isDark={isDark}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    marginBottom: 20,
  },
  appName: {
    marginBottom: 12,
  },
  tagline: {
    marginBottom: 48,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
