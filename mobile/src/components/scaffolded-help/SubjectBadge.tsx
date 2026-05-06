/**
 * SubjectBadge — displays subject icon + colour-coded badge.
 *
 * Kid-friendly, bilingual (EN / zh-Hans).
 * No analytics, no network calls.
 *
 * @see ADD §4.1 — Camera homework check flow
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// ── Types ──────────────────────────────────────────────────────────

export type SubjectKey = 'math' | 'english' | 'science' | 'chinese_mt';

export interface SubjectBadgeProps {
  subject: SubjectKey;
  /** Override label text (shown as-is, bilingual callers handle i18n) */
  label: string;
}

// ── Subject Metadata (colours + icons only) ────────────────────────

export const SUBJECT_META: Record<
  SubjectKey,
  { icon: string; color: string }
> = {
  math: { icon: '🧮', color: '#E8F5E9' },
  english: { icon: '📖', color: '#E3F2FD' },
  science: { icon: '🔬', color: '#FFF3E0' },
  chinese_mt: { icon: '🀄', color: '#FCE4EC' },
};

// ── Component ──────────────────────────────────────────────────────

export default function SubjectBadge({ subject, label }: SubjectBadgeProps) {
  const meta = SUBJECT_META[subject];

  return (
    <View
      style={[styles.badge, { backgroundColor: meta.color }]}
      accessibilityLabel={`${label} subject`}
      accessibilityRole="text"
    >
      <Text style={styles.icon}>{meta.icon}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  icon: { fontSize: 14 },
  label: { fontSize: 12, fontWeight: '600' as const, color: '#1A1A1A' },
});
