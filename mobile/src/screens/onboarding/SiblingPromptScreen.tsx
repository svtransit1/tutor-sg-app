/**
 * SiblingPromptScreen — onboarding step 6/11: "Add another child?" prompt.
 *
 * Per ADD §6 (Family plan) and Article 08 (The One Metric):
 * Surfaces family-plan intent early (north-star metric).
 * Defaults to skip. Logs intent signal for later IAP upsell.
 *
 * Two buttons:
 * - "Add another child" → fires add intent + calls onAdd()
 * - "Not now" → fires skip intent + calls onSkip()
 *
 * Bilingual EN + zh-Hans. Kid-safe (no data leaving device).
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { persistSiblingIntent } from '../../storage/onboarding-state';

// ── Props ──────────────────────────────────────────────────────────

interface SiblingPromptScreenProps {
  /** Called when user taps "Add another child". */
  onAdd?: () => void;
  /** Called when user taps "Not now". */
  onSkip?: () => void;
}

// ── Component ──────────────────────────────────────────────────────

export default function SiblingPromptScreen({
  onAdd,
  onSkip,
}: SiblingPromptScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const handleAdd = useCallback(() => {
    persistSiblingIntent(true);
    onAdd?.();
  }, [onAdd]);

  const handleSkip = useCallback(() => {
    persistSiblingIntent(false);
    onSkip?.();
  }, [onSkip]);

  // ── Render ───────────────────────────────────────────────────

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.content}>
        {/* Icon / illustration area */}
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>👨‍👩‍👧‍👦</Text>
        </View>

        {/* Title */}
        <Text style={styles.title} accessibilityRole="header">
          {t('onboarding.siblingPrompt.title')}
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {t('onboarding.siblingPrompt.subtitle')}
        </Text>

        {/* Buttons */}
        <View style={styles.buttons}>
          {/* Primary — add another child */}
          <Pressable
            style={({ pressed }) => [
              styles.btnPrimary,
              pressed && styles.btnPrimaryPressed,
            ]}
            onPress={handleAdd}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.siblingPrompt.addHint')}
          >
            <Text style={styles.btnPrimaryText}>
              + {t('onboarding.siblingPrompt.addAnother')}
            </Text>
          </Pressable>

          {/* Secondary — skip */}
          <Pressable
            style={({ pressed }) => [
              styles.btnSecondary,
              pressed && styles.btnSecondaryPressed,
            ]}
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.siblingPrompt.skipHint')}
          >
            <Text style={styles.btnSecondaryText}>
              {t('onboarding.siblingPrompt.skip')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Icon
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  icon: {
    fontSize: 44,
  },

  // Title
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
  },

  // Subtitle
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 16,
  },

  // Buttons
  buttons: {
    width: '100%',
    maxWidth: 400,
    gap: 14,
    alignItems: 'center',
  },

  // Primary button
  btnPrimary: {
    width: '100%',
    height: 56,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryPressed: {
    backgroundColor: '#1D4ED8',
    opacity: 0.9,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

  // Secondary button
  btnSecondary: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryPressed: {
    backgroundColor: '#F9FAFB',
    borderColor: '#9CA3AF',
  },
  btnSecondaryText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
} as TextStyle);
