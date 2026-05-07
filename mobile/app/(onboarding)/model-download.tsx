/**
 * Model Download route — Onboarding step 9/11.
 * Route: /onboarding/model-download
 *
 * Wired controls: pause/cancel/retry + cellular warning via NetInfo.
 * Per Article 12 §3.9: Download progress screen with resumable download,
 * progress bar, pause/resume, cellular warning, hash verification.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import NetInfo from '@react-native-community/netinfo';
import { useOnboarding } from '../../src/onboarding';

type DownloadPhase = 'downloading' | 'paused' | 'verifying' | 'completed' | 'error' | 'cellular_warning';

const MOCK_TOTAL_BYTES = 2_000_000_000;
const MOCK_SPEED = 10_000_000;

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(0)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

export default function ModelDownloadRoute() {
  const { t } = useTranslation();
  const { goNext } = useOnboarding();

  const [phase, setPhase] = useState<DownloadPhase>('downloading');
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [isCellular, setIsCellular] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cellularNotifiedRef = useRef(false);

  const percent = Math.min(100, Math.round((downloadedBytes / MOCK_TOTAL_BYTES) * 100));

  // Detect network type on mount
  useEffect(() => {
    NetInfo.fetch().then((s) => {
      const cellular =
        s.isConnected === true &&
        (s.type === 'cellular' ||
          s.type === 'cellular_2g' ||
          s.type === 'cellular_3g' ||
          s.type === 'cellular_4g' ||
          s.type === 'cellular_5g');
      setIsCellular(cellular);
    });
  }, []);

  const startDownload = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDownloadedBytes((prev) => {
        const next = prev + MOCK_SPEED;
        if (next >= MOCK_TOTAL_BYTES) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setPhase('verifying');
          setTimeout(() => setPhase('completed'), 1000);
          return MOCK_TOTAL_BYTES;
        }
        return next;
      });
    }, 100);
  }, []);

  useEffect(() => {
    // Show cellular warning before starting download
    if (isCellular && !cellularNotifiedRef.current) {
      cellularNotifiedRef.current = true;
      setPhase('cellular_warning');
      return;
    }

    startDownload();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isCellular, startDownload]);

  const handlePause = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase('paused');
  }, []);

  const handleResume = useCallback(() => {
    startDownload();
    setPhase('downloading');
    setErrorMessage(null);
  }, [startDownload]);

  const handleCancel = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDownloadedBytes(0);
    setPhase('downloading');
    setErrorMessage(null);
    cellularNotifiedRef.current = false;
    goNext();
  }, [goNext]);

  const handleRetry = useCallback(() => {
    setDownloadedBytes(0);
    setErrorMessage(null);
    startDownload();
    setPhase('downloading');
  }, [startDownload]);

  const handleContinue = useCallback(() => {
    goNext();
  }, [goNext]);

  const handleCellularProceed = useCallback(() => {
    setPhase('downloading');
    startDownload();
  }, [startDownload]);

  const handleCellularCancel = useCallback(() => {
    setPhase('paused');
    goNext();
  }, [goNext]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Mascot */}
        <View style={styles.mascotWrap}>
          <Text style={styles.mascot}>📚</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{t('modelDownload.title')}</Text>

        {/* Privacy note */}
        <Text style={styles.privacyText}>
          {t('modelDownload.privacyNote')}
        </Text>

        {/* Progress / error section */}
        {phase !== 'error' && phase !== 'cellular_warning' && (
          <>
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${percent}%` },
                    phase === 'paused' && styles.progressPaused,
                    phase === 'completed' && styles.progressComplete,
                  ]}
                />
              </View>

              <Text style={styles.progressText}>
                {formatBytes(downloadedBytes)} / {formatBytes(MOCK_TOTAL_BYTES)}
              </Text>

              <Text style={styles.percentText}>
                {phase === 'downloading' && t('modelDownload.progressPercent', { percent })}
                {phase === 'paused' && t('modelDownload.paused')}
                {phase === 'verifying' && 'Verifying...'}
                {phase === 'completed' && t('modelDownload.completed')}
              </Text>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              {phase === 'downloading' && (
                <>
                  <TouchableOpacity
                    style={styles.controlBtn}
                    onPress={handlePause}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={t('modelDownload.pause')}
                  >
                    <Text style={styles.controlBtnText}>
                      {t('modelDownload.pause')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.controlBtn}
                    onPress={handleCancel}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={t('modelDownload.cancel')}
                  >
                    <Text style={styles.controlBtnTextCancel}>
                      {t('modelDownload.cancel')}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              {phase === 'paused' && (
                <>
                  <TouchableOpacity
                    style={[styles.controlBtn, styles.controlBtnPrimary]}
                    onPress={handleResume}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={t('modelDownload.resume')}
                  >
                    <Text style={[styles.controlBtnText, styles.controlBtnTextPrimary]}>
                      {t('modelDownload.resume')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.controlBtn}
                    onPress={handleCancel}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={t('modelDownload.cancel')}
                  >
                    <Text style={styles.controlBtnTextCancel}>
                      {t('modelDownload.cancel')}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {phase === 'completed' && (
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={handleContinue}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={t('common.continue', 'Continue')}
              >
                <Text style={styles.btnPrimaryText}>
                  {t('common.continue', 'Continue')}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Error state */}
        {phase === 'error' && (
          <View style={styles.errorSection}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>
              {errorMessage || t('modelDownload.errors.unknown_error')}
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={handleRetry}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('modelDownload.retry')}
            >
              <Text style={styles.retryBtnText}>
                {t('modelDownload.retry')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelLink}
              onPress={handleCancel}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('modelDownload.cancel')}
            >
              <Text style={styles.cancelLinkText}>
                {t('modelDownload.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Why is this needed? */}
        <TouchableOpacity
          style={styles.whyLink}
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <Text style={styles.whyLinkText}>
            {t('modelDownload.whyNeeded')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cellular warning overlay */}
      {phase === 'cellular_warning' && (
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalIcon}>📶</Text>
            <Text style={styles.modalTitle}>
              {t('modelDownload.cellularWarning', {
                size: formatBytes(MOCK_TOTAL_BYTES),
              })}
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalBtnSec}
                onPress={handleCellularCancel}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={t('modelDownload.cellularCancel')}
              >
                <Text style={styles.modalBtnSecText}>
                  {t('modelDownload.cellularCancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnPri}
                onPress={handleCellularProceed}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={t('modelDownload.cellularProceed')}
              >
                <Text style={styles.modalBtnPriText}>
                  {t('modelDownload.cellularProceed')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },

  mascotWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  mascot: { fontSize: 48 },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 36,
    paddingHorizontal: 16,
  },

  progressSection: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    marginBottom: 32,
  },

  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  progressPaused: { backgroundColor: '#F59E0B' },
  progressComplete: { backgroundColor: '#22C55E' },

  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  percentText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },

  controls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  controlBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  controlBtnPrimary: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  controlBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  controlBtnTextCancel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
  controlBtnTextPrimary: { color: '#FFFFFF' },

  errorSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorText: {
    fontSize: 15,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    backgroundColor: '#2563EB',
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelLink: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelLinkText: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'underline',
  },

  btnPrimary: {
    width: '100%',
    maxWidth: 400,
    height: 56,
    backgroundColor: '#22C55E',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

  whyLink: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  whyLinkText: {
    fontSize: 13,
    color: '#9CA3AF',
    textDecorationLine: 'underline',
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modal: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },
  modalIcon: { fontSize: 40, marginBottom: 16 },
  modalTitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 24,
  } as TextStyle,
  modalBtns: { width: '100%', gap: 10 },
  modalBtnPri: {
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnPriText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  modalBtnSec: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  modalBtnSecText: { color: '#374151', fontSize: 15, fontWeight: '500' },
});
