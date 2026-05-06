import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useCallback } from 'react';
import { MockOcrService } from '../../src/services/ocr';
import type { OcrResult } from '../../src/types/homework';

const ocrService = new MockOcrService();

export default function CameraScreen() {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh-Hans';
  const router = useRouter();
  const params = useLocalSearchParams();
  const subject = (params.subject as string) ?? 'math';
  const level = (params.level as string) ?? 'P3';

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedUris, setCapturedUris] = useState<string[]>([]);

  const cameraRef = useRef<CameraView>(null);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    if (photo?.uri) {
      setCapturedUris((prev) => [...prev, photo.uri]);
    }
  }, []);

  const handleProcess = useCallback(async () => {
    if (capturedUris.length === 0) return;
    setIsProcessing(true);

    try {
      const ocrResults: OcrResult[] = [];
      for (const uri of capturedUris) {
        const result = await ocrService.processImage(uri);
        ocrResults.push(result);
      }

      const merged: OcrResult = {
        blocks: ocrResults.flatMap((r) => r.blocks),
        lowConfidenceBlocks: ocrResults.flatMap((r) => r.lowConfidenceBlocks),
        imageUri: capturedUris[0],
        pageCount: capturedUris.length,
        timestamp: Date.now(),
      };

      if (merged.lowConfidenceBlocks.length > 0) {
        router.push({
          pathname: '/(app)/manual-input',
          params: {
            subject,
            level,
            ocrJson: JSON.stringify(merged),
          },
        });
      } else {
        router.push({
          pathname: '/(app)/feedback',
          params: {
            subject,
            level,
            ocrJson: JSON.stringify(merged),
          },
        });
      }
    } catch {
      alert(t('onboarding.camera.processingFailed'));
    } finally {
      setIsProcessing(false);
    }
  }, [capturedUris, subject, level, isZh, router]);

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

  if (isProcessing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90D9" />
        <Text style={styles.processingText}>
          {t('onboarding.camera.processing')}
        </Text>
      </View>
    );
  }

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
            <Text style={styles.pageIndicator}>
              {capturedUris.length > 0 ? t('onboarding.camera.pageCount', { count: capturedUris.length }) : ''}
            </Text>
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

            {capturedUris.length > 0 && (
              <View style={styles.actionRow}>
                <Pressable style={styles.retakeButton} onPress={() => setCapturedUris([])}>
                  <Text style={styles.retakeButtonText}>
                    {t('onboarding.camera.retake')}
                  </Text>
                </Pressable>
                <Pressable style={styles.processButton} onPress={handleProcess}>
                  <Text style={styles.processButtonText}>
                    {capturedUris.length > 1
                      ? t('onboarding.camera.done')
                      : t('onboarding.camera.usePhoto')}
                  </Text>
                </Pressable>
              </View>
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
  pageIndicator: {
    color: '#fff',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  instructionsBox: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  instructionsText: {
    color: '#fff',
    fontSize: 16,
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
  actionRow: {
    flexDirection: 'row',
    gap: 16,
  },
  retakeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  processButton: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
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
