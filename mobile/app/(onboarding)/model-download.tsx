/**
 * Model Download route — Onboarding step 9/10.
 * Route: /onboarding/model-download
 *
 * Per Article 12 §3.9: Download progress screen with resumable download,
 * progress bar, pause/resume, cellular warning, hash verification.
 * Most users see this for 1–3 minutes.
 *
 * Loading states:
 * 1. Preparing skeleton (1.2s) — animated placeholder before download starts
 * 2. Download progress — progress bar with byte count and controls
 * 3. Verifying — hash verification animation
 * 4. Completed — success state with continue button
 * 5. Error — retry prompt
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  type TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../../src/onboarding';
import { SkeletonDownloadPrep } from '../../src/components';

// ── Types & Constants ──────────────────────────────────────────────

type DownloadPhase = 'preparing' | 'downloading' | 'paused' | 'verifying' | 'completed' | 'error';

const PREP_DURATION_MS = 1200; // Show skeleton for 1.2s before download starts
const MOCK_TOTAL_BYTES = 2_000_000_000; // ~2 GB for demo
const MOCK_SPEED = 10_000_000; // ~10 MB/s

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(0)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

// ── Component ──────────────────────────────────────────────────────

export default function ModelDownloadRoute() {
  const { t } = useTranslation();
  const { goNext } = useOnboarding();
  const isDark = useColorScheme() === 'dark';

  const [phase, setPhase] = useState<DownloadPhase>('preparing');
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [showCellularWarning, setShowCellularWarning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const percent = Math.min(100, Math.round((downloadedBytes / MOCK_TOTAL_BYTES) * 100));

  // ── Download Simulation ──────────────────────────────────────────

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

  // Show preparing skeleton, then start download
  useEffect(() => {
    const prepTimer = setTimeout(() => {
      setPhase('downloading');
      startDownload();
    }, PREP_DURATION_MS);

    return () => {
      clearTimeout(prepTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startDownload]);

  // ── Handlers ─────────────────────────────────────────────────────

  const handlePause = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase('paused');
  }, []);

  const handleResume = useCallback(() => {
    startDownload();
    setPhase('downloading');
    setErrorMessage(null);
  }, [startDownload]);

  const handleRetry = useCallback(() => {
    setDownloadedBytes(0);
    setErrorMessage(null);
    setPhase('downloading');
    startDownload();
  }, [startDownload]);

  const handleContinue = useCallback(() => {
    goNext();
  }, [goNext]);

  const handleCancel = useCallback(() => {
    goNext();
  }, [goNext]);

  const handleWifiToggle = useCallback(() => {
    setWifiOnly((prev) => !prev);
  }, []);

  const handleShowCellularWarning = useCallback(() => {
    if (wifiOnly) setShowCellularWarning(true);
  }, [wifiOnly]);

  const handleCellularProceed = useCallback(() => {
    setWifiOnly(false);
    setShowCellularWarning(false);
    handleResume();
  }, [handleResume]);

  const handleCellularCancel = useCallback(() => {
    setShowCellularWarning(false);
    handlePause();
  }, [handlePause]);

  // ── Render ───────────────────────────────────────────────────────

  const bgColor = isDark ? '#121212' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const mutedColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.content}>
        {phase === 'preparing' ? (
          /* ── Preparing Skeleton ── */
          <SkeletonDownloadPrep isDark={isDark} />
        ) : (
          <>
            {/* Mascot illustration */}
            <View style={styles.mascotWrap}>
              <Text style={styles.mascot}>📚</Text>
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: textColor }]}>
              {t('modelDownload.title', 'Setting up your tutor...')}
            </Text>

            {/* Privacy reassurance */}
            <Text style={[styles.privacyText, { color: mutedColor }]}>
              This is a one-time download. Once done, the tutor works fully
              offline and keeps your child's data on this device.
            </Text>

            {/* Progress Section (hidden during error) */}
            {phase !== 'error' && (
              <View style={styles.progressSection}>
                {/* Progress bar */}
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${percent}%` },
                      phase === 'paused' && styles.progressFillPaused,
                      phase === 'completed' && styles.progressFillComplete,
                    ]}
                  />
                </View>

                {/* Progress text */}
                <Text style={[styles.progressText, { color: textColor }]}>
                  {formatBytes(downloadedBytes)} / {formatBytes(MOCK_TOTAL_BYTES)}
                </Text>

                {/* Status label */}
                <Text style={[styles.percentText, { color: mutedColor }]}>
                  {t('modelDownload.progressPercent', { percent })} —
                  {phase === 'downloading' && ` ${t('modelDownload.progress', { fileName: 'AI Model' })}`}
                  {phase === 'paused' && ` ${t('modelDownload.paused')}`}
                  {phase === 'verifying' && ' Verifying...'}
                  {phase === 'completed' && ` ${t('modelDownload.completed')}`}
                </Text>

                {/* Controls */}
                <View style={styles.controls}>
                  {phase === 'downloading' && (
                    <TouchableOpacity
                      style={styles.controlBtn}
                      onPress={handlePause}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.controlBtnText}>⏸ {t('common.cancel', 'Pause')}</Text>
                    </TouchableOpacity>
                  )}
                  {phase === 'paused' && (
                    <TouchableOpacity
                      style={[styles.controlBtn, styles.controlBtnPrimary]}
                      onPress={handleResume}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.controlBtnText, styles.controlBtnTextPrimary]}>
                        ▶ {t('common.cancel', 'Resume')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Wi-Fi toggle */}
                <TouchableOpacity
                  style={styles.wifiToggle}
                  onPress={handleWifiToggle}
                  activeOpacity={0.7}
                >
                  <Text style={styles.wifiToggleText}>
                    {wifiOnly ? '📶 Wi-Fi only' : '📶 Any network'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Error state */}
            {phase === 'error' && (
              <View style={styles.errorSection}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>
                  {errorMessage || 'Something went wrong. Please check your connection.'}
                </Text>
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={handleRetry}
                  activeOpacity={0.8}
                >
                  <Text style={styles.retryBtnText}>
                    {t('modelDownload.retry', 'Retry')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Continue button (after completion) */}
            {phase === 'completed' && (
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <Text style={styles.btnPrimaryText}>
                  {t('common.cancel', 'Continue')}
                </Text>
              </TouchableOpacity>
            )}

            {/* "Why is this needed?" link */}
            <TouchableOpacity
              style={styles.whyLink}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <Text style={styles.whyLinkText}>
                Why is this needed? / 为什么需要下载？
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Cellular warning overlay */}
      {showCellularWarning && (
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: bgColor }]}>
            <Text style={styles.modalIcon}>📶</Text>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Large download over cellular
            </Text>
            <Text style={[styles.modalBody, { color: mutedColor }]}>
              Downloading {formatBytes(MOCK_TOTAL_BYTES)} over cellular may
              use a lot of data. Switch to Wi-Fi to save data?
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalBtnSec}
                onPress={handleCellularCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnSecText}>Wait for Wi-Fi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnPri}
                onPress={handleCellularProceed}
                activeOpacity={0.8}
              >
                <Text style={styles.modalBtnPriText}>Download anyway</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    textAlign: 'center',
    marginBottom: 12,
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 20,
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

  progressBarBg: {
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
  progressFillPaused: {
    backgroundColor: '#F59E0B',
  },
  progressFillComplete: {
    backgroundColor: '#22C55E',
  },

  progressText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  percentText: {
    fontSize: 14,
    marginBottom: 24,
  },

  controls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
  controlBtnTextPrimary: {
    color: '#FFFFFF',
  },

  wifiToggle: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  wifiToggleText: {
    fontSize: 13,
    color: '#6B7280',
  },

  // Error
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

  // Continue
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

  // Overlay
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
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },
  modalIcon: { fontSize: 40, marginBottom: 16 },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalBody: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalBtns: {
    width: '100%',
    gap: 10,
  },
  modalBtnPri: {
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnPriText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalBtnSec: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  modalBtnSecText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '500',
  },
} as TextStyle);
