/**
 * PrivacyPromiseScreen — dedicated onboarding step: privacy promise
 *
 * Appears after device tier detection completes and before model
 * download begins. Prominently surfaces the "data stays on device"
 * promise — our key trust wedge.
 *
 * Users can proceed immediately or tap "Learn more" for the full
 * privacy summary.
 *
 * Per the AC:
 * - Shield icon + headline + 3 bullet promises
 * - Calm, not alarmist tone
 * - Optional "Learn more" expand
 * - This is a marketing surface, not a legal EULA
 *
 * Bilingual (EN + zh-Hans). Kid-safe. Accessible.
 *
 * @see AAAS-259 (M2-58)
 * @see articles/12-first-90s-onboarding-dev-spec.md §3.9
 * @see ADD §4.2 — Privacy promise hard rule
 */

import React, { useCallback } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PrivacyPromisePanel from '../../components/PrivacyPromisePanel';

// ── Props ──────────────────────────────────────────────────────────

interface PrivacyPromiseScreenProps {
  /** Called when user taps "Continue" — proceeds to model download. */
  onContinue?: () => void;
}

// ── Component ──────────────────────────────────────────────────────

export default function PrivacyPromiseScreen({
  onContinue,
}: PrivacyPromiseScreenProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  const handleContinue = useCallback(() => {
    onContinue?.();
  }, [onContinue]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#FFFFFF' },
        { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) },
      ]}
    >
      <View style={styles.content}>
        {/* Headline */}
        <Text
          style={[
            styles.headline,
            { color: isDark ? '#FFFFFF' : '#1A1A1A' },
          ]}
          accessibilityRole="header"
        >
          {t('onboarding.privacyPromise.headline')}
        </Text>

        {/* Privacy promise panel */}
        <PrivacyPromisePanel variant="card" showLearnMore />
      </View>

      {/* Continue button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            { backgroundColor: isDark ? '#2563EB' : '#2563EB' },
          ]}
          onPress={handleContinue}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.privacyPromise.continue')}
        >
          <Text style={styles.continueBtnText}>
            {t('onboarding.privacyPromise.continue')}
          </Text>
        </TouchableOpacity>

        {/* Subtle reassurance text */}
        <Text
          style={[
            styles.reassurance,
            { color: isDark ? '#888' : '#9CA3AF' },
          ]}
        >
          {t('onboarding.privacyPromise.reassurance')}
        </Text>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  } satisfies ViewStyle,

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  } satisfies ViewStyle,

  headline: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: -0.2,
    paddingHorizontal: 12,
    marginBottom: 4,
  } satisfies TextStyle,

  footer: {
    gap: 10,
    paddingBottom: 16,
    alignItems: 'center',
  } satisfies ViewStyle,

  continueBtn: {
    width: '100%',
    maxWidth: 400,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  } satisfies ViewStyle,

  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  } satisfies TextStyle,

  reassurance: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  } satisfies TextStyle,
});
