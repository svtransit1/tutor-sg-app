import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { DownloadProgress, DownloadPhase } from '../models/model-download';
import type { ModelDownloadError } from '../models/model-download-errors';

interface Props {
  progress: DownloadProgress;
  error: ModelDownloadError | null;
  errorI18nKey: string | null;
  isIdle: boolean;
  isChecking: boolean;
  isDownloading: boolean;
  isVerifying: boolean;
  isPaused: boolean;
  isDone: boolean;
  isError: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onRetry: () => void;
  onBack?: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(0)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec === 0) return '—';
  const mbps = bytesPerSec / 1048576;
  if (mbps >= 10) return `${mbps.toFixed(0)} MB/s`;
  if (mbps >= 1) return `${mbps.toFixed(1)} MB/s`;
  const kbps = bytesPerSec / 1024;
  return `${kbps.toFixed(0)} KB/s`;
}

function formatEta(seconds: number): string {
  if (seconds <= 0) return '—';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h ${remMins}m`;
}

function shouldShowLowSpeed(phase: DownloadPhase, speedBytesPerSec: number): boolean {
  if (phase !== 'downloading') return false;
  if (speedBytesPerSec === 0) return false;
  return speedBytesPerSec < 50000;
}

export default function ModelDownloadStatus({
  progress,
  errorI18nKey,
  isChecking,
  isDownloading,
  isVerifying,
  isPaused,
  isDone,
  isError,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onBack,
}: Props) {
  const { t } = useTranslation();
  const [slowWarningDismissed, setSlowWarningDismissed] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);

  const showSpinner = isChecking || isVerifying;
  const showProgress = isDownloading || isPaused;
  const showSlowWarning = !slowWarningDismissed && shouldShowLowSpeed(progress.phase, progress.speedBytesPerSec);

  if (isDone) {
    return (
      <View style={styles.container} accessibilityLabel={t('modelDownload.completed')}>
        <View style={styles.content}>
          <Text style={styles.checkmark}>{'\u2705'}</Text>
          <Text style={styles.title}>{t('modelDownload.completed')}</Text>
          <Pressable
            style={styles.retryBtn}
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <Text style={styles.retryBtnText}>{t('common.back')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} accessibilityLabel={t('modelDownload.title')}>
      <View style={styles.content}>
        {errorI18nKey && (
          <Text style={styles.errorText}>{t(errorI18nKey)}</Text>
        )}

        {showSpinner && (
          <View style={styles.spinnerWrap}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.phaseText}>
              {isChecking ? t('modelDownload.title') : t('modelDownload.verifying')}
            </Text>
          </View>
        )}

        {showProgress && (
          <>
            <Text style={styles.fileLabel}>{progress.currentFile}</Text>

            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, isPaused && styles.progressBarPaused, { width: `${Math.min(progress.percent, 100)}%` }]} />
            </View>

            <Text style={styles.percentText}>
              {t('modelDownload.progressPercent', { percent: progress.percent })}
            </Text>

            {!isPaused && (
              <View style={styles.statsRow}>
                <Text style={styles.statText}>{t('modelDownload.etaTime', { eta: formatEta(progress.remainingSec) })}</Text>
                <Text style={styles.statText}>{t('modelDownload.speed', { speed: formatSpeed(progress.speedBytesPerSec) })}</Text>
              </View>
            )}

            <View style={styles.filesProgress}>
              <Text style={styles.filesProgressText}>{formatBytes(progress.downloadedBytes)} / {formatBytes(progress.totalBytes)}</Text>
              <Text style={styles.filesProgressText}>{progress.currentFileIndex + 1} / {progress.totalFiles} {t('modelDownload.downloadingModel')}</Text>
            </View>

            {showSlowWarning && (
              <View style={styles.slowWarning}>
                <Text style={styles.slowWarningText}>{t('modelDownload.wifiRequired')}</Text>
                <Pressable onPress={() => setSlowWarningDismissed(true)} accessibilityRole="button">
                  <Text style={styles.slowDismiss}>{'\u2715'}</Text>
                </Pressable>
              </View>
            )}

            {isPaused ? (
              <View style={styles.actionRow}>
                <Pressable style={styles.primaryBtn} onPress={onResume} accessibilityRole="button" accessibilityLabel={t('modelDownload.resume')}>
                  <Text style={styles.primaryBtnText}>{t('modelDownload.resume')}</Text>
                </Pressable>
                <Pressable style={styles.secondaryBtn} onPress={onCancel} accessibilityRole="button" accessibilityLabel={t('modelDownload.cancel')}>
                  <Text style={styles.secondaryBtnText}>{t('modelDownload.cancel')}</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.actionRow}>
                <Pressable style={styles.secondaryBtn} onPress={onPause} accessibilityRole="button" accessibilityLabel={t('modelDownload.pause')}>
                  <Text style={styles.secondaryBtnText}>{t('modelDownload.pause')}</Text>
                </Pressable>
                <Pressable style={styles.textLink} onPress={onCancel} accessibilityRole="button" accessibilityLabel={t('modelDownload.cancel')}>
                  <Text style={styles.textLinkText}>{t('modelDownload.cancel')}</Text>
                </Pressable>
              </View>
            )}
          </>
        )}

        {isError && (
          <View style={styles.errorWrap}>
            <Text style={styles.errorTitle}>{t('modelDownload.errorTitle')}</Text>
            <Pressable style={styles.primaryBtn} onPress={onRetry} accessibilityRole="button" accessibilityLabel={t('modelDownload.retry')}>
              <Text style={styles.primaryBtnText}>{t('modelDownload.retry')}</Text>
            </Pressable>
            {onBack && (
              <Pressable style={styles.textLink} onPress={onBack} accessibilityRole="button">
                <Text style={styles.textLinkText}>{'\u2190'} {t('common.back')}</Text>
              </Pressable>
            )}
          </View>
        )}

        <Pressable style={styles.whyLink} onPress={() => setShowWhyModal(true)} accessibilityRole="button">
          <Text style={styles.whyLinkText}>{t('modelDownload.whyNeeded')}</Text>
        </Pressable>

        <Modal visible={showWhyModal} transparent animationType="fade" onRequestClose={() => setShowWhyModal(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setShowWhyModal(false)} accessibilityRole="button">
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('modelDownload.whyNeeded')}</Text>
              <Text style={styles.modalBody}>{t('modelDownload.privacyNote')}</Text>
              <Pressable style={styles.primaryBtn} onPress={() => setShowWhyModal(false)} accessibilityRole="button">
                <Text style={styles.primaryBtnText}>OK</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, alignItems: 'center', justifyContent: 'center' },
  spinnerWrap: { alignItems: 'center', marginBottom: 24 },
  phaseText: { marginTop: 16, fontSize: 17, color: '#4B5563', fontWeight: '500' },
  fileLabel: { fontSize: 17, fontWeight: '600', color: '#1A1A1A', marginBottom: 16, textAlign: 'center' },
  progressBarBg: { width: '100%', height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden', marginBottom: 12 },
  progressBarFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 6 },
  progressBarPaused: { backgroundColor: '#9CA3AF' },
  percentText: { fontSize: 36, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 12 },
  statText: { fontSize: 16, color: '#6B7280' },
  filesProgress: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  filesProgressText: { fontSize: 16, color: '#9CA3AF' },
  slowWarning: { backgroundColor: '#FFF7ED', borderRadius: 8, padding: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  slowWarningText: { fontSize: 16, color: '#C2410C', flex: 1 },
  slowDismiss: { fontSize: 16, color: '#C2410C', marginLeft: 8 },
  actionRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 24 },
  primaryBtn: { backgroundColor: '#2563EB', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, minWidth: 120, alignItems: 'center' },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
  secondaryBtn: { backgroundColor: '#F3F4F6', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, minWidth: 100, alignItems: 'center' },
  secondaryBtnText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  retryBtn: { backgroundColor: '#2563EB', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, marginTop: 24 },
  retryBtnText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
  textLink: { paddingVertical: 10, paddingHorizontal: 16 },
  textLinkText: { fontSize: 16, color: '#9CA3AF', fontWeight: '500', textDecorationLine: 'underline' },
  errorWrap: { alignItems: 'center', marginBottom: 24 },
  errorText: { fontSize: 16, color: '#DC2626', textAlign: 'center', marginBottom: 16 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 16 },
  checkmark: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  whyLink: { paddingVertical: 12, paddingHorizontal: 20 },
  whyLinkText: { fontSize: 16, color: '#2563EB', fontWeight: '500', textDecorationLine: 'underline' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, marginHorizontal: 32, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  modalBody: { fontSize: 16, lineHeight: 24, color: '#4B5563', textAlign: 'center', marginBottom: 24 },
});
