/**
 * Onboarding error state components — ErrorStates
 *
 * Reusable error/empty/fallback UI for all onboarding steps.
 * Per ADD §4.1 (OCR fallback, never block) + §9 (accessibility):
 * - Bilingual (EN + zh-Hans)
 * - Kid-safe (no data leaving device)
 * - voiceOver/TalkBack labels on every action
 * - Icons + labels (no text-only states)
 *
 * Supports:
 * - Camera permission denied → explain why + link to Settings + type-input alternative
 * - No storage → clear message + how much space needed
 * - Model download timeout → retry button + 'skip for now' option
 * - Camera not available (simulator) → test-mode toggle message
 * - Onboarding step failure → 'go back' + resume from saved state
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  type TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';

// ── Type exports ──────────────────────────────────────────────────

export type ErrorKind =
  | 'camera_permission_denied'
  | 'no_storage'
  | 'model_download_timeout'
  | 'camera_not_available'
  | 'onboarding_step_failure'
  | 'generic';

export interface ErrorAction {
  label: string;
  onPress: () => void;
  primary?: boolean;
  accessibilityLabel?: string;
}

export interface ErrorStateConfig {
  kind: ErrorKind;
  /** Override the default title (bilingual via i18n) */
  title?: string;
  /** Override the default body (bilingual via i18n) */
  body?: string;
  /** Extra actions beyond the default ones for this ErrorKind */
  extraActions?: ErrorAction[];
  /** Called when user taps "go back" / "skip" */
  onBack?: () => void;
  /** Called when user taps "retry" */
  onRetry?: () => void;
  /** Called when user opts to type input instead (camera permission denied) */
  onTypeInput?: () => void;
  /** Called when user skips model download */
  onSkipDownload?: () => void;
  /** How much free space is needed (for no_storage) in GB */
  storageNeededGB?: number;
}

// ── Components ────────────────────────────────────────────────────

/**
 * ErrorState — the main presentational component for error/empty/fallback screens.
 *
 * Usage:
 * ```tsx
 * <ErrorState kind="camera_permission_denied" onRetry={...} onTypeInput={...} />
 * ```
 */
export function ErrorState({
  kind,
  title,
  body,
  extraActions,
  onBack,
  onRetry,
  onTypeInput,
  onSkipDownload,
  storageNeededGB = 2,
}: ErrorStateConfig) {
  const { t } = useTranslation();

  // ── Resolve content from kind ────────────────────────────────

  const resolved = resolveErrorContent(kind, t, storageNeededGB);

  const displayTitle = title ?? resolved.title;
  const displayBody = body ?? resolved.body;
  const icon = resolved.icon;
  const defaultActions = resolved.actions({
    onBack,
    onRetry,
    onTypeInput,
    onSkipDownload,
    t,
  });

  const allActions = [...defaultActions, ...(extraActions ?? [])];

  return (
    <View
      style={styles.container}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      {/* Icon */}
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{displayTitle}</Text>

      {/* Body */}
      <Text style={styles.body}>{displayBody}</Text>

      {/* Actions */}
      <View style={styles.actionGroup}>
        {allActions.map((action, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.actionBtn,
              action.primary !== false && styles.actionBtnPrimary,
            ]}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={
              action.accessibilityLabel ?? action.label
            }
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.actionBtnText,
                action.primary !== false && styles.actionBtnTextPrimary,
              ]}
            >
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

/**
 * Minimal inline error banner — for embedding inside a form/page without
 * taking over the whole screen.
 */
export function ErrorBanner({
  message,
  onRetry,
  style,
}: {
  message: string;
  onRetry?: () => void;
  style?: any;
}) {
  const { t } = useTranslation();
  return (
    <View
      style={[styles.banner, style]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <Text style={styles.bannerIcon}>⚠️</Text>
      <Text style={styles.bannerText}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.bannerBtn}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={t('common.retry')}
        >
          <Text style={styles.bannerBtnText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * ErrorBoundary fallback — for wrapping onboarding steps that may crash.
 * Shows "Something went wrong" + "Go back to start" option.
 */
export function OnboardingErrorFallback({
  onGoBack,
}: {
  onGoBack: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.container} accessibilityRole="alert">
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>😅</Text>
      </View>
      <Text style={styles.title}>
        {t('onboardingErrors.fallback.title', { defaultValue: 'Something went wrong' })}
      </Text>
      <Text style={styles.body}>
        {t(
          'onboardingErrors.fallback.body',
          { defaultValue: 'Don\'t worry — we saved your progress. You can go back and try again.' },
        )}
      </Text>
      <TouchableOpacity
        style={[styles.actionBtn, styles.actionBtnPrimary]}
        onPress={onGoBack}
        accessibilityRole="button"
        accessibilityLabel={t('onboardingErrors.fallback.goBack')}
        activeOpacity={0.7}
      >
        <Text style={[styles.actionBtnText, styles.actionBtnTextPrimary]}>
          {t('onboardingErrors.fallback.goBack', { defaultValue: 'Go back to start' })}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Content resolver ──────────────────────────────────────────────

interface ResolvedErrorContent {
  icon: string;
  title: string;
  body: string;
  actions: (opts: {
    onBack?: () => void;
    onRetry?: () => void;
    onTypeInput?: () => void;
    onSkipDownload?: () => void;
    t: (key: string, options?: any) => string;
  }) => ErrorAction[];
}

function resolveErrorContent(
  kind: ErrorKind,
  t: (key: string, options?: any) => string,
  storageNeededGB: number,
): ResolvedErrorContent {
  switch (kind) {
    case 'camera_permission_denied':
      return {
        icon: '📷',
        title: t(
          'onboardingErrors.cameraPermission.title',
          { defaultValue: 'Camera access needed' },
        ),
        body: t(
          'onboardingErrors.cameraPermission.body',
          { defaultValue: 'We need camera access so you can take photos of your homework. Your photos never leave this device.' },
        ),
        actions: ({ onRetry, onTypeInput, onSkipDownload, t: _t }) => {
          const acts: ErrorAction[] = [
            {
              label: _t(
                'onboardingErrors.cameraPermission.openSettings',
                { defaultValue: 'Open Settings' },
              ),
              onPress: () => {
                Linking.openSettings();
                onRetry?.();
              },
              accessibilityLabel: _t(
                'onboardingErrors.cameraPermission.openSettings',
                { defaultValue: 'Open Settings' },
              ),
            },
          ];
          if (onTypeInput) {
            acts.push({
              label: _t(
                'onboardingErrors.cameraPermission.typeInstead',
                { defaultValue: 'Type my question instead' },
              ),
              onPress: onTypeInput,
              primary: false,
              accessibilityLabel: _t(
                'onboardingErrors.cameraPermission.typeInstead',
                { defaultValue: 'Type my question instead' },
              ),
            });
          }
          if (onSkipDownload) {
            acts.push({
              label: _t(
                'common.skip',
                { defaultValue: 'Skip for now' },
              ),
              onPress: onSkipDownload,
              primary: false,
              accessibilityLabel: _t(
                'common.skip',
                { defaultValue: 'Skip for now' },
              ),
            });
          }
          return acts;
        },
      };

    case 'no_storage':
      return {
        icon: '💾',
        title: t(
          'onboardingErrors.noStorage.title',
          { defaultValue: 'Not enough space' },
        ),
        body: t(
          'onboardingErrors.noStorage.body',
          { defaultValue: 'We need about {{needed}}GB of free space to download the AI model. Please free up some space and try again.', needed: storageNeededGB },
        ),
        actions: ({ onRetry, t: _t }) => [
          {
            label: _t('common.retry'),
            onPress: () => onRetry?.(),
            accessibilityLabel: _t(
              'onboardingErrors.noStorage.retryA11y',
              { defaultValue: 'Check storage and retry' },
            ),
          },
        ],
      };

    case 'model_download_timeout':
      return {
        icon: '⏱️',
        title: t(
          'onboardingErrors.downloadTimeout.title',
          { defaultValue: 'Download timed out' },
        ),
        body: t(
          'onboardingErrors.downloadTimeout.body',
          { defaultValue: 'The AI model download took too long. Make sure you have a stable internet connection.' },
        ),
        actions: ({ onRetry, onSkipDownload, t: _t }) => {
          const acts: ErrorAction[] = [
            {
              label: _t('common.retry'),
              onPress: () => onRetry?.(),
            },
          ];
          if (onSkipDownload) {
            acts.push({
              label: _t(
                'onboardingErrors.downloadTimeout.skip',
                { defaultValue: 'Continue without download' },
              ),
              onPress: onSkipDownload,
              primary: false,
              accessibilityLabel: _t(
                'onboardingErrors.downloadTimeout.skipA11y',
                { defaultValue: 'Skip model download and continue' },
              ),
            });
          }
          return acts;
        },
      };

    case 'camera_not_available':
      return {
        icon: '📱',
        title: t(
          'onboardingErrors.cameraUnavailable.title',
          { defaultValue: 'Camera not available' },
        ),
        body: t(
          'onboardingErrors.cameraUnavailable.body',
          { defaultValue: 'No camera detected. This usually happens on a simulator or when no camera is connected.' },
        ),
        actions: ({ onTypeInput, t: _t }) => {
          const acts: ErrorAction[] = [
            {
              label: _t(
                'onboardingErrors.cameraUnavailable.typeInput',
                { defaultValue: 'Type my question' },
              ),
              onPress: () => onTypeInput?.(),
              primary: false,
            },
          ];
          return acts;
        },
      };

    case 'onboarding_step_failure':
      return {
        icon: '🔄',
        title: t(
          'onboardingErrors.stepFailure.title',
          { defaultValue: 'Couldn\'t complete this step' },
        ),
        body: t(
          'onboardingErrors.stepFailure.body',
          { defaultValue: 'Something went wrong. Your progress has been saved so you can try again.' },
        ),
        actions: ({ onBack, onRetry, t: _t }) => [
          {
            label: _t('onboardingErrors.stepFailure.retry', { defaultValue: 'Try again' }),
            onPress: () => onRetry?.(),
          },
          {
            label: _t('common.goBack'),
            onPress: () => onBack?.(),
            primary: false,
          },
        ],
      };

    case 'generic':
    default:
      return {
        icon: '⚠️',
        title: t(
          'onboardingErrors.generic.title',
          { defaultValue: 'Something went wrong' },
        ),
        body: t(
          'onboardingErrors.generic.body',
          { defaultValue: 'Please try again. If this keeps happening, check your internet connection.' },
        ),
        actions: ({ onRetry, onBack, t: _t }) => {
          const acts: ErrorAction[] = [];
          if (onRetry) {
            acts.push({
              label: _t('common.retry'),
              onPress: onRetry,
            });
          }
          if (onBack) {
            acts.push({
              label: _t('common.goBack'),
              onPress: onBack,
              primary: false,
            });
          }
          return acts;
        },
      };
  }
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
  } as TextStyle,

  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF3CD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  } as TextStyle,
  icon: {
    fontSize: 40,
  } as TextStyle,

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  } as TextStyle,

  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 8,
  } as TextStyle,

  actionGroup: {
    width: '100%',
    maxWidth: 360,
    gap: 12,
  } as TextStyle,

  actionBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  } as TextStyle,
  actionBtnPrimary: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  } as TextStyle,
  actionBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  } as TextStyle,
  actionBtnTextPrimary: {
    color: '#FFFFFF',
  } as TextStyle,

  // Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    gap: 10,
  } as TextStyle,
  bannerIcon: {
    fontSize: 18,
  } as TextStyle,
  bannerText: {
    flex: 1,
    fontSize: 14,
    color: '#DC2626',
    lineHeight: 20,
  } as TextStyle,
  bannerBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#DC2626',
    borderRadius: 8,
  } as TextStyle,
  bannerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  } as TextStyle,
} as TextStyle);
