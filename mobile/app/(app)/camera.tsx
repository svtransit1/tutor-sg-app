import { View, Text, StyleSheet, Pressable, ActivityIndicator, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  scanDocumentAsync,
  isDocumentScannerAvailable,
  checkImageBrightnessAsync,
} from '../../modules/expo-document-camera/src/index';
import { MockOcrService } from '../../src/services/ocr';
import type { OcrResult } from '../../src/types/homework';

const ocrService = new MockOcrService();

type CameraPhase = 'ready' | 'viewfinder' | 'preview' | 'processing';

/** Brightness thresholds for low-light hint (0–255 scale). */
const BRIGHTNESS_VERY_DARK = 50;
const BRIGHTNESS_DIM = 100;

export default function CameraScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const subject = (params.subject as string) ?? 'math';
  const level = (params.level as string) ?? 'P3';

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType] = useState<CameraType>('back');
  const [phase, setPhase] = useState<CameraPhase>('ready');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [lowLightHint, setLowLightHint] = useState<string | null>(null);
  const [docScannerAvailable, setDocScannerAvailable] = useState<boolean | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const cameraRef = useRef<CameraView>(null);
  const photoUriRef = useRef<string | null>(null);

  // Check if native document scanner is available on mount
  useEffect(() => {
    isDocumentScannerAvailable()
      .then((available) => setDocScannerAvailable(available))
      .catch(() => setDocScannerAvailable(false));
  }, []);

  /**
   * Delete a photo file from the app sandbox.
   * Photos are stored in the app cache/temp dir — never camera roll, never uploaded.
   */
  const deletePhoto = useCallback(async (uri: string | null) => {
    if (!uri) return;
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch {
      // Best-effort cleanup — swallow errors
    }
  }, []);

  // Keep ref in sync so cleanup always has the latest URI
  useEffect(() => {
    photoUriRef.current = photoUri;
  }, [photoUri]);

  // Cleanup: delete captured photo when the screen unmounts (navigation away)
  useEffect(() => {
    return () => {
      const uri = photoUriRef.current;
      if (uri) {
        FileSystem.getInfoAsync(uri).then((info) => {
          if (info.exists) {
            FileSystem.deleteAsync(uri, { idempotent: true });
          }
        }).catch(() => {});
      }
    };
  }, []);

  /**
   * Analyze the captured image for low-light conditions.
   * Sets a bilingual hint string if the image is too dark.
   */
  const checkLowLight = useCallback(async (uri: string) => {
    try {
      const brightness = await checkImageBrightnessAsync(uri);

      if (brightness < BRIGHTNESS_VERY_DARK) {
        setLowLightHint(t('onboarding.camera.lowLightVeryDark'));
      } else if (brightness < BRIGHTNESS_DIM) {
        setLowLightHint(t('onboarding.camera.lowLightDim'));
      } else {
        setLowLightHint(null);
      }
    } catch {
      // Brightness check is best-effort; proceed without hint
      setLowLightHint(null);
    }
  }, [t]);

  /**
   * Open the native document scanner or fall back to the manual camera.
   *
   * On devices with VNDocumentCameraViewController (iOS 13+) or
   * ML Kit Document Scanner (Android), this opens the native scanner
   * which provides auto-crop + perspective correction automatically.
   *
   * On other devices, falls back to the manual expo-camera viewfinder.
   */
  const handleStartScan = useCallback(async () => {
    setScanError(null);
    setLowLightHint(null);

    // Path A: Native document scanner (auto-crop + perspective correction)
    if (docScannerAvailable) {
      try {
        const result = await scanDocumentAsync();
        if (result) {
          setPhotoUri(result.uri);
          setPhase('preview');
          // Check brightness after scan
          await checkLowLight(result.uri);
        }
        // User cancelled — stay on ready screen
        return;
      } catch (err) {
        // Native scanner failed — fall through to expo-camera
        console.warn('Native document scanner failed, falling back to camera:', err);
      }
    }

    // Path B: Fall back to expo-camera viewfinder
    // Check camera permission first
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }

    setPhase('viewfinder');
  }, [docScannerAvailable, permission, requestPermission, checkLowLight]);

  /**
   * Capture a single photo using expo-camera and move to preview phase.
   *
   * This path is used when the native document scanner is unavailable.
   * Without the native scanner, auto-crop and perspective correction
   * are not applied (these require VNDocumentCameraViewController on iOS
   * or ML Kit Document Scanner on Android).
   */
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      });
      if (photo?.uri) {
        // Delete previous photo if retaking
        await deletePhoto(photoUriRef.current);
        setPhotoUri(photo.uri);
        setPhase('preview');
        await checkLowLight(photo.uri);
      }
    } catch {
      Alert.alert(t('onboarding.common.error'), t('onboarding.camera.captureFailed'));
    }
  }, [deletePhoto, checkLowLight, t]);

  /** Discard the current photo and go back to the ready screen. */
  const handleRetake = useCallback(async () => {
    await deletePhoto(photoUriRef.current);
    setPhotoUri(null);
    setLowLightHint(null);
    setScanError(null);
    setPhase('ready');
  }, [deletePhoto]);

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
      Alert.alert(t('onboarding.common.error'), t('onboarding.camera.processingFailed'));
    }
  }, [photoUri, subject, level, router, t]);

  // Show a dismissible low-light hint banner
  const dismissLowLight = useCallback(() => setLowLightHint(null), []);

  /* ── Permission loading (for expo-camera fallback path) ─── */
  if (!permission && phase === 'viewfinder') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90D9" />
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

        {/* Low-light hint banner */}
        {lowLightHint && (
          <View style={styles.lowLightBanner}>
            <Text style={styles.lowLightText}>{lowLightHint}</Text>
            <Pressable onPress={dismissLowLight} style={styles.lowLightDismiss}>
              <Text style={styles.lowLightDismissText}>✕</Text>
            </Pressable>
          </View>
        )}

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

  /* ── Viewfinder state (expo-camera fallback) ────────────── */
  if (phase === 'viewfinder') {
    if (!permission?.granted) {
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

    return (
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType}
          flash="auto"
          onCameraReady={() => setIsCameraReady(true)}
        >
          <View style={styles.overlay}>
            <View style={styles.topBar}>
              <Pressable style={styles.backButton} onPress={() => { setPhase('ready'); }}>
                <Text style={styles.backButtonText}>{t('onboarding.common.back')}</Text>
              </Pressable>
            </View>

            {/* Viewfinder frame guides — visual aid for framing the worksheet */}
            <View style={styles.frameGuide}>
              <View style={styles.frameCornerTopLeft} />
              <View style={styles.frameCornerTopRight} />
              <View style={styles.frameCornerBottomLeft} />
              <View style={styles.frameCornerBottomRight} />
            </View>

            {/* Low-light info text */}
            <View style={styles.lowLightNote}>
              <Text style={styles.lowLightNoteText}>
                {t('onboarding.camera.lowLightViewfinder')}
              </Text>
            </View>

            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsText}>
                {t('onboarding.camera.instructions')}
              </Text>
            </View>

            <View style={styles.bottomBar}>
              <Pressable
                style={[styles.captureButton, !isCameraReady && styles.captureButtonDisabled]}
                onPress={handleCapture}
                disabled={!isCameraReady}
              >
                <View style={styles.captureInner} />
              </Pressable>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  /* ── Ready state (initial, choose scan method) ──────────── */
  return (
    <View style={styles.container}>
      {/* Simple instruction screen */}
      <View style={styles.readyContainer}>
        <Text style={styles.readyTitle}>
          {docScannerAvailable
            ? t('onboarding.camera.readyTitleScanner')
            : t('onboarding.camera.readyTitleCamera')}
        </Text>
        <Text style={styles.readyInstructions}>
          {t('onboarding.camera.readyInstructions')}
        </Text>

        {/* Show scan error if previous attempt failed */}
        {scanError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{scanError}</Text>
          </View>
        )}

        <Pressable style={styles.readyScanButton} onPress={handleStartScan}>
          <Text style={styles.readyScanButtonText}>
            {docScannerAvailable
              ? t('onboarding.camera.startScan')
              : t('onboarding.camera.openCamera')}
          </Text>
        </Pressable>

        <Pressable style={styles.readyBackButton} onPress={() => router.back()}>
          <Text style={styles.readyBackButtonText}>
            {t('onboarding.common.back')}
          </Text>
        </Pressable>
      </View>
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
  /* ── Low-light hint (viewfinder) ──────────── */
  lowLightNote: {
    position: 'absolute',
    top: '12%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 200, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lowLightNoteText: {
    color: 'rgba(255,255,200,0.9)',
    fontSize: 13,
    textAlign: 'center',
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
  captureButtonDisabled: {
    opacity: 0.4,
  },
  captureInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  /* ── Ready state ──────────────────────────── */
  readyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 32,
  },
  readyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 12,
  },
  readyInstructions: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  readyScanButton: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 14,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: 16,
  },
  readyScanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  readyBackButton: {
    paddingVertical: 12,
  },
  readyBackButtonText: {
    color: '#4A90D9',
    fontSize: 16,
    fontWeight: '600',
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
  /* ── Low-light banner (preview) ───────────── */
  lowLightBanner: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 180, 0, 0.9)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lowLightText: {
    flex: 1,
    color: '#1a1a2e',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  lowLightDismiss: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lowLightDismissText: {
    color: '#1a1a2e',
    fontSize: 12,
    fontWeight: '700',
  },
  /* ── Error banner ─────────────────────────── */
  errorBanner: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
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
