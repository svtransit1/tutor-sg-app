import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Linking, type TextStyle, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { Camera } from 'expo-camera';

type PermissionState = 'initial' | 'requesting' | 'denied_permanent';

export default function CameraPermissionScreen() {
  const { t } = useTranslation();
  const [permissionState, setPermissionState] = useState<PermissionState>('initial');

  const handleAllow = useCallback(async () => {
    setPermissionState('requesting');
    const { granted, canAskAgain } = await Camera.requestCameraPermissionsAsync();
    if (granted) {
      router.replace('/(kid)/camera');
    } else if (!canAskAgain) {
      setPermissionState('denied_permanent');
    } else {
      setPermissionState('initial');
    }
  }, []);

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  const handleGoBack = useCallback(() => {
    router.back();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {permissionState === 'denied_permanent' ? (
          <>
            <Text style={styles.deniedIcon}>{'\u26A0\uFE0F'}</Text>
            <Text style={styles.title}>{t('cameraPermission.deniedTitle')}</Text>
            <Text style={styles.body}>{t('cameraPermission.deniedBody')}</Text>
            <Pressable
              style={styles.primaryBtn}
              onPress={handleOpenSettings}
              accessibilityRole="button"
              accessibilityLabel={t('cameraPermission.openSettings')}
            >
              <Text style={styles.primaryBtnText}>{t('cameraPermission.openSettings')}</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryBtn}
              onPress={handleGoBack}
              accessibilityRole="button"
              accessibilityLabel={t('cameraPermission.goBack')}
            >
              <Text style={styles.secondaryBtnText}>{t('cameraPermission.goBack')}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>{'\uD83D\uDCF7'}</Text>
            </View>
            <Text style={styles.title}>{t('cameraPermission.title')}</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>{'\u2714\uFE0F'} {t('cameraPermission.bodyLine1')}</Text>
              <Text style={styles.bulletItem}>{'\u2714\uFE0F'} {t('cameraPermission.bodyLine2')}</Text>
              <Text style={styles.bulletItem}>{'\u2714\uFE0F'} {t('cameraPermission.bodyLine3')}</Text>
            </View>
            <View style={styles.reassuranceBadge}>
              <Text style={styles.reassuranceText}>{'\uD83D\uDD12'} {t('cameraPermission.reassurance')}</Text>
            </View>
            <Pressable
              style={[styles.primaryBtn, permissionState === 'requesting' && styles.primaryBtnDisabled]}
              onPress={handleAllow}
              disabled={permissionState === 'requesting'}
              accessibilityRole="button"
              accessibilityLabel={t('cameraPermission.allowButton')}
            >
              <Text style={styles.primaryBtnText}>
                {permissionState === 'requesting' ? t('cameraPermission.loading') : t('cameraPermission.allowButton')}
              </Text>
            </Pressable>
            <Pressable
              style={styles.secondaryBtn}
              onPress={handleGoBack}
              accessibilityRole="button"
              accessibilityLabel={t('cameraPermission.goBack')}
            >
              <Text style={styles.secondaryBtnText}>{t('cameraPermission.goBack')}</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  } satisfies ViewStyle,
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 40,
  } satisfies ViewStyle,
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  } satisfies ViewStyle,
  icon: {
    fontSize: 44,
  } satisfies TextStyle,
  deniedIcon: {
    fontSize: 48,
    marginBottom: 20,
  } satisfies TextStyle,
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
  } satisfies TextStyle,
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  } satisfies TextStyle,
  bulletList: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  } satisfies ViewStyle,
  bulletItem: {
    fontSize: 16,
    lineHeight: 22,
    color: '#374151',
  } satisfies TextStyle,
  reassuranceBadge: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 32,
    width: '100%',
  } satisfies ViewStyle,
  reassuranceText: {
    fontSize: 15,
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
  } satisfies ViewStyle,
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  } satisfies TextStyle,
});
