import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

export interface CameraPermissionDeniedSheetProps {
  visible: boolean;
  canAskAgain: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onRequestPermission: () => Promise<void>;
  onManualInput: () => void;
}

export function CameraPermissionDeniedSheet({
  visible,
  canAskAgain,
  onClose,
  onOpenSettings,
  onRequestPermission,
  onManualInput,
}: CameraPermissionDeniedSheetProps) {
  const { t } = useTranslation();
  const [requesting, setRequesting] = React.useState(false);

  const handlePrimaryAction = async () => {
    if (canAskAgain) {
      setRequesting(true);
      try {
        await onRequestPermission();
      } finally {
        setRequesting(false);
      }
    } else {
      onOpenSettings();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={styles.sheet}
          accessibilityViewIsModal
          accessibilityLabel={t('cameraPermission.denied.title')}
        >
          <View style={styles.handleBar} accessibilityElementsHidden />

          <View style={styles.iconWrap}>
            <Text style={styles.warningIcon}>{'\u26A0\uFE0F'}</Text>
          </View>

          <Text style={styles.title}>{t('cameraPermission.denied.title')}</Text>
          <Text style={styles.body}>{t('cameraPermission.denied.body')}</Text>

          <View style={styles.privacyBadge} accessibilityRole="text">
            <Text style={styles.privacyBadgeText}>
              {'\uD83D\uDD12'} {t('cameraPermission.denied.privacyBadge')}
            </Text>
          </View>

          <Pressable
            style={[styles.primaryBtn, requesting && styles.primaryBtnDisabled]}
            onPress={handlePrimaryAction}
            disabled={requesting}
            accessibilityRole="button"
            accessibilityLabel={
              canAskAgain
                ? t('cameraPermission.denied.grantPermission')
                : t('cameraPermission.denied.openSettings')
            }
          >
            <Text style={styles.primaryBtnText}>
              {requesting
                ? t('common.loading')
                : canAskAgain
                  ? t('cameraPermission.denied.grantPermission')
                  : t('cameraPermission.denied.openSettings')}
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryBtn}
            onPress={onManualInput}
            accessibilityRole="button"
            accessibilityLabel={t('cameraPermission.denied.manualInput')}
          >
            <Text style={styles.secondaryBtnText}>
              {'\u270F\uFE0F'} {t('cameraPermission.denied.manualInput')}
            </Text>
          </Pressable>

          <Pressable
            style={styles.cancelBtn}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('cameraPermission.denied.cancel')}
          >
            <Text style={styles.cancelBtnText}>{t('cameraPermission.denied.cancel')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  } satisfies ViewStyle,
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  } satisfies ViewStyle,
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginTop: 12,
    marginBottom: 20,
  } satisfies ViewStyle,
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  } satisfies ViewStyle,
  warningIcon: {
    fontSize: 28,
  } satisfies TextStyle,
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  } satisfies TextStyle,
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  } satisfies TextStyle,
  privacyBadge: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 24,
  } satisfies ViewStyle,
  privacyBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
    textAlign: 'center',
  } satisfies TextStyle,
  primaryBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  } satisfies ViewStyle,
  primaryBtnDisabled: {
    opacity: 0.6,
  } satisfies ViewStyle,
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  } satisfies TextStyle,
  secondaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 4,
  } satisfies ViewStyle,
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  } satisfies TextStyle,
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
  } satisfies ViewStyle,
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9CA3AF',
  } satisfies TextStyle,
});
