/**
 * StepsSection — displays step-by-step guide for a question.
 *
 * Each step has a numbered circle, description, and optional working box.
 * Kid-friendly, bilingual via i18n (caller passes translated strings).
 * No analytics, no network calls.
 *
 * @see ADD §4.1 — Camera homework check flow
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme, Platform } from 'react-native';

// ── Types ──────────────────────────────────────────────────────────

export interface Step {
  step: number;
  description: string;
  working?: string;
}

export interface StepsSectionProps {
  steps: Step[];
  /** i18n label for "Step-by-step guide" heading */
  headingLabel: string;
}

// ── Component ──────────────────────────────────────────────────────

export default function StepsSection({
  steps,
  headingLabel,
}: StepsSectionProps) {
  const isDark = useColorScheme() === 'dark';

  if (steps.length === 0) return null;

  return (
    <View style={styles.container} accessibilityLabel={`${headingLabel}: ${steps.length} steps`}>
      <View style={styles.header}>
        <Text style={styles.icon}>📝</Text>
        <Text style={[styles.heading, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
          {headingLabel}
        </Text>
      </View>
      {steps.map((step) => (
        <View key={step.step} style={styles.stepRow}>
          <View
            style={[
              styles.stepCircle,
              { backgroundColor: isDark ? '#2A4A7A' : '#E8F4FD' },
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                { color: isDark ? '#90CAF9' : '#2563EB' },
              ]}
            >
              {step.step}
            </Text>
          </View>
          <View style={styles.stepContent}>
            <Text
              style={[
                styles.stepDescription,
                { color: isDark ? '#CCCCCC' : '#4A5568' },
              ]}
            >
              {step.description}
            </Text>
            {step.working && (
              <View
                style={[
                  styles.workingBox,
                  { backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB' },
                ]}
              >
                <Text
                  style={[
                    styles.workingText,
                    { color: isDark ? '#90CAF9' : '#2563EB' },
                  ]}
                >
                  {step.working}
                </Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { gap: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  icon: { fontSize: 16 },
  heading: { fontSize: 15, fontWeight: '700' as const },

  stepRow: { flexDirection: 'row', gap: 10, paddingLeft: 2 },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumber: { fontSize: 12, fontWeight: '700' as const },
  stepContent: { flex: 1, gap: 4, paddingBottom: 8 },
  stepDescription: { fontSize: 14, lineHeight: 20 },
  workingBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  workingText: {
    fontSize: 14,
    fontWeight: '500' as const,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' as const,
  },
});
