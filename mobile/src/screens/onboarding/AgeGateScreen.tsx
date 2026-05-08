/**
 * AgeGateScreen — onboarding step 2/7: parent gate.
 *
 * Purpose: Hand the phone to a parent or guardian before setup begins.
 * Per M2 onboarding UX spec: "Parent gate" screen.
 * Bilingual (EN + zh-Hans). Kid-safe (no data leaving device).
 *
 * States:
 * - Default: explanatory copy + two actions
 * - Loading: primary button spinner during transition
 * - Error: none (soft gate)
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';

// ── Props ──────────────────────────────────────────────────────────

interface AgeGateScreenProps {
  /** Called when the user confirms they are a parent/guardian. */
  onComplete?: () => void;
  /** Called when the user says they are not a parent (navigate back). */
  onGoBack?: () => void;
}

// ── Component ──────────────────────────────────────────────────────

export default function AgeGateScreen({ onComplete, onGoBack }: AgeGateScreenProps) {
  const { t } = useTranslation();

  const handleContinue = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  const handleGoBack = useCallback(() => {
    onGoBack?.();
  }, [onGoBack]);

  // ── Render ───────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon area — warm, inviting illustration placeholder */}
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>👨‍👩‍👧‍👦</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{t('onboarding.parentGate.title')}</Text>

        {/* Body copy */}
        <Text style={styles.body}>{t('onboarding.parentGate.body')}</Text>

        {/* Primary action */}
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={handleContinue}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.parentGate.continue')}
          activeOpacity={0.8}
        >
          <Text style={styles.btnPrimaryText}>{t('onboarding.parentGate.continue')}</Text>
        </TouchableOpacity>

        {/* Secondary action — go back */}
        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={handleGoBack}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.parentGate.goBack')}
          activeOpacity={0.7}
        >
          <Text style={styles.btnSecondaryText}>{t('onboarding.parentGate.goBack')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Icon
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  icon: {
    fontSize: 40,
  },

  // Title
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
  },

  // Body
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 8,
  },

  // Primary button — bottom third of screen, thumb-reachable
  btnPrimary: {
    width: '100%',
    maxWidth: 400,
    height: 56,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

  // Secondary button
  btnSecondary: {
    width: '100%',
    maxWidth: 400,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  btnSecondaryText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
});
