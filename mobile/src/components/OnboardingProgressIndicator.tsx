/**
 * OnboardingProgressIndicator — Shows step X of N progress for onboarding flow.
 *
 * Usage:
 * ```tsx
 * <OnboardingProgressIndicator currentStep={2} totalSteps={7} />
 * ```
 *
 * Renders:
 * - Text: "Step 2 of 7"
 * - Dot indicators: filled for completed/current, empty for remaining
 * - Bilingual: auto-localises text via i18n
 * - Accessibility: announces current step on mount
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, AccessibilityInfo } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TextStyle } from 'react-native';

interface OnboardingProgressIndicatorProps {
  /** Current step number (1-indexed) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
}

export default function OnboardingProgressIndicator({
  currentStep,
  totalSteps,
}: OnboardingProgressIndicatorProps) {
  const { t } = useTranslation();

  // Announce step change for screen readers (graceful in test env)
  useEffect(() => {
    try {
      AccessibilityInfo.announceForAccessibility(
        t('onboarding.progress.accessibility', {
          current: currentStep,
          total: totalSteps,
          defaultValue: `Step ${currentStep} of ${totalSteps}`,
        }),
      );
    } catch {
      // Silently skip in test environments where AccessibilityInfo may not be available
    }
  }, [currentStep, totalSteps, t]);

  // Build dot array
  const dots = Array.from({ length: totalSteps }, (_, i) => {
    const stepNum = i + 1;
    if (stepNum < currentStep) return 'completed';
    if (stepNum === currentStep) return 'current';
    return 'pending';
  });

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 1,
        max: totalSteps,
        now: currentStep,
        text: t('onboarding.progress.accessibility', {
          current: currentStep,
          total: totalSteps,
          defaultValue: `Step ${currentStep} of ${totalSteps}`,
        }),
      }}
    >
      <Text style={styles.stepText}>
        {t('onboarding.progress.step', {
          current: currentStep,
          total: totalSteps,
          defaultValue: `Step ${currentStep} of ${totalSteps}`,
        })}
      </Text>
      <View style={styles.dotsContainer}>
        {dots.map((state, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              state === 'completed' && styles.dotCompleted,
              state === 'current' && styles.dotCurrent,
              state === 'pending' && styles.dotPending,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  } as TextStyle,
  stepText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
    letterSpacing: 0.3,
  } as TextStyle,
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotCompleted: {
    backgroundColor: '#4A90D9',
  },
  dotCurrent: {
    backgroundColor: '#4A90D9',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotPending: {
    backgroundColor: '#D1D5DB',
  },
});
