/**
 * StreamingText — displays text with a typewriter (character-by-character) animation.
 *
 * Designed for LLM responses so kids see the tutor "writing" in real time.
 * Bilingual-safe: handles both Latin and CJK characters (2x speed for CJK).
 * Accessible: announces full text when complete.
 *
 * @see ADD §4.1 — Camera homework check flow (follow-up chat)
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, useColorScheme, type TextProps } from 'react-native';

export interface StreamingTextProps {
  /** The full text to animate */
  text: string;
  /** Characters per second (default: 30). CJK text auto-adjusts to 2x. */
  speed?: number;
  /** Cursor character to show while streaming (default: "|"). Empty string = no cursor. */
  cursor?: string;
  /** Called when streaming animation completes */
  onComplete?: () => void;
  /** Text style overrides */
  style?: TextProps['style'];
  /** Extra accessibility label (appended after spoken text) */
  accessibilityExtra?: string;
}

export default function StreamingText({
  text,
  speed = 30,
  cursor = '|',
  onComplete,
  style,
  accessibilityExtra,
}: StreamingTextProps) {
  const isDark = useColorScheme() === 'dark';
  const [visibleLen, setVisibleLen] = useState(0);
  const [complete, setComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setVisibleLen(0);
    setComplete(false);

    if (!text) {
      setComplete(true);
      return;
    }

    // Auto-detect whether text is mostly CJK (slower per-char = use 2x speed)
    const cjkCount = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) || []).length;
    const cjkRatio = cjkCount / text.length;
    const adjustedSpeed = cjkRatio > 0.3 ? speed * 2 : speed;
    const delayMs = Math.round(1000 / adjustedSpeed);

    intervalRef.current = setInterval(() => {
      setVisibleLen((prev) => {
        const next = prev + 1;
        if (next >= text.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          setComplete(true);
          onCompleteRef.current?.();
          return text.length;
        }
        return next;
      });
    }, delayMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text, speed]);

  if (!text) return null;

  const visibleText = text.slice(0, visibleLen);
  const showCursor = !complete && cursor && visibleLen < text.length;

  return (
    <Text
      style={[styles.text, { color: isDark ? '#E0E0E0' : '#1A1A1A' }, style]}
      accessibilityLabel={
        complete
          ? text + (accessibilityExtra ? ` — ${accessibilityExtra}` : '')
          : 'Tutor is typing…'
      }
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
    >
      {visibleText}
      {showCursor && (
        <Text style={[styles.cursor, { color: isDark ? '#90CAF9' : '#2563EB' }]}>
          {cursor}
        </Text>
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 15, lineHeight: 22 },
  cursor: { fontSize: 15, fontWeight: '700' },
});
