import React, { useState, useCallback, useRef, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, type CameraPictureOptions } from 'expo-camera';
import CameraGuideFrame from '@/components/CameraGuideFrame';

type CaptureState = 'preview' | 'captured';

export default function HomeworkCameraScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const cameraRef = useRef<any>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [isAligned, setIsAligned] = useState(false);
  const [captureState, setCaptureState] = useState<CaptureState>('preview');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // ── Simulated alignment detection ──
  // TODO: Replace with real edge-detection from AAAS-128 OCR pipeline.
  // The isAligned state should be driven by a callback that receives
  // edge-detection results from the native module.
  const toggleAlignment = useCallback(() => {
    setIsAligned((prev) => !prev);
  }, []);

  // ── Capture ──
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      const options: CameraPictureOptions = {
        quality: 0.8,
        base64: false,
        exif: false,
      };
      const photo = await cameraRef.current.takePictureAsync(options);
      if (photo?.uri) {
        setCapturedUri(photo.uri);
        setCaptureState('captured');
      }
    } catch {
      // Camera capture failed — stay in preview state
    }
  }, []);

  // ── Retake ──
  const handleRetake = useCallback(() => {
    setCapturedUri(null);
    setCaptureState('preview');
    setIsAligned(false);
  }, []);

  // ── Confirm & proceed ──
  const handleConfirm = useCallback(() => {
    if (!capturedUri) return;
    router.replace({
      pathname: '/(kid)/homework-feedback',
      params: { result: capturedUri },
    });
  }, [capturedUri, router]);

  // ── Navigation ──
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (!permission) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: isDark ? '#121212' : '#F8F9FA' }]}>
        <Text style={[styles.permissionText, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: isDark ? '#121212' : '#F8F9FA' }]}>
        <Text style={[styles.permissionText, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
          Camera permission is required to snap homework.
        </Text>
        {permission.canAskAgain && (
          <TouchableOpacity style={styles.backButton} onPress={requestPermission} accessibilityRole="button">
            <Text style={styles.backButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.backButton} onPress={handleBack} accessibilityRole="button">
          <Text style={styles.backButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderCamera = () => (
    <CameraView
      ref={cameraRef}
      style={styles.cameraPreview}
      facing="back"
      mode="picture"
    >
      {/* Guide frame overlay */}
      <CameraGuideFrame isAligned={isAligned} />

      {/* Tap to toggle alignment (dev helper — remove for production) */}
      {/* TODO: Replace tap-to-toggle with real edge-detection from OCR pipeline */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={toggleAlignment}
        accessibilityLabel="Toggle alignment"
      />
    </CameraView>
  );

  const renderCapturedPreview = () => (
    <View style={[styles.capturedOverlay, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }]}>
      <View style={styles.capturedActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: isDark ? '#333' : '#E5E7EB' }]}
          onPress={handleRetake}
          accessibilityRole="button"
          accessibilityLabel={t('cameraGuideFrame.retake')}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionButtonText, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
            {t('cameraGuideFrame.retake')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: isDark ? '#2563EB' : '#4A90D9' }]}
          onPress={handleConfirm}
          accessibilityRole="button"
          accessibilityLabel={t('common.confirm')}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonConfirmText}>
            {t('common.confirm')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Header bar */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1A1A1A' : '#000000' }]}>
        <TouchableOpacity
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={t('common.goBack')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.headerBack}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('cameraGuideFrame.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Camera / captured preview */}
      <View style={styles.cameraContainer}>
        {captureState === 'preview' ? renderCamera() : renderCapturedPreview()}
      </View>

      {/* Bottom bar with capture button */}
      {captureState === 'preview' && (
        <View style={[styles.bottomBar, { backgroundColor: isDark ? '#1A1A1A' : '#000000' }]}>
          <TouchableOpacity
            style={[styles.captureButton, { borderColor: isAligned ? '#34C759' : '#FFFFFF' }]}
            onPress={handleCapture}
            accessibilityRole="button"
            accessibilityLabel={t('cameraGuideFrame.capture')}
            activeOpacity={0.7}
          >
            <View style={[styles.captureInner, { backgroundColor: isAligned ? '#34C759' : '#FFFFFF' }]} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  } satisfies ViewStyle,

  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  } satisfies ViewStyle,

  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  } satisfies TextStyle,

  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#4A90D9',
  } satisfies ViewStyle,

  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  } satisfies TextStyle,

  // ── Header ──

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  } satisfies ViewStyle,

  headerBack: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  } satisfies TextStyle,

  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  } satisfies TextStyle,

  headerSpacer: {
    width: 50,
  } satisfies ViewStyle,

  // ── Camera area ──

  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  } satisfies ViewStyle,

  cameraPreview: {
    flex: 1,
  } satisfies ViewStyle,

  // ── Bottom bar ──

  bottomBar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  } satisfies ViewStyle,

  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,

  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
  } satisfies ViewStyle,

  // ── Captured state ──

  capturedOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 40,
    paddingHorizontal: 24,
  } satisfies ViewStyle,

  capturedActions: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  } satisfies ViewStyle,

  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  } satisfies ViewStyle,

  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
  } satisfies TextStyle,

  actionButtonConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  } satisfies TextStyle,
});
