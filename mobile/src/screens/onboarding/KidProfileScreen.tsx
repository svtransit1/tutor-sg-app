/**
 * KidProfileScreen — onboarding step for entering child's name and language preference.
 *
 * Purpose: Parent enters the child's display name and selects preferred language.
 * Creates a local KidProfile record persisted to SQLite.
 * Validates name is non-empty before proceeding.
 * Bilingual (EN + zh-Hans). Kid-safe (no data leaves device).
 *
 * @see AAAS-229
 * @see ADD §4 — Core features
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import type { Locale } from '@tutor-sg/shared/i18n';
import { persistLocale } from '../../storage/onboarding-state';

// ── Types ──────────────────────────────────────────────────────────

export interface KidProfileData {
  id: string;
  name: string;
  preferredLanguage: Locale;
  createdAt: string;
}

interface KidProfileScreenProps {
  gradeLabel: string;
  /** Called when profile is saved */
  onComplete?: (profile: KidProfileData) => void;
  /** Called when navigated back */
  onBack?: () => void;
}

// ── Component ──────────────────────────────────────────────────────

export default function KidProfileScreen({
  gradeLabel,
  onComplete,
  onBack,
}: KidProfileScreenProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';

  const [name, setName] = useState('');
  const [language, setLanguage] = useState<Locale>('en');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ── Colors ──────────────────────────────────────────────────

  const bgColor = isDark ? '#121212' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const mutedColor = isDark ? '#AAAAAA' : '#6B7280';
  const inputBg = isDark ? '#1E1E1E' : '#F9FAFB';
  const inputBorder = isDark ? '#333333' : '#E5E7EB';
  const focusedBorder = '#4A90D9';
  const errorColor = '#DC2626';

  // ── Handlers ─────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('onboarding.kidProfile.nameRequired'));
      return;
    }

    setError(null);
    setSaving(true);

    // Persist language preference
    persistLocale(language);

    const profile: KidProfileData = {
      id: uuidv4(),
      name: trimmed,
      preferredLanguage: language,
      createdAt: new Date().toISOString(),
    };

    onComplete?.(profile);
  }, [name, language, t, onComplete]);

  // ── Render ──────────────────────────────────────────────────

  const isRtl = language === 'zh-Hans'; // zh text may need subtle RTL considerations

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bgColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <Text style={[styles.title, { color: textColor }]}>
          {t('onboarding.kidProfile.title')}
        </Text>
        <Text style={[styles.subtitle, { color: mutedColor }]}>
          {gradeLabel}
        </Text>

        {/* Name input */}
        <Text style={[styles.inputLabel, { color: textColor }]}>
          {t('onboarding.kidProfile.namePlaceholder')}
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: inputBg,
              borderColor: error ? errorColor : inputBorder,
              color: textColor,
            },
          ]}
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (error) setError(null);
          }}
          placeholder={t('onboarding.kidProfile.namePlaceholder')}
          placeholderTextColor={mutedColor}
          autoFocus
          maxLength={50}
          returnKeyType="done"
          onSubmitEditing={handleSave}
          accessibilityLabel={t('onboarding.kidProfile.accessibility.nameInput')}
        />
        {error && (
          <Text style={[styles.errorText, { color: errorColor }]}>
            {error}
          </Text>
        )}

        {/* Language preference selector */}
        <Text style={[styles.sectionLabel, { color: textColor, marginTop: 32 }]}>
          {t('onboarding.kidProfile.languageLabel')}
        </Text>

        <View style={styles.languageRow}>
          <TouchableOpacity
            style={[
              styles.languageChip,
              {
                backgroundColor: language === 'en'
                  ? '#E3F2FD'
                  : inputBg,
                borderColor: language === 'en'
                  ? '#4A90D9'
                  : inputBorder,
              },
            ]}
            onPress={() => setLanguage('en')}
            accessibilityRole="radio"
            accessibilityState={{ selected: language === 'en' }}
            accessibilityLabel={t('onboarding.kidProfile.accessibility.languageEn')}
          >
            <Text
              style={[
                styles.languageText,
                {
                  color: language === 'en' ? '#1565C0' : textColor,
                  fontWeight: language === 'en' ? '700' : '400',
                },
              ]}
            >
              {t('onboarding.kidProfile.languageEn')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageChip,
              {
                backgroundColor: language === 'zh-Hans'
                  ? '#E3F2FD'
                  : inputBg,
                borderColor: language === 'zh-Hans'
                  ? '#4A90D9'
                  : inputBorder,
              },
            ]}
            onPress={() => setLanguage('zh-Hans')}
            accessibilityRole="radio"
            accessibilityState={{ selected: language === 'zh-Hans' }}
            accessibilityLabel={t('onboarding.kidProfile.accessibility.languageZh')}
          >
            <Text
              style={[
                styles.languageText,
                {
                  color: language === 'zh-Hans' ? '#1565C0' : textColor,
                  fontWeight: language === 'zh-Hans' ? '700' : '400',
                },
              ]}
            >
              {t('onboarding.kidProfile.languageZh')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: name.trim() ? '#4A90D9' : inputBorder,
            },
          ]}
          onPress={handleSave}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.kidProfile.save')}
        >
          <Text style={styles.saveButtonText}>
            {saving ? t('common.loading', 'Saving…') : t('onboarding.kidProfile.save')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    lineHeight: 22,
  },
  errorText: {
    fontSize: 13,
    marginTop: 6,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  languageRow: {
    flexDirection: 'row',
    gap: 12,
  },
  languageChip: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageText: {
    fontSize: 16,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
