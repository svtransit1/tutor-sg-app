/**
 * Language Pick route — Onboarding step 2/10.
 * Route: /onboarding/lang-pick
 *
 * Per Article 12 §3.2: Two large tiles. Equal weight. Tap = commit.
 * Language is persisted immediately because all subsequent screens need it.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../../src/onboarding';
import { persistLocale } from '../../src/storage/onboarding-state';

export default function LangPickRoute() {
  const { goNext, updateState } = useOnboarding();
  const { i18n } = useTranslation();

  const handleSelect = useCallback(
    (locale: 'en' | 'zh-Hans') => {
      // Persist immediately
      persistLocale(locale);
      i18n.changeLanguage(locale);

      // Update state machine
      updateState({ locale });

      // Advance to next step
      goNext();
    },
    [goNext, updateState, i18n],
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Choose your language / 选择语言
        </Text>
        <Text style={styles.subtitle}>
          Your app will use this language. / 应用将使用此语言。
        </Text>

        <View style={styles.tiles}>
          {/* English tile */}
          <TouchableOpacity
            style={styles.tile}
            onPress={() => handleSelect('en')}
            accessibilityRole="button"
            accessibilityLabel="English"
            activeOpacity={0.7}
          >
            <Text style={styles.tilePrimary}>English</Text>
            <Text style={styles.tileSecondary}>英文</Text>
          </TouchableOpacity>

          {/* Chinese tile */}
          <TouchableOpacity
            style={styles.tile}
            onPress={() => handleSelect('zh-Hans')}
            accessibilityRole="button"
            accessibilityLabel="中文"
            activeOpacity={0.7}
          >
            <Text style={styles.tilePrimary}>中文（简体）</Text>
            <Text style={styles.tileSecondary}>中文 (简体)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 48,
  },
  tiles: {
    width: '100%',
    maxWidth: 400,
    gap: 20,
  },
  tile: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  tilePrimary: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  tileSecondary: {
    fontSize: 16,
    color: '#6B7280',
  },
});
