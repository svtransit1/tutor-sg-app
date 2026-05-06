/**
 * TypingIndicator — animated "AI is thinking..." indicator.
 *
 * Three bouncing dots with an optional label.
 * Uses setInterval-based opacity toggle (avoids RN Animated.loop issues in tests).
 * Kid-friendly, bilingual via i18n (caller passes translated label).
 *
 * @see ADD §4.1 — Follow-up chat (processing state)
 * @see ADD §9 — Quality bars (accessibility)
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

export interface TypingIndicatorProps {
  /** Label shown beside the dots. Default: "Thinking" / "思考中" should be passed. */
  label?: string;
}

function Dot({ index }: { index: number }) {
  const [active, setActive] = useState(index === 0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => !prev);
    }, 400 + index * 200);
    return () => clearInterval(interval);
  }, [index]);

  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.dot,
        {
          backgroundColor: isDark ? '#90CAF9' : '#4A90D9',
          opacity: active ? 1 : 0.3,
        },
      ]}
    />
  );
}

export default function TypingIndicator({ label }: TypingIndicatorProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[styles.container, { backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6' }]}
      accessibilityLabel={label ?? 'Tutor is thinking…'}
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
    >
      {label && (
        <Text style={[styles.label, { color: isDark ? '#AAAAAA' : '#6B7280' }]}>
          {label}
        </Text>
      )}
      <View style={styles.dotsRow}>
        <Dot index={0} />
        <Dot index={1} />
        <Dot index={2} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    maxWidth: '75%',
  },
  label: { fontSize: 13, fontWeight: '500' },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
