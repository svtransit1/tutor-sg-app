import { View, Text, StyleSheet, Pressable, ActivityIndicator, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useCallback, useEffect } from 'react';
import { MockOcrService } from '../../src/services/ocr';
import type { OcrResult } from '../../src/types/homework';

const ocrService = new MockOcrService();

type CameraPhase = 'viewfinder' | 'preview' | 'processing';

export default function KidCameraScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const subject = (params.subject as string) ?? 'math';
  const level = (params.level as string) ?? 'P3';

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType] = useState<CameraType>('back');
  const [phase, setPhase] = useState<CameraPhase>('viewfinder');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  // Camera flash cleanup — stop flash when leaving viewfinder
  useEffect(() => {
    if (phase !== 'viewfinder') {
      setIsCameraReady(false);
    }
  }, [phase]);

  /** Capture a single photo and move to preview phase. */
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      });
      if (photo?.uri) {
        setPhotoUri(photo.uri);
        setPhase('preview');
      }
    } catch {
      Alert.alert(t('onboarding.common.error'), t('onboarding.camera.captureFailed'));
    }
  }, [t]);

  /** Discard the current photo and go back to the viewfinder. */
  const handleRetake = useCallback(() => {
    setPhotoUri(null);
    setPhase('viewfinder');
  }, []);

  /** Confirm the photo and start OCR processing. */
  const handleConfirm = useCallback(async () => {
    if (!photoUri) return;
    setPhase('processing');

    try {
      const result = await ocrService.processImage(photoUri);

      const ocrResult: OcrResult = {
        blocks: result.blocks,
        lowConfidenceBlocks: result.lowConfidenceBlocks,
        imageUri: photoUri,
        pageCount: 1,
        timestamp: Date.now(),
      };

      if (ocrResult.lowConfidenceBlocks.length > 0) {
        router.push({
          pathname: '/(kid)/manual-input',
          params: {
            subject,
            level,
            ocrJson: JSON.stringify(ocrResult),
          },
        });
      } else {
        router.push({
          pathname: '/(kid)/feedback',
          params: {
            subject,
            level,
            ocrJson: JSON.stringify(ocrResult),
          },
        });
      }
    } catch {
      setPhase('preview');
      Alert.alert(t('onboarding.common.error'), t('onboarding.camera.processingFailed'));
    }
  }, [photoUri, subject, level, router, t]);

  /* ── Permission loading (for expo-camera) ─── */
  if (!permission && phase === 'viewfinder') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  /* ── Camera permission denied screen ─── */
  if (permission && !permission.granted && phase === 'viewfinder') {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>
          {t('onboarding.camera.permissionDenied')}
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>
            {t('onboarding.camera.requestPermission')}
          </Text>
        </Pressable>
      </View>
    );
  }

  /* ── Processing screen ─── */
  if (phase === 'processing') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90D9" />
        <Text style={styles.processingText}>
          {t('onboarding.camera.processing')}
        </Text>
      </View>
    );
  }

  /* ── Preview phase ─── */
  if (phase === 'preview' && photoUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photoUri }} style={styles.preview} />
        <View style={styles.previewOverlay}>
          <Text style={styles.previewTitle}>
            {t('onboarding.camera.previewTitle')}
          </Text>
          <Text style={styles.previewInstructions}>
            {t('onboarding.camera.previewInstructions')}
          </Text>
          <View style={styles.previewActions}>
            <Pressable style={styles.retakeButton} onPress={handleRetake}>
              <Text style={styles.retakeButtonText}>
                {t('onboarding.camera.retake')}
              </Text>
            </Pressable>
            <Pressable style={styles.processButton} onPress={handleConfirm}>
              <Text style={styles.processButtonText}>
                {t('onboarding.camera.usePhoto')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  /* ── Viewfinder (camera live view) ─── */
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        onCameraReady={() => setIsCameraReady(true)}
      >
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>{t('onboarding.common.back')}</Text>
            </Pressable>
            <Text style={styles.instructionsText}>
              {t('onboarding.camera.instructions')}
            </Text>
          </View>

          <View style={styles.bottomBar}>
            {/* Shutter button */}
            {isCameraReady && (
              <Pressable style={styles.captureButton} onPress={handleCapture}>
                <View style={styles.captureInner} />
              </Pressable>
            )}

            {!isCameraReady && (
              <ActivityIndicator size="small" color="#fff" />
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsText: {
    color: '#fff',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    maxWidth: '60%',
    textAlign: 'center',
  },
  bottomBar: {
    alignItems: 'center',
    paddingBottom: 48,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 48,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  previewInstructions: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 20,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 16,
  },
  retakeButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  processButton: {
    flex: 1,
    backgroundColor: '#4A90D9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  processButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionButton: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  processingText: {
    fontSize: 18,
    color: '#333',
    marginTop: 16,
  },
});
