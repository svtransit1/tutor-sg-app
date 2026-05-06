/**
 * Camera error state components — CameraErrors
 *
 * Camera-specific error/fallback UI for the homework-snapping flow.
 * Per ADD §4.1 (OCR fallback, never block) + §9 (accessibility):
 * - Never blocks: always offers a text-input or manual alternative
 * - Bilingual (EN + zh-Hans)
 * - kid-safe
 * - voiceOver/TalkBack labels on every action
 * - icons + labels (no text-only states)
 *
 * States:
 * - Camera permission denied → explain why + link to Settings + type-input alternative
 *   (Kid path: on first camera attempt within the session, not full onboarding)
 * - Camera not available (simulator) → test-mode toggle message
 * - No camera available (physical camera not found) → type input fallback
 * - OCR/detection failure → retry + manual input
 * - Storage insufficient → clear message + how much space
 * - Generic camera error → retake/retry
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
import type { ErrorAction } from '../onboarding/ErrorStates';

export type CameraErrorKind =
  | 'camera_permission_denied'
  | 'camera_not_available'
  | 'ocr_failed'
  | 'storage_insufficient'
  | 'capture_failed'
  | 'processing_failed'
  | 'generic';

export interface CameraErrorConfig {
  kind: CameraErrorKind;
  /** Override the default title */
  title?: string;
  /** Override the default body */
  body?: string;
  /** How much free space is needed in GB (for storage_insufficient) */
  storageNeededGB?: number;
  /** Called when user taps "retake" */
  onRetake?: () => void;
  /** Called when user taps "open settings" */
  onOpenSettings?: () => void;
  /** Called when user opts to type input instead */
  onTypeInput?: () => void;
  /** Called when user taps "try again" / "retry" */
  onRetry?: () => void;
  /** Called when user taps "go back" / "cancel" */
  onCancel?: () => void;
}

// ── CameraErrorScreen ─────────────────────────────────────────────

/**
 * Full-screen camera error view — replaces the camera viewfinder.
 * Use when camera flow encounters a blocking error (no permission, no camera, etc.).
 *
 * Usage:
 * ```tsx
 * <CameraErrorScreen kind="camera_permission_denied" onTypeInput={...} onOpenSettings={...} />
 * ```
 */
export function CameraErrorScreen({
  kind,
  title,
  body,
  storageNeededGB = 2,
  onRetake,
  onOpenSettings,
  onTypeInput,
  onRetry,
  onCancel,
}: CameraErrorConfig) {
  const { t } = useTranslation();

  const resolved = resolveCameraErrorContent(kind, t, storageNeededGB);

  const displayTitle = title ?? resolved.title;
  const displayBody = body ?? resolved.body;
  const icon = resolved.icon;
  const defaultActions = resolved.actions({
    onRetake,
    onOpenSettings,
    onTypeInput,
    onRetry,
    onCancel,
    t,
  });

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

      {/* Simulator hint */}
      {kind === 'camera_not_available' && Platform.OS === 'ios' && (
        <View style={styles.simHint} accessibilityRole="alert">
          <Text style={styles.simHintText}>
            {t('cameraErrors.simulatorHint', { defaultValue: 'Running in simulator? The camera is not available here. Use "Type my question" below to test the flow.' })}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionGroup}>
        {defaultActions.map((action, idx) => (
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

      {/* Dismiss / cancel */}
      {onCancel && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
        >
          <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── CameraErrorBanner ──────────────────────────────────────────────

/**
 * Inline banner for non-blocking camera errors (e.g., OCR retry,
 * processing hint). Embeds into the camera viewfinder overlay.
 */
export function CameraErrorBanner({
  message,
  actionLabel,
  onAction,
  style,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
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
      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.bannerBtn}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.bannerBtnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── OCR Fallback Panel ────────────────────────────────────────────

/**
 * OCR fallback panel — shown when OCR can't read an item.
 * Per ADD §4.1: "if any item can't be recognized → app shows
 * 'Can't read item N — please type or write it on the screen'."
 */
export function OcrFallbackPanel({
  itemNumber,
  onTypeInput,
  onWriteInput,
  onSkip,
}: {
  itemNumber: number;
  onTypeInput?: () => void;
  onWriteInput?: () => void;
  onSkip?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View
      style={styles.ocrPanel}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <Text style={styles.ocrPanelIcon}>🔍</Text>
      <Text style={styles.ocrPanelTitle}>
        {t('cameraErrors.ocrFallback.title', { defaultValue: "Can't read item {{number}}", number: itemNumber })}
      </Text>
      <Text style={styles.ocrPanelBody}>
        {t(
          'cameraErrors.ocrFallback.body',
          { defaultValue: 'Please type or write this question on the screen so we can help.' },
        )}
      </Text>
      <View style={styles.ocrPanelActions}>
        {onTypeInput && (
          <TouchableOpacity
            style={[styles.ocrBtn, styles.ocrBtnPrimary]}
            onPress={onTypeInput}
            accessibilityRole="button"
            accessibilityLabel={t('cameraErrors.ocrFallback.type', { defaultValue: 'Type it' })}
          >
            <Text style={styles.ocrBtnPrimaryText}>
              {t('cameraErrors.ocrFallback.type', { defaultValue: 'Type it' })}
            </Text>
          </TouchableOpacity>
        )}
        {onWriteInput && (
          <TouchableOpacity
            style={styles.ocrBtn}
            onPress={onWriteInput}
            accessibilityRole="button"
            accessibilityLabel={t('cameraErrors.ocrFallback.write', { defaultValue: 'Write it' })}
          >
            <Text style={styles.ocrBtnText}>
              {t('cameraErrors.ocrFallback.write', { defaultValue: 'Write it' })}
            </Text>
          </TouchableOpacity>
        )}
        {onSkip && (
          <TouchableOpacity
            style={styles.ocrBtn}
            onPress={onSkip}
            accessibilityRole="button"
            accessibilityLabel={t('cameraErrors.ocrFallback.skip', { defaultValue: 'Skip this item' })}
          >
            <Text style={styles.ocrBtnText}>
              {t('cameraErrors.ocrFallback.skip', { defaultValue: 'Skip this item' })}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── Content resolver ──────────────────────────────────────────────

interface ResolvedCameraErrorContent {
  icon: string;
  title: string;
  body: string;
  actions: (opts: {
    onRetake?: () => void;
    onOpenSettings?: () => void;
    onTypeInput?: () => void;
    onRetry?: () => void;
    onCancel?: () => void;
    t: (key: string, options?: any) => string;
  }) => ErrorAction[];
}

function resolveCameraErrorContent(
  kind: CameraErrorKind,
  t: (key: string, options?: any) => string,
  storageNeededGB: number,
): ResolvedCameraErrorContent {
  switch (kind) {
    case 'camera_permission_denied':
      return {
        icon: '📷',
        title: t(
          'cameraErrors.permission.title',
          { defaultValue: 'Camera access needed' },
        ),
        body: t(
          'cameraErrors.permission.body',
          { defaultValue: 'We need camera access to snap your homework. Your photos stay on this device.' },
        ),
        actions: ({ onOpenSettings, onTypeInput, t: _t }) => {
          const acts: ErrorAction[] = [
            {
              label: _t(
                'cameraErrors.permission.openSettings',
                { defaultValue: 'Open Settings' },
              ),
              onPress: () => {
                if (onOpenSettings) {
                  onOpenSettings();
                } else {
                  Linking.openSettings();
                }
              },
              accessibilityLabel: _t(
                'cameraErrors.permission.openSettingsA11y',
                { defaultValue: 'Open Settings to enable camera' },
              ),
            },
          ];
          if (onTypeInput) {
            acts.push({
              label: _t(
                'cameraErrors.permission.typeInstead',
                { defaultValue: 'Type my question' },
              ),
              onPress: onTypeInput,
              primary: false,
            });
          }
          return acts;
        },
      };

    case 'camera_not_available':
      return {
        icon: '📱',
        title: t(
          'cameraErrors.unavailable.title',
          { defaultValue: 'Camera not available' },
        ),
        body: t(
          'cameraErrors.unavailable.body',
          { defaultValue: 'No camera detected on this device. You can type your question instead.' },
        ),
        actions: ({ onTypeInput, t: _t }) => [
          {
            label: _t(
              'cameraErrors.unavailable.typeInput',
              { defaultValue: 'Type my question' },
            ),
            onPress: () => onTypeInput?.(),
            primary: false,
          },
        ],
      };

    case 'ocr_failed':
      return {
        icon: '🔍',
        title: t(
          'cameraErrors.ocrFailed.title',
          { defaultValue: 'Couldn\'t read it all' },
        ),
        body: t(
          'cameraErrors.ocrFailed.body',
          { defaultValue: 'We had trouble reading the homework text. Try better lighting, or type the question below.' },
        ),
        actions: ({ onRetake, onTypeInput, t: _t }) => {
          const acts: ErrorAction[] = [];
          if (onRetake) {
            acts.push({
              label: _t('cameraErrors.ocrFailed.retake', { defaultValue: 'Take another photo' }),
              onPress: onRetake,
            });
          }
          if (onTypeInput) {
            acts.push({
              label: _t(
                'cameraErrors.ocrFailed.typeInput',
                { defaultValue: 'Type the question' },
              ),
              onPress: onTypeInput,
              primary: onRetake == null,
            });
          }
          return acts;
        },
      };

    case 'storage_insufficient':
      return {
        icon: '💾',
        title: t(
          'cameraErrors.storage.title',
          { defaultValue: 'Not enough space' },
        ),
        body: t(
          'cameraErrors.storage.body',
          { defaultValue: 'We need about {{needed}}GB of free space to process your photo. Free up some space and try again.', needed: storageNeededGB },
        ),
        actions: ({ onRetry, t: _t }) => [
          {
            label: _t('common.retry'),
            onPress: () => onRetry?.(),
            accessibilityLabel: _t(
              'cameraErrors.storage.retryA11y',
              { defaultValue: 'Check storage and try again' },
            ),
          },
        ],
      };

    case 'capture_failed':
      return {
        icon: '📸',
        title: t(
          'cameraErrors.captureFailed.title',
          { defaultValue: 'Couldn\'t take the photo' },
        ),
        body: t(
          'cameraErrors.captureFailed.body',
          { defaultValue: 'Something went wrong while capturing. Please try again.' },
        ),
        actions: ({ onRetake, t: _t }) => [
          {
            label: _t('cameraErrors.captureFailed.retake', { defaultValue: 'Try again' }),
            onPress: () => onRetake?.(),
          },
        ],
      };

    case 'processing_failed':
      return {
        icon: '⚙️',
        title: t(
          'cameraErrors.processingFailed.title',
          { defaultValue: 'Couldn\'t process the photo' },
        ),
        body: t(
          'cameraErrors.processingFailed.body',
          { defaultValue: 'We had trouble reading the homework. Try again with better lighting and make sure the page is flat.' },
        ),
        actions: ({ onRetake, onTypeInput, t: _t }) => {
          const acts: ErrorAction[] = [];
          if (onRetake) {
            acts.push({
              label: _t(
                'cameraErrors.processingFailed.retake',
                { defaultValue: 'Take another photo' },
              ),
              onPress: onRetake,
            });
          }
          if (onTypeInput) {
            acts.push({
              label: _t(
                'cameraErrors.processingFailed.typeInput',
                { defaultValue: 'Type the question' },
              ),
              onPress: onTypeInput,
              primary: onRetake == null,
            });
          }
          return acts;
        },
      };

    case 'generic':
    default:
      return {
        icon: '⚠️',
        title: t(
          'cameraErrors.generic.title',
          { defaultValue: 'Something went wrong' },
        ),
        body: t(
          'cameraErrors.generic.body',
          { defaultValue: 'Please try again. If this keeps happening, restart the app.' },
        ),
        actions: ({ onRetry, onCancel, t: _t }) => {
          const acts: ErrorAction[] = [];
          if (onRetry) {
            acts.push({
              label: _t('common.retry'),
              onPress: onRetry,
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
    backgroundColor: '#FEF2F2',
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
    marginBottom: 24,
    paddingHorizontal: 8,
  } as TextStyle,

  simHint: {
    width: '100%',
    maxWidth: 360,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    marginBottom: 24,
  } as TextStyle,
  simHintText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#1E40AF',
    textAlign: 'center',
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

  cancelBtn: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
  } as TextStyle,
  cancelBtnText: {
    fontSize: 15,
    color: '#6B7280',
    textDecorationLine: 'underline',
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

  // OCR Fallback Panel
  ocrPanel: {
    width: '100%',
    maxWidth: 400,
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
  } as TextStyle,
  ocrPanelIcon: {
    fontSize: 36,
    marginBottom: 12,
  } as TextStyle,
  ocrPanelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400E',
    textAlign: 'center',
    marginBottom: 8,
  } as TextStyle,
  ocrPanelBody: {
    fontSize: 15,
    lineHeight: 22,
    color: '#A16207',
    textAlign: 'center',
    marginBottom: 20,
  } as TextStyle,
  ocrPanelActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  } as TextStyle,
  ocrBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  } as TextStyle,
  ocrBtnPrimary: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  } as TextStyle,
  ocrBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  } as TextStyle,
  ocrBtnPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  } as TextStyle,
} as TextStyle);
