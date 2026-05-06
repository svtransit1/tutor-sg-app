/**
 * HintSection — displays the hint for a question.
 *
 * Always visible. Kid-friendly, bilingual (EN / zh-Hans via i18n).
 * No analytics, no network calls.
 *
 * @see ADD §4.1 — Camera homework check flow (hint-first default)
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

// ── Types ──────────────────────────────────────────────────────────

export interface HintSectionProps {
  hint: string;
  /** i18n label for "Hint" heading */
  headingLabel: string;
}

// ── Component ──────────────────────────────────────────────────────

export default function HintSection({ hint, headingLabel }: HintSectionProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.container} accessibilityLabel={`${headingLabel}: ${hint}`}>
      <View style={styles.header}>
        <Text style={styles.icon}>💡</Text>
        <Text style={[styles.heading, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
          {headingLabel}
        </Text>
      </View>
      <Text style={[styles.body, { color: isDark ? '#CCCCCC' : '#4A5568' }]}>
        {hint}
      </Text>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { gap: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  icon: { fontSize: 16 },
  heading: { fontSize: 15, fontWeight: '700' as const },
  body: { fontSize: 14, lineHeight: 20, paddingLeft: 22 },
});
