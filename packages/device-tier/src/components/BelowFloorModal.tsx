import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BELOW_FLOOR_MESSAGES } from '../types';

interface BelowFloorModalProps {
  visible: boolean;
  language?: 'en' | 'zh' | 'zh-Hans';
}

const LANG_MAP: Record<string, 'en' | 'zh'> = {
  en: 'en',
  zh: 'zh',
  'zh-Hans': 'zh',
};

export function BelowFloorModal({ visible, language = 'en' }: BelowFloorModalProps) {
  if (!visible) return null;
  const lang = LANG_MAP[language] ?? 'en';
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.text}>
        {lang === 'zh' ? BELOW_FLOOR_MESSAGES.zh : BELOW_FLOOR_MESSAGES.en}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff3e0', borderRadius: 8 },
  text: { fontSize: 16, color: '#e65100', textAlign: 'center' },
});
