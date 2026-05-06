/**
 * Camera Screen — homework photo capture and processing pipeline.
 *
 * Flow:
 * 1. Camera preview (expo-camera)
 * 2. Kid taps capture button → photo taken
 * 3. Multi-page: "Add another page?" after each capture
 * 4. Kid taps "Done" → OCR pipeline starts
 * 5. OCR processing with progress indicator
 * 6. Low-confidence items prompt manual input
 * 7. LLM inference with progress indicator
 * 8. Navigate to result screen with response data
 *
 * @see ADD §4.1 — Camera homework check flow
 * @see ADD §4.1 — Multi-page capture
 * @see ADD §4.1 — OCR fallback
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MockInferenceBridge, type InferenceRequest } from '@tutor-sg/llm';
import { MockOcrService, type OcrService } from '@/services/ocr';
import { loadGrade, type Grade } from '@/storage/onboarding-state';
import { insertFullSession } from '@/storage/sessions';
import ErrorScreen from '@/components/ErrorScreen';

// ── Services (singletons, swap to real implementations later) ─────

const ocrService: OcrService = new MockOcrService();
const inferenceBridge = new MockInferenceBridge();

// ── Types ──────────────────────────────────────────────────────────

type ProcessingStage =
  | 'idle'           // Camera preview, waiting for capture
  | 'capturing'      // Photo just taken
  | 'ocr'            // Running OCR
  | 'manual_input'   // Waiting for user to type unclear items
  | 'inferring'      // Running LLM inference
  | 'done'           // Complete, navigating to result
  | 'error_capture'
  | 'error_processing'
  | 'error_inference'
  | 'error_permission';

interface CapturedPage {
  uri: string;
}

// ── Screen ─────────────────────────────────────────────────────────

export default function CameraScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // Capture state
  const [capturedPages, setCapturedPages] = useState<CapturedPage[]>([]);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle');
  const [statusText, setStatusText] = useState('');

  // Manual input state
  const [manualItems, setManualItems] = useState<string[]>([]);
  const [manualInputs, setManualInputs] = useState<string[]>([]);
  const [showManualModal, setShowManualModal] = useState(false);

  // Track mounted state for cleanup
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Request camera permission on mount
  const [permissionRequested, setPermissionRequested] = useState(false);
  useEffect(() => {
    if (!permission?.granted && !permissionRequested) {
      setPermissionRequested(true);
      requestPermission();
    }
  }, [permission, permissionRequested, requestPermission]);

  // Last recorded error type for ErrorScreen
  const [lastErrorVariant, setLastErrorVariant] = useState<
    'capture_error' | 'processing_error' | 'inference_error' | null
  >(null);

  // ── Capture Handler ─────────────────────────────────────────────

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current) return;

    try {
      setProcessingStage('capturing');
      setStatusText(t('cameraScreen.status.capturing'));

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (!photo || !photo.uri) {
        throw new Error('Failed to capture photo');
      }

      setCapturedPages((prev) => [...prev, { uri: photo.uri }]);
      setProcessingStage('idle');
      setStatusText('');
    } catch (error) {
      console.error('Camera capture failed:', error);
      setProcessingStage('error_capture');
      setLastErrorVariant('capture_error');
    }
  }, [t]);

  // ── Add Another Page ────────────────────────────────────────────

  const handleAddAnotherPage = useCallback(() => {
    // Reset to camera preview for next page
    setProcessingStage('idle');
  }, []);

  // ── Process All Pages ────────────────────────────────────────────

  const handleDone = useCallback(async () => {
    if (capturedPages.length === 0) return;

    try {
      // Stage 1: OCR
      setProcessingStage('ocr');
      setStatusText(t('cameraScreen.status.ocr'));

      const uris = capturedPages.map((p) => p.uri);
      const ocrResult = await ocrService.recognizeImages(uris);

      // Check if any blocks need manual input
      if (ocrResult.needsManualInput) {
        const unclearItems = ocrResult.pages
          .flatMap((page) => page.blocks)
          .filter((b) => b.confidence < 0.6)
          .map((b, i) => `Item ${i + 1}: "${b.text}" (low confidence)`);

        if (unclearItems.length > 0) {
          setManualItems(unclearItems);
          setManualInputs(new Array(unclearItems.length).fill(''));
          setShowManualModal(true);
          // Wait for manual input — handled by modal
          return;
        }
      }

      // Stage 2: LLM Inference
      await runInference(ocrResult);
    } catch (error) {
      console.error('Processing failed:', error);
      if (mountedRef.current) {
        setProcessingStage('error_processing');
        setLastErrorVariant('processing_error');
      }
    }
  }, [capturedPages, t]);

  // ── Manual Input Handler ────────────────────────────────────────

  const handleManualSubmit = useCallback(async () => {
    setShowManualModal(false);
    setProcessingStage('inferring');
    setStatusText(t('cameraScreen.status.inferring'));

    try {
      const uris = capturedPages.map((p) => p.uri);
      const ocrResult = await ocrService.recognizeImages(uris);

      // Merge manual inputs into the OCR result
      let manualIndex = 0;
      for (const page of ocrResult.pages) {
        for (const block of page.blocks) {
          if (block.confidence < 0.6 && manualIndex < manualInputs.length) {
            block.text = manualInputs[manualIndex] || block.text;
            block.manuallyEntered = true;
            block.confidence = 0.95; // Treat manual input as high confidence
            manualIndex++;
          }
        }
      }

      // Rebuild fullText with manual corrections
      ocrResult.fullText = ocrResult.pages
        .flatMap((p) => p.blocks.map((b) => b.text))
        .join('\n');

      await runInference(ocrResult);
    } catch (error) {
      console.error('Inference after manual input failed:', error);
      if (mountedRef.current) {
        setProcessingStage('error_inference');
        setLastErrorVariant('inference_error');
      }
    }
  }, [capturedPages, manualInputs, t]);

  // ── Run Inference ───────────────────────────────────────────────

  const runInference = useCallback(async (ocrResult: InferenceRequest['ocr']) => {
    setProcessingStage('inferring');
    setStatusText(t('cameraScreen.status.inferring'));

    // Load kid profile for context
    const grade = (loadGrade() ?? 'P3') as Grade;

    // Map subject: for now, let LLM auto-detect
    const request: InferenceRequest = {
      ocr: ocrResult,
      subject: 'auto',
      grade: grade,
      deviceTier: 'high',
      language: 'en',
    };

    const result = await inferenceBridge.infer(request);

    if (!mountedRef.current) return;

    if (result.error) {
      setProcessingStage('error_inference');
      setLastErrorVariant('inference_error');
      return;
    }

    // Save session to local DB
    try {
      await insertFullSession({
        sessionId: result.sessionId,
        subject: result.subject,
        grade,
        questionCount: result.questions.length,
        inferenceResult: JSON.stringify(result),
      });
    } catch (err) {
      console.warn('Failed to save session:', err);
      // Non-fatal — continue to result screen
    }

    setProcessingStage('done');

    // Navigate to result screen
    router.push({
      pathname: '/(kid)/camera-result',
      params: { sessionId: result.sessionId },
    });
  }, [t, router]);

  // ── Cancel / Retake ─────────────────────────────────────────────

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleRetake = useCallback(() => {
    setCapturedPages([]);
    setProcessingStage('idle');
    setStatusText('');
    setManualItems([]);
    setManualInputs([]);
    setLastErrorVariant(null);
  }, []);

  // ── Loading overlay ─────────────────────────────────────────────

  const ProcessingOverlay = processingStage === 'ocr' || processingStage === 'inferring' ? (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
      <View style={[styles.processingCard, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
        <ActivityIndicator size="large" color={isDark ? '#90CAF9' : '#4A90D9'} />
        <Text style={[styles.processingText, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
          {statusText}
        </Text>
        <Text style={[styles.processingSubtext, { color: isDark ? '#888888' : '#9CA3AF' }]}>
          {processingStage === 'inferring'
            ? t('cameraScreen.status.inferenceSubtext')
            : t('cameraScreen.status.ocrSubtext')}
        </Text>
      </View>
    </View>
  ) : null;

  // ── Main Render ─────────────────────────────────────────────────

  if (!permission?.granted) {
    return (
      <ErrorScreen
        variant="permission_camera"
        onAction={requestPermission}
        onSecondaryAction={handleCancel}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      {/* Camera Preview */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        autofocus="on"
        flash="auto"
      >
        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top }]}>
          <TouchableOpacity
            style={styles.topBarButton}
            onPress={handleCancel}
            accessibilityRole="button"
            accessibilityLabel={t('cameraScreen.accessibility.cancel')}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.topBarButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>

          <Text style={styles.pageCounter}>
            {capturedPages.length > 0
              ? t('cameraScreen.pages', { count: capturedPages.length })
              : t('cameraScreen.snapPrompt')}
          </Text>

          {/* Spacer for symmetry */}
          <View style={{ width: 60 }} />
        </View>

        {/* Capture area info */}
        <View style={styles.captureHint}>
          <Text style={styles.captureHintText}>
            {capturedPages.length === 0
              ? t('cameraScreen.hint.singlePage')
              : t('cameraScreen.hint.morePages')}
          </Text>
        </View>

        {/* Bottom controls */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
          {capturedPages.length > 0 ? (
            /* Multi-page: show Done + Add Another */
            <View style={styles.multiPageControls}>
              <TouchableOpacity
                style={[styles.controlButton, styles.secondaryButton]}
                onPress={handleAddAnotherPage}
                accessibilityRole="button"
                accessibilityLabel={t('cameraScreen.addAnother')}
              >
                <Text style={styles.secondaryButtonText}>
                  {t('cameraScreen.addAnother')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.primaryButton, { opacity: processingStage !== 'idle' ? 0.5 : 1 }]}
                onPress={handleDone}
                disabled={processingStage !== 'idle'}
                accessibilityRole="button"
                accessibilityLabel={t('cameraScreen.done')}
              >
                <Text style={styles.primaryButtonText}>
                  {t('cameraScreen.done')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Initial: show capture button */
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCapture}
              accessibilityRole="button"
              accessibilityLabel={t('cameraScreen.accessibility.capture')}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          )}

          {/* Thumbnails row */}
          {capturedPages.length > 0 && processingStage === 'idle' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailRow}
              contentContainerStyle={styles.thumbnailRowContent}
            >
              {capturedPages.map((page, index) => (
                <View key={index} style={[styles.thumbnail, { borderColor: isDark ? '#555' : '#ccc' }]}>
                  <Text style={styles.thumbnailText}>📄 {index + 1}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </CameraView>

      {/* Processing Overlay */}
      {ProcessingOverlay}

      {/* Manual Input Modal */}
      <Modal
        visible={showManualModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowManualModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
              {t('cameraScreen.manualInput.title')}
            </Text>
            <Text style={[styles.modalSubtitle, { color: isDark ? '#AAAAAA' : '#6B7280' }]}>
              {t('cameraScreen.manualInput.description')}
            </Text>

            <ScrollView style={styles.manualInputList}>
              {manualItems.map((item, index) => (
                <View key={index} style={styles.manualInputRow}>
                  <Text style={[styles.manualInputLabel, { color: isDark ? '#CCCCCC' : '#4A5568' }]}>
                    {item}
                  </Text>
                  <TextInput
                    style={[
                      styles.manualTextInput,
                      {
                        backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6',
                        color: isDark ? '#FFFFFF' : '#1A1A1A',
                        borderColor: isDark ? '#444' : '#D1D5DB',
                      },
                    ]}
                    placeholder={t('cameraScreen.manualInput.placeholder')}
                    placeholderTextColor={isDark ? '#666' : '#9CA3AF'}
                    value={manualInputs[index] ?? ''}
                    onChangeText={(text) => {
                      const newInputs = [...manualInputs];
                      newInputs[index] = text;
                      setManualInputs(newInputs);
                    }}
                    autoFocus={index === 0}
                    accessibilityLabel={t('cameraScreen.manualInput.accessibility', {
                      item: index + 1,
                    })}
                  />
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: isDark ? '#2563EB' : '#4A90D9' }]}
              onPress={handleManualSubmit}
              accessibilityRole="button"
              accessibilityLabel={t('cameraScreen.manualInput.submit')}
            >
              <Text style={styles.modalButtonText}>
                {t('cameraScreen.manualInput.submit')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error State (capture, processing, or inference) */}
      {(processingStage === 'error_capture' ||
        processingStage === 'error_processing' ||
        processingStage === 'error_inference') && (
        <View style={styles.errorOverlay}>
          <ErrorScreen
            variant={lastErrorVariant ?? 'generic'}
            onAction={handleRetake}
            onSecondaryAction={handleCancel}
            style={{ position: 'relative', flex: undefined }}
          />
        </View>
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Camera Preview ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topBarButton: { paddingVertical: 8, paddingHorizontal: 4 },
  topBarButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' },
  pageCounter: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', opacity: 0.9 },

  captureHint: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  captureHintText: {
    color: '#FFFFFF',
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.7,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },

  bottomBar: {
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },

  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
  },

  multiPageControls: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    paddingHorizontal: 16,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: { backgroundColor: '#4A90D9' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryButton: { backgroundColor: 'rgba(255,255,255,0.2)' },
  secondaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  thumbnailRow: { maxHeight: 60, width: '100%', paddingHorizontal: 16 },
  thumbnailRowContent: { gap: 8, paddingVertical: 4 },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  thumbnailText: { fontSize: 10, color: '#FFFFFF' },

  // ── Processing Overlay ──
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  processingCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
    minWidth: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  processingText: { fontSize: 17, fontWeight: '600', textAlign: 'center' },
  processingSubtext: { fontSize: 13, textAlign: 'center', lineHeight: 18 },

  // ── Manual Input Modal ──
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 24,
    gap: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalSubtitle: { fontSize: 14, lineHeight: 20 },
  manualInputList: { maxHeight: 300, gap: 12 },
  manualInputRow: { gap: 6, marginBottom: 12 },
  manualInputLabel: { fontSize: 12, fontWeight: '500' },
  manualTextInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  modalButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  // ── Error Overlay ──
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
