import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { capturePhoto, getCameraPermissionStatus, type CapturedPhoto } from '@/services/camera';

type PermissionState = 'unknown' | 'granted' | 'denied';

export default function CameraCaptureScreen() {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const bgColor = isDark ? '#121212' : '#F9FAFB';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';

  const [permissionState, setPermissionState] = useState<PermissionState>('unknown');
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    (async () => {
      const status = await getCameraPermissionStatus();
      if (status === 'granted') setPermissionState('granted');
      else if (status === 'denied') setPermissionState('denied');
      else setPermissionState('unknown');
    })();
  }, []);

  const takePhoto = useCallback(async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    try {
      const photo = await capturePhoto();
      if (photo) {
        setPermissionState('granted');
        const updated = [...capturedPhotos, photo];
        setCapturedPhotos(updated);
        if (updated.length >= 5) {
          const uris = JSON.stringify(updated.map(p => p.uri));
          router.replace(`/(kid)/photo-review?photoUris=${encodeURIComponent(uris)}`);
        }
      } else {
        const status = await getCameraPermissionStatus();
        if (status === 'denied') setPermissionState('denied');
      }
    } finally {
      setIsCapturing(false);
    }
  }, [capturedPhotos, isCapturing]);

  const handleConfirmAll = useCallback(() => {
    if (capturedPhotos.length === 0) return;
    const uris = JSON.stringify(capturedPhotos.map(p => p.uri));
    router.replace(`/(kid)/photo-review?photoUris=${encodeURIComponent(uris)}`);
  }, [capturedPhotos]);

  const handleRemovePhoto = (index: number) => {
    setCapturedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleManualInput = useCallback(() => {
    router.push('/(kid)/manual-input');
  }, []);

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(kid)/home');
  }, []);

  const goHome = useCallback(() => {
    router.replace('/(kid)/home');
  }, []);

  if (permissionState === 'denied') {
    return (
      <View style={[styles.root, { backgroundColor: bgColor }]}>
        <View style={styles.deniedContent}>
          <Text style={styles.deniedIcon}>📷</Text>
          <Text style={[styles.deniedTitle, { color: textColor }]}>
            {t('homeworkError.cameraDenied.title')}
          </Text>
          <Text style={[styles.deniedDescription, { color: isDark ? '#B0B0B0' : '#6B7280' }]}>
            {t('homeworkError.cameraDenied.description')}
          </Text>

          <View style={styles.deniedActions}>
            <TouchableOpacity
              style={styles.typeItOutBtn}
              onPress={handleManualInput}
              accessibilityRole="button"
              accessibilityLabel={t('homeworkError.cameraDenied.typeItOut')}
            >
              <Text style={styles.typeItOutBtnText}>{t('homeworkError.cameraDenied.typeItOut')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.goBackBtn}
              onPress={goHome}
              accessibilityRole="button"
              accessibilityLabel={t('homeworkError.cameraDenied.goBack')}
            >
              <Text style={[styles.goBackBtnText, { color: isDark ? '#90CAF9' : '#6B7280' }]}>
                {t('homeworkError.cameraDenied.goBack')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: bgColor }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn} accessibilityRole="button" accessibilityLabel={t('common.back')}>
          <Text style={[styles.backArrow, { color: isDark ? '#90CAF9' : '#2563EB' }]}>←</Text>
          <Text style={[styles.backLabel, { color: isDark ? '#90CAF9' : '#2563EB' }]}>{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.heading, { color: textColor }]}>{t('cameraCapture.title')}</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.instruction, { color: textColor }]}>
          {capturedPhotos.length === 0
            ? t('cameraCapture.instruction')
            : t('cameraCapture.instructionAdd', { count: capturedPhotos.length, max: 5 })}
        </Text>

        {capturedPhotos.length > 0 && (
          <View style={styles.thumbnailStrip}>
            {capturedPhotos.map((_, i) => (
              <View key={i} style={styles.thumbWrapper}>
                <Text style={styles.thumbPlaceholder}>📷</Text>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemovePhoto(i)}
                  accessibilityLabel={t('cameraCapture.removePhoto', { number: i + 1 })}
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.captureBtn, isCapturing && styles.captureBtnDisabled]}
            onPress={takePhoto}
            disabled={isCapturing}
            accessibilityRole="button"
            accessibilityLabel={t('cameraCapture.accessibility.capture')}
          >
            <Text style={styles.captureBtnText}>
              {isCapturing ? t('cameraCapture.capturing') : t('cameraCapture.takePhoto')}
            </Text>
          </TouchableOpacity>

          {capturedPhotos.length > 0 && (
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirmAll}
              accessibilityRole="button"
              accessibilityLabel={t('cameraCapture.accessibility.confirm', { count: capturedPhotos.length })}
            >
              <Text style={styles.confirmBtnText}>
                {t('cameraCapture.confirm')} ({capturedPhotos.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 60 },
  backArrow: { fontSize: 20, fontWeight: '600' },
  backLabel: { fontSize: 15, fontWeight: '600' },
  heading: { fontSize: 17, fontWeight: '700', textAlign: 'center', flex: 1 },
  spacer: { minWidth: 60 },
  content: { flex: 1, padding: 24, gap: 24 },
  instruction: { fontSize: 18, textAlign: 'center', lineHeight: 26 },
  thumbnailStrip: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  thumbWrapper: { position: 'relative' },
  thumbPlaceholder: { width: 64, height: 64, backgroundColor: '#E5E7EB', borderRadius: 8, textAlign: 'center', lineHeight: 64, fontSize: 28 },
  removeBtn: { position: 'absolute', top: -8, right: -8, backgroundColor: '#EF4444', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  buttonRow: { gap: 16, marginTop: 'auto', paddingBottom: 32 },
  captureBtn: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  captureBtnDisabled: { backgroundColor: '#9CA3AF' },
  captureBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  confirmBtn: { backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  confirmBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  deniedContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  deniedIcon: { fontSize: 56, marginBottom: 8 },
  deniedTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', letterSpacing: -0.3 },
  deniedDescription: { fontSize: 16, lineHeight: 24, textAlign: 'center', paddingHorizontal: 8 },
  deniedActions: { gap: 16, marginTop: 16, width: '100%', maxWidth: 320 },
  typeItOutBtn: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  typeItOutBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  goBackBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  goBackBtnText: { fontSize: 16, fontWeight: '600' },
});
