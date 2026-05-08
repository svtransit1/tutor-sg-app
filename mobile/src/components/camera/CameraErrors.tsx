import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  type ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';

export type CameraErrorKind =
  | 'permission_denied'
  | 'unavailable'
  | 'low_light'
  | 'capture_failed'
  | 'processing_failed';

export interface CameraErrorScreenProps {
  kind: CameraErrorKind;
  onOpenSettings?: () => void;
  onTypeInput?: () => void;
  onGoBack?: () => void;
  onRetake?: () => void;
  onContinueAnyway?: () => void;
}

export function CameraErrorScreen({
  kind,
  onOpenSettings,
  onTypeInput,
  onGoBack,
  onRetake,
  onContinueAnyway,
}: CameraErrorScreenProps) {
  const { t } = useTranslation();

  if (kind === 'permission_denied') {
    return (
      <View style={styles.container} accessibilityRole="alert" accessibilityLiveRegion="assertive">
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🚫</Text>
        </View>
        <Text style={styles.title}>
          {t('cameraErrors.permission.title', 'Camera access needed')}
        </Text>
        <Text style={styles.body}>
          {t('cameraErrors.permission.description', 'We need camera access to snap your homework. Your photos stay on this device.')}
        </Text>
        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.actionBtnPrimary}
            onPress={() => {
              if (onOpenSettings) onOpenSettings();
              else Linking.openSettings();
            }}
            accessibilityRole="button"
            accessibilityLabel={t('cameraErrors.permission.openSettings', 'Open Settings to enable camera')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionBtnPrimaryText}>
              {t('cameraErrors.permission.openSettings', 'Open Settings')}
            </Text>
          </TouchableOpacity>
          {onTypeInput && (
            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={onTypeInput}
              accessibilityRole="button"
              accessibilityLabel={t('cameraErrors.permission.typeInstead', 'Type my question instead')}
              activeOpacity={0.7}
            >
              <Text style={styles.actionBtnSecondaryText}>
                {t('cameraErrors.permission.typeInstead', 'Type my question instead')}
              </Text>
            </TouchableOpacity>
          )}
          {onGoBack && (
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={onGoBack}
              accessibilityRole="button"
              accessibilityLabel={t('common.goBack')}
            >
              <Text style={styles.linkBtnText}>{t('common.goBack')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  if (kind === 'unavailable') {
    return (
      <View style={styles.container} accessibilityRole="alert" accessibilityLiveRegion="assertive">
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>📷</Text>
        </View>
        <Text style={styles.title}>
          {t('cameraErrors.unavailable.title')}
        </Text>
        <Text style={styles.body}>
          {t('cameraErrors.unavailable.description')}
        </Text>
        <View style={styles.actionGroup}>
          {onRetake && (
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              onPress={onRetake}
              accessibilityRole="button"
              accessibilityLabel={t('cameraErrors.unavailable.tryAgain')}
              activeOpacity={0.7}
            >
              <Text style={styles.actionBtnPrimaryText}>
                {t('cameraErrors.unavailable.tryAgain')}
              </Text>
            </TouchableOpacity>
          )}
          {onTypeInput && (
            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={onTypeInput}
              accessibilityRole="button"
              accessibilityLabel={t('cameraErrors.unavailable.typeInput')}
              activeOpacity={0.7}
            >
              <Text style={styles.actionBtnSecondaryText}>
                {t('cameraErrors.unavailable.typeInput')}
              </Text>
            </TouchableOpacity>
          )}
          {onGoBack && (
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={onGoBack}
              accessibilityRole="button"
              accessibilityLabel={t('common.goBack')}
            >
              <Text style={styles.linkBtnText}>{t('common.goBack')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  if (kind === 'low_light') {
    return (
      <View style={styles.overlay} accessibilityRole="alert" accessibilityLiveRegion="assertive">
        <View style={styles.overlayCard}>
          <Text style={styles.overlayIcon}>🌙</Text>
          <Text style={styles.overlayTitle}>
            {t('cameraErrors.lowLight.title')}
          </Text>
          <Text style={styles.overlayBody}>
            {t('cameraErrors.lowLight.description')}
          </Text>
          <View style={styles.overlayActions}>
            {onRetake && (
              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={onRetake}
                accessibilityRole="button"
                accessibilityLabel={t('cameraErrors.lowLight.retake')}
                activeOpacity={0.7}
              >
                <Text style={styles.actionBtnPrimaryText}>
                  {t('cameraErrors.lowLight.retake')}
                </Text>
              </TouchableOpacity>
            )}
            {onContinueAnyway && (
              <TouchableOpacity
                style={styles.actionBtnSecondary}
                onPress={onContinueAnyway}
                accessibilityRole="button"
                accessibilityLabel={t('cameraErrors.lowLight.continueAnyway')}
                activeOpacity={0.7}
              >
                <Text style={styles.actionBtnSecondaryText}>
                  {t('cameraErrors.lowLight.continueAnyway')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
  } as ViewStyle,
  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FEF2F2',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  } as ViewStyle,
  icon: { fontSize: 40 } as ViewStyle,
  title: {
    fontSize: 20, fontWeight: '700', color: '#1A1A1A',
    textAlign: 'center', marginBottom: 12, lineHeight: 28,
  } as ViewStyle,
  body: {
    fontSize: 16, lineHeight: 24, color: '#6B7280',
    textAlign: 'center', marginBottom: 32, paddingHorizontal: 8,
  } as ViewStyle,
  actionGroup: { width: '100%', maxWidth: 360, gap: 12 } as ViewStyle,
  actionBtnPrimary: {
    height: 52, borderRadius: 12,
    backgroundColor: '#2563EB', borderColor: '#2563EB', borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  } as ViewStyle,
  actionBtnPrimaryText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' } as ViewStyle,
  actionBtnSecondary: {
    height: 52, borderRadius: 12,
    backgroundColor: '#FFFFFF', borderColor: '#D1D5DB', borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  } as ViewStyle,
  actionBtnSecondaryText: { fontSize: 16, fontWeight: '600', color: '#374151' } as ViewStyle,
  linkBtn: { paddingVertical: 12, paddingHorizontal: 24, alignItems: 'center' } as ViewStyle,
  linkBtnText: { fontSize: 15, color: '#6B7280', textDecorationLine: 'underline' } as ViewStyle,
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32,
  } as ViewStyle,
  overlayCard: {
    width: '100%', maxWidth: 340,
    backgroundColor: '#FFFFFF', borderRadius: 20,
    paddingVertical: 32, paddingHorizontal: 24, alignItems: 'center',
  } as ViewStyle,
  overlayIcon: { fontSize: 48, marginBottom: 16 } as ViewStyle,
  overlayTitle: {
    fontSize: 18, fontWeight: '700', color: '#1A1A1A',
    textAlign: 'center', marginBottom: 8,
  } as ViewStyle,
  overlayBody: {
    fontSize: 15, lineHeight: 22, color: '#6B7280',
    textAlign: 'center', marginBottom: 24,
  } as ViewStyle,
  overlayActions: { width: '100%', gap: 10 } as ViewStyle,
});
