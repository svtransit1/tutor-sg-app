/**
 * SolutionSection — displays the full solution for a question.
 *
 * Shown only after kid explicitly requests it (after steps revealed).
 * Kid-friendly, bilingual via i18n (caller passes translated strings).
 * No analytics, no network calls.
 *
 * @see ADD §4.1 — Camera homework check flow (full answer only on demand)
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

// ── Types ──────────────────────────────────────────────────────────

export interface SolutionSectionProps {
  solution: string;
  /** i18n label for "Full solution" heading */
  headingLabel: string;
}

// ── Component ──────────────────────────────────────────────────────

export default function SolutionSection({
  solution,
  headingLabel,
}: SolutionSectionProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#1A3A1A' : '#F0FFF0' },
      ]}
      accessibilityLabel={`${headingLabel}`}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>✅</Text>
        <Text style={[styles.heading, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
          {headingLabel}
        </Text>
      </View>
      <Text style={[styles.body, { color: isDark ? '#CCCCCC' : '#2E7D32' }]}>
        {solution}
      </Text>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 10,
    gap: 8,
    marginTop: 4,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  icon: { fontSize: 16 },
  heading: { fontSize: 15, fontWeight: '700' as const },
  body: { fontSize: 14, lineHeight: 20 },
});
