import { View, Text, StyleSheet, Pressable, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useCallback } from 'react';
import { MockOcrService } from '../../src/services/ocr';
import type { OcrResult } from '../../src/types/homework';

const ocrService = new MockOcrService();

type CameraPhase = 'viewfinder' | 'preview' | 'processing';

export default function CameraScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const subject = (params.subject as string) ?? 'math';
  const level = (params.level as string) ?? 'P3';

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType] = useState<CameraType>('back');
  const [phase, setPhase] = useState<CameraPhase>('viewfinder');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const cameraRef = useRef<CameraView>(null);

  /** Capture a single photo and move to preview phase. */
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    if (photo?.uri) {
      setPhotoUri(photo.uri);
      setPhase('preview');
    }
  }, []);

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
          pathname: '/(app)/manual-input',
          params: {
            subject,
            level,
            ocrJson: JSON.stringify(ocrResult),
          },
        });
      } else {
        router.push({
          pathname: '/(app)/feedback',
          params: {
            subject,
            level,
            ocrJson: JSON.stringify(ocrResult),
          },
        });
      }
    } catch {
      setPhase('preview');
      alert(t('onboarding.camera.processingFailed'));
    }
  }, [photoUri, subject, level, router, t]);

  /* ── Permission loading ──────────────────────────────────── */
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  if (!permission.granted) {
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

  /* ── Processing state ───────────────────────────────────── */
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

  /* ── Preview state (photo taken, review before confirming) ─ */
  if (phase === 'preview' && photoUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="contain" />

        <View style={styles.previewOverlay}>
          <Text style={styles.previewTitle}>
            {t('onboarding.camera.previewTitle')}
          </Text>
          <Text style={styles.previewInstructions}>
            {t('onboarding.camera.previewInstructions')}
          </Text>
        </View>

        <View style={styles.previewActions}>
          <Pressable style={styles.retakeButton} onPress={handleRetake}>
            <Text style={styles.retakeButtonText}>
              {t('onboarding.camera.retake')}
            </Text>
          </Pressable>
          <Pressable style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>
              {t('onboarding.camera.usePhoto')}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  /* ── Viewfinder state (live camera) ─────────────────────── */
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
      >
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>{t('onboarding.common.back')}</Text>
            </Pressable>
          </View>

          {/* Viewfinder frame guides */}
          <View style={styles.frameGuide}>
            <View style={styles.frameCornerTopLeft} />
            <View style={styles.frameCornerTopRight} />
            <View style={styles.frameCornerBottomLeft} />
            <View style={styles.frameCornerBottomRight} />
          </View>

          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsText}>
              {t('onboarding.camera.instructions')}
            </Text>
          </View>

          <View style={styles.bottomBar}>
            <Pressable
              style={styles.captureButton}
              onPress={handleCapture}
            >
              <View style={styles.captureInner} />
            </Pressable>
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
    justifyContent: 'flex-start',
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
  /* ── Viewfinder frame guides ──────────────── */
  frameGuide: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    right: '10%',
    bottom: '20%',
  },
  frameCornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 32,
    height: 32,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  frameCornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  frameCornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 32,
    height: 32,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  frameCornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  /* ── Viewfinder instructions ──────────────── */
  instructionsBox: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 32,
  },
  instructionsText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
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
  },
  captureInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  /* ── Preview state ────────────────────────── */
  previewImage: {
    flex: 1,
    width: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  previewInstructions: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  previewActions: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  retakeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  /* ── Shared ───────────────────────────────── */
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
