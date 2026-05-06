/**
 * Unified Error Screen Component
 *
 * A reusable, kid-friendly error screen that handles camera permission
 * states, processing errors, session expiry, and generic errors.
 *
 * Variants:
 *   permission_camera   → Camera not granted, "Enable" / "Go back"
 *   permission_mic      → Mic not granted, "Enable" / "Go back"
 *   capture_error       → Photo capture failed, "Try again" / "Go back"
 *   processing_error    → OCR failed, "Try again" / "Go back"
 *   inference_error     → LLM inference failed, "Try again" / "Go back"
 *   session_expired     → Result not found, "Go back" (single action)
 *   generic             → Custom error, "Retry" / "Go back"
 *
 * Bilingual: all strings use i18n (EN / zh-Hans).
 * Kid-safe: no analytics, no network calls.
 *
 * @see ADD §4.1 — Camera homework check flow
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  type ViewStyle,
  type TextStyle,
} from 'react-native';

// ── Types ──────────────────────────────────────────────────────────

export type ErrorVariant =
  | 'permission_camera'
  | 'permission_mic'
  | 'capture_error'
  | 'processing_error'
  | 'inference_error'
  | 'session_expired'
  | 'generic';

export interface ErrorScreenProps {
  /** Which variant to render — controls default icon, title, description, actions */
  variant: ErrorVariant;
  /** Override the icon emoji (e.g. "📷", "😅", "🔒") */
  icon?: string;
  /** Override the title text (shown as-is, not an i18n key) */
  title?: string;
  /** Override the description text (shown as-is, not an i18n key) */
  description?: string;
  /** Override the primary action label (shown as-is, not an i18n key) */
  actionLabel?: string;
  /** Override the secondary action label (shown as-is, not an i18n key) */
  secondaryActionLabel?: string;
  /** Primary action handler (e.g. enable permission, retry, go back) */
  onAction: () => void;
  /** Secondary action handler — omitted = no secondary button shown */
  onSecondaryAction?: () => void;
  /** Extra container styles */
  style?: ViewStyle;
  /** Accessibility label for the full screen region */
  accessibilityLabel?: string;
}

// ── Variant defaults ───────────────────────────────────────────────

interface VariantDefaults {
  icon: string;
  titleKey: string;
  descKey: string;
  actionKey: string;
  secondaryActionKey: string;
  /** true = secondary button visible by default */
  showSecondary: boolean;
}

const VARIANT_MAP: Record<ErrorVariant, VariantDefaults> = {
  permission_camera: {
    icon: '📷',
    titleKey: 'cameraScreen.permission.title',
    descKey: 'cameraScreen.permission.description',
    actionKey: 'cameraScreen.permission.cta',
    secondaryActionKey: 'common.cancel',
    showSecondary: true,
  },
  permission_mic: {
    icon: '🎤',
    titleKey: 'errorScreen.permission.mic.title',
    descKey: 'errorScreen.permission.mic.description',
    actionKey: 'errorScreen.permission.mic.cta',
    secondaryActionKey: 'common.cancel',
    showSecondary: true,
  },
  capture_error: {
    icon: '😅',
    titleKey: 'cameraScreen.error.title',
    descKey: 'cameraScreen.error.captureFailed',
    actionKey: 'cameraScreen.error.retake',
    secondaryActionKey: 'common.goBack',
    showSecondary: true,
  },
  processing_error: {
    icon: '😅',
    titleKey: 'cameraScreen.error.title',
    descKey: 'cameraScreen.error.processingFailed',
    actionKey: 'cameraScreen.error.retake',
    secondaryActionKey: 'common.goBack',
    showSecondary: true,
  },
  inference_error: {
    icon: '😅',
    titleKey: 'cameraScreen.error.title',
    descKey: 'cameraScreen.error.inferenceFailed',
    actionKey: 'cameraScreen.error.retake',
    secondaryActionKey: 'common.goBack',
    showSecondary: true,
  },
  session_expired: {
    icon: '😅',
    titleKey: 'cameraScreen.error.title',
    descKey: 'cameraResult.error.notFound',
    actionKey: 'common.goBack',
    secondaryActionKey: 'common.goBack',
    showSecondary: false,
  },
  generic: {
    icon: '😅',
    titleKey: 'cameraScreen.error.title',
    descKey: 'errorScreen.generic.description',
    actionKey: 'common.retry',
    secondaryActionKey: 'common.goBack',
    showSecondary: true,
  },
};

// ── Component ──────────────────────────────────────────────────────

export default function ErrorScreen({
  variant,
  icon: iconOverride,
  title: titleOverride,
  description: descriptionOverride,
  actionLabel: actionLabelOverride,
  secondaryActionLabel: secondaryActionLabelOverride,
  onAction,
  onSecondaryAction,
  style,
  accessibilityLabel,
}: ErrorScreenProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';

  const defaults = VARIANT_MAP[variant];

  const icon = iconOverride ?? defaults.icon;
  const title = titleOverride ?? t(defaults.titleKey);
  const description = descriptionOverride ?? t(defaults.descKey);
  const actionLabel = actionLabelOverride ?? t(defaults.actionKey);
  const secondaryActionLabelValue =
    secondaryActionLabelOverride ?? t(defaults.secondaryActionKey);

  const showSecondary =
    defaults.showSecondary && onSecondaryAction !== undefined;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#F8F9FA' },
        style,
      ]}
      accessibilityLabel={accessibilityLabel ?? `Error: ${title}`}
      accessibilityRole="alert"
    >
      <View style={styles.content}>
        {/* Icon */}
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: isDark ? '#2A2A2A' : '#F0F4FF' },
          ]}
        >
          <Text style={styles.icon}>{icon}</Text>
        </View>

        {/* Title */}
        <Text
          style={[
            styles.title,
            { color: isDark ? '#FFFFFF' : '#1A1A1A' },
          ]}
          accessibilityRole="header"
        >
          {title}
        </Text>

        {/* Description */}
        <Text
          style={[
            styles.description,
            { color: isDark ? '#AAAAAA' : '#6B7280' },
          ]}
        >
          {description}
        </Text>

        {/* Actions */}
        <View style={styles.actions}>
          {/* Primary action */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: isDark ? '#2563EB' : '#4A90D9' },
            ]}
            onPress={onAction}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            <Text style={styles.primaryButtonText}>{actionLabel}</Text>
          </TouchableOpacity>

          {/* Secondary action */}
          {showSecondary && (
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  borderColor: isDark ? '#555' : '#D1D5DB',
                  backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
                },
              ]}
              onPress={onSecondaryAction}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={secondaryActionLabelValue}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: isDark ? '#CCCCCC' : '#6B7280' },
                ]}
              >
                {secondaryActionLabelValue}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,

  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    maxWidth: 400,
    width: '100%',
  } satisfies ViewStyle,

  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  } satisfies ViewStyle,
  icon: {
    fontSize: 44,
  } satisfies TextStyle,

  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 30,
  } satisfies TextStyle,

  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 36,
    paddingHorizontal: 8,
  } satisfies TextStyle,

  actions: {
    width: '100%',
    gap: 12,
  } satisfies ViewStyle,

  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  } satisfies TextStyle,

  secondaryButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  } satisfies ViewStyle,
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
  } satisfies TextStyle,
});
