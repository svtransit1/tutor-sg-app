import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Speech from 'expo-speech';

export type ReadAloudState = 'idle' | 'speaking' | 'stopped';

export interface ReadAloudButtonProps {
  text: string;
  language?: string;
  rate?: number;
  onDone?: () => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: ReadAloudState) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

function detectLanguage(text: string): string {
  if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(text)) {
    return 'zh-CN';
  }
  return 'en-US';
}

export default function ReadAloudButton({
  text,
  language,
  rate = 0.88,
  onDone,
  onError,
  onStateChange,
  disabled = false,
  style,
}: ReadAloudButtonProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const [state, setState] = useState<ReadAloudState>('idle');
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const updateState = useCallback(
    (next: ReadAloudState) => {
      if (!mountedRef.current) return;
      setState(next);
      onStateChange?.(next);
    },
    [onStateChange],
  );

  const handlePress = useCallback(() => {
    if (disabled || !text) return;

    if (state === 'speaking') {
      Speech.stop();
      updateState('idle');
      return;
    }

    const lang = language ?? detectLanguage(text);

    updateState('speaking');

    Speech.speak(text, {
      language: lang,
      rate,
      onDone: () => {
        if (!mountedRef.current) return;
        updateState('idle');
        onDone?.();
      },
      onError: (err: unknown) => {
        if (!mountedRef.current) return;
        updateState('idle');
        const error = err instanceof Error ? err : new Error(String(err));
        onError?.(error);
      },
      onStopped: () => {
        if (!mountedRef.current) return;
        updateState('idle');
      },
    });
  }, [disabled, text, state, language, rate, updateState, onDone, onError]);

  const isInteractive = !disabled && text.length > 0;

  const bgColor = isDark ? '#1E1E1E' : '#F3F4F6';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const mutedColor = isDark ? '#888888' : '#9CA3AF';

  function renderIcon() {
    if (state === 'speaking') {
      return <Text style={styles.speakerIcon}>🔉</Text>;
    }
    return <Text style={styles.speakerIcon}>🔊</Text>;
  }

  function renderLabel() {
    if (state === 'speaking') {
      return (
        <Text style={[styles.label, { color: textColor }]}>
          {t('homeworkFeedback.stopSpeaking')}
        </Text>
      );
    }
    return (
      <Text style={[styles.label, { color: mutedColor }]}>
        {t('homeworkFeedback.speakContent')}
      </Text>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          borderColor: isDark ? '#333' : '#E5E7EB',
          opacity: isInteractive ? 1 : 0.4,
        },
        state === 'speaking' && {
          backgroundColor: isDark ? '#1A2A3A' : '#E8F4FD',
          borderColor: '#2563EB',
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        disabled={!isInteractive}
        activeOpacity={0.7}
        style={styles.button}
        testID="ReadAloudButton"
        accessibilityRole="button"
        accessibilityLabel={
          state === 'speaking'
            ? t('homeworkFeedback.accessibility.stopSpeaking')
            : t('homeworkFeedback.accessibility.speakContent')
        }
        accessibilityState={{ disabled: !isInteractive }}
      >
        <View style={styles.inner}>
          {renderIcon()}
          {renderLabel()}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderWidth: 1.5,
    overflow: 'hidden',
  } satisfies ViewStyle,

  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  } satisfies ViewStyle,

  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  } satisfies ViewStyle,

  speakerIcon: {
    fontSize: 16,
  } satisfies TextStyle,

  label: {
    fontSize: 13,
    fontWeight: '600',
  } satisfies TextStyle,
});
