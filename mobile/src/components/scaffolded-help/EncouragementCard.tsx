/**
 * EncouragementCard — motivational card shown at the top of the result screen.
 *
 * Kid-friendly, bilingual (EN / zh-Hans via i18n).
 * No analytics, no network calls.
 *
 * @see ADD §4.1 — Camera homework check flow
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

// ── Types ──────────────────────────────────────────────────────────

export interface EncouragementCardProps {
  title: string;
  body: string;
}

// ── Component ──────────────────────────────────────────────────────

export default function EncouragementCard({
  title,
  body,
}: EncouragementCardProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: isDark ? '#1A2A3A' : '#E8F4FD' },
      ]}
      accessibilityLabel={`Encouragement: ${title}`}
      accessibilityRole="text"
    >
      <Text style={styles.icon}>💪</Text>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
          {title}
        </Text>
        <Text style={[styles.body, { color: isDark ? '#B0B0B0' : '#555555' }]}>
          {body}
        </Text>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    gap: 12,
    alignItems: 'center',
  },
  icon: { fontSize: 28 },
  textBlock: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700' as const, marginBottom: 4 },
  body: { fontSize: 13, lineHeight: 18 },
});
