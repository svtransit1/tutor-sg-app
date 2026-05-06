import React, { useEffect, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import * as Network from 'expo-network';
import { useOnboarding } from '../OnboardingProvider';
import { useTranslation } from 'react-i18next';
import { useModelDownload } from '../../services/useModelDownload';
import {
  formatBytes,
  getNetworkDownloadPolicy,
  type NetworkType,
} from '../../services/modelDownload';
import type { DeviceTier } from '@tutor-sg/shared';

/** Kid-friendly colors */
const COLORS = {
  primary: '#4A90D9',
  primaryDark: '#3A7BC8',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  bg: '#FFFFFF',
  surface: '#F5F7FA',
  text: '#1A1A2E',
  textSecondary: '#666680',
  progressBg: '#E0E4EA',
  border: '#D0D5DD',
};

export function ModelDownloadScreen() {
  const { t } = useTranslation();
  const { goNext, state: onboardingState } = useOnboarding();
  const deviceTier = (onboardingState.deviceTier ?? 'mid') as DeviceTier;
  const [networkType, setNetworkType] = useState<NetworkType>('unknown');
  const [wifiOnly, setWifiOnly] = useState(true);

  const {
    progress,
    status,
    currentStatus,
    error,
    start,
    pause,
    resume,
    cancel,
    retry,
    isComplete,
    currentModelName,
  } = useModelDownload(deviceTier);

  const networkPolicy = useMemo(
    () => getNetworkDownloadPolicy({ networkType, wifiOnly }),
    [networkType, wifiOnly],
  );

  const refreshNetworkType = useCallback(async () => {
    try {
      const state = await Network.getNetworkStateAsync();
      const rawType = String(state.type ?? '').toLowerCase();
      if (!state.isConnected) {
        setNetworkType('none');
      } else if (rawType.includes('wifi')) {
        setNetworkType('wifi');
      } else if (rawType.includes('cellular')) {
        setNetworkType('cellular');
      } else {
        setNetworkType('unknown');
      }
    } catch {
      setNetworkType('unknown');
    }
  }, []);

  useEffect(() => {
    refreshNetworkType();
    const timer = setInterval(refreshNetworkType, 5000);
    return () => clearInterval(timer);
  }, [refreshNetworkType]);

  // Start download automatically when policy allows it.
  useEffect(() => {
    if (status === 'idle' && networkPolicy.canDownload) {
      start();
    }
  }, [networkPolicy.canDownload, status, start]);

  useEffect(() => {
    if (status === 'running' && !networkPolicy.canDownload) {
      pause();
    }
  }, [networkPolicy.canDownload, pause, status]);

  // Auto-advance when complete
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(goNext, 1200);
      return () => clearTimeout(timer);
    }
  }, [isComplete, goNext]);

  const handleCancel = useCallback(() => {
    cancel();
  }, [cancel]);

  const handleRetry = useCallback(() => {
    retry();
  }, [retry]);

  const handlePauseResume = useCallback(() => {
    if (status === 'running' && currentStatus === 'downloading') {
      pause();
    } else if (status === 'paused') {
      resume();
    }
  }, [status, currentStatus, pause, resume]);

  const handleWifiOnlyChange = useCallback((nextValue: boolean) => {
    if (!nextValue && networkPolicy.showCellularWarning) {
      Alert.alert(
        t('onboarding.modelDownload.cellularTitle', 'Use mobile data?'),
        t(
          'onboarding.modelDownload.cellularBody',
          'This download may use more than 1 GB. Continue only if your parent or guardian is okay with mobile data charges.',
        ),
        [
          {
            text: t('onboarding.modelDownload.keepWifiOnly', 'Keep Wi-Fi only'),
            style: 'cancel',
          },
          {
            text: t('onboarding.modelDownload.useMobileData', 'Use mobile data'),
            style: 'destructive',
            onPress: () => setWifiOnly(false),
          },
        ],
      );
      return;
    }

    setWifiOnly(nextValue);
  }, [networkPolicy.showCellularWarning, t]);

  const networkLabel = useMemo(() => {
    switch (networkPolicy.status) {
      case 'wifi':
        return t('onboarding.modelDownload.networkWifi', 'Wi-Fi');
      case 'cellular-blocked':
        return t('onboarding.modelDownload.networkCellularBlocked', 'Mobile data blocked');
      case 'cellular-allowed':
        return t('onboarding.modelDownload.networkCellularAllowed', 'Mobile data');
      case 'offline':
        return t('onboarding.modelDownload.networkOffline', 'Offline');
      default:
        return t('onboarding.modelDownload.networkUnknown', 'Network unknown');
    }
  }, [networkPolicy.status, t]);

  const etaLabel = progress.etaMinutes === null
    ? t('onboarding.modelDownload.etaCalculating', 'Calculating time remaining...')
    : t('onboarding.modelDownload.eta', {
        count: progress.etaMinutes,
        defaultValue: 'About {{count}} minutes on Wi-Fi',
      });

  // ── Determine the main action button ────────────────────────────

  const renderActionButton = () => {
    if (status === 'completed' || isComplete) return null;

    if (status === 'error') {
      return (
        <TouchableOpacity
          style={[styles.actionBtn, styles.retryBtn]}
          onPress={handleRetry}
          accessibilityLabel={t('onboarding.modelDownload.retry', 'Retry')}
          accessibilityRole="button"
        >
          <Text style={styles.actionBtnText}>
            {t('onboarding.modelDownload.retry', 'Retry')}
          </Text>
        </TouchableOpacity>
      );
    }

    if (status === 'cancelled') {
      return (
        <TouchableOpacity
          style={[styles.actionBtn, styles.retryBtn]}
          onPress={handleRetry}
          accessibilityLabel={t('onboarding.modelDownload.retry', 'Retry')}
          accessibilityRole="button"
        >
          <Text style={styles.actionBtnText}>
            {t('onboarding.modelDownload.resume', 'Resume')}
          </Text>
        </TouchableOpacity>
      );
    }

    if (status === 'running' && currentStatus === 'downloading') {
      return (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.pauseBtn]}
            onPress={handlePauseResume}
            accessibilityLabel={t('onboarding.modelDownload.pause', 'Pause')}
            accessibilityRole="button"
          >
            <Text style={styles.actionBtnText}>
              {t('onboarding.modelDownload.pause', 'Pause')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.cancelBtn]}
            onPress={handleCancel}
            accessibilityLabel={t('onboarding.modelDownload.cancel', 'Cancel')}
            accessibilityRole="button"
          >
            <Text style={styles.cancelBtnText}>
              {t('onboarding.modelDownload.cancel', 'Cancel')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (status === 'paused') {
      return (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.resumeBtn]}
            onPress={handlePauseResume}
            accessibilityLabel={t('onboarding.modelDownload.resume', 'Resume')}
            accessibilityRole="button"
          >
            <Text style={styles.actionBtnText}>
              {t('onboarding.modelDownload.resume', 'Resume')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.cancelBtn]}
            onPress={handleCancel}
            accessibilityLabel={t('onboarding.modelDownload.cancel', 'Cancel')}
            accessibilityRole="button"
          >
            <Text style={styles.cancelBtnText}>
              {t('onboarding.modelDownload.cancel', 'Cancel')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  // ── Render the status message ───────────────────────────────────

  const renderStatusMessage = () => {
    switch (status) {
      case 'idle':
        return (
          <>
            <Text style={styles.statusText}>
              {t('onboarding.modelDownload.preparing', 'Preparing download...')}
            </Text>
            {!networkPolicy.canDownload ? (
              <Text style={styles.hintText}>
                {t('onboarding.modelDownload.waitingWifi', 'Waiting for Wi-Fi to continue download.')}
              </Text>
            ) : null}
          </>
        );

      case 'running':
        if (currentStatus === 'verifying') {
          return (
            <Text style={styles.statusText}>
              {t('onboarding.modelDownload.verifying', 'Verifying download...')}
            </Text>
          );
        }
        if (currentStatus === 'downloading') {
          return (
            <>
              <Text style={styles.statusText}>
                {currentModelName
                  ? t('onboarding.modelDownload.downloadingFile', {
                      fileName: currentModelName,
                      defaultValue: `Downloading ${currentModelName}...`,
                    })
                  : t('onboarding.modelDownload.downloading', 'Downloading AI model...')}
              </Text>
              <Text style={styles.bytesText}>
                {formatBytes(progress.overallBytes.downloaded)} /{' '}
                {formatBytes(progress.overallBytes.total)}
              </Text>
              <Text style={styles.etaText}>{etaLabel}</Text>
            </>
          );
        }
        return null;

      case 'paused':
        return (
          <>
            <Text style={styles.statusText}>
              {t('onboarding.modelDownload.paused', 'Download paused')}
            </Text>
            <Text style={styles.hintText}>
              {networkPolicy.canDownload
                ? t(
                    'onboarding.modelDownload.pausedHint',
                    'Connect to Wi-Fi to continue. Downloads resume automatically.',
                  )
                : t('onboarding.modelDownload.waitingWifi', 'Waiting for Wi-Fi to continue download.')}
            </Text>
          </>
        );

      case 'completed':
        return (
          <>
            <Text style={[styles.statusText, styles.successText]}>
              {t('onboarding.modelDownload.ready', 'Ready!')}
            </Text>
            <Text style={styles.hintText}>
              {t(
                'onboarding.modelDownload.readyHint',
                'Your AI tutor is ready. Tap to start!',
              )}
            </Text>
          </>
        );

      case 'error':
        return (
          <>
            <Text style={[styles.statusText, styles.errorText]}>
              {t('onboarding.modelDownload.error', 'Download failed')}
            </Text>
            {error ? (
              <Text style={styles.errorDetail} numberOfLines={3}>
                {error}
              </Text>
            ) : null}
            <Text style={styles.hintText}>
              {t(
                'onboarding.modelDownload.errorHint',
                'Please check your internet connection and try again.',
              )}
            </Text>
          </>
        );

      case 'cancelled':
        return (
          <>
            <Text style={styles.statusText}>
              {t('onboarding.modelDownload.cancelled', 'Download cancelled')}
            </Text>
            <Text style={styles.hintText}>
              {t(
                'onboarding.modelDownload.cancelledHint',
                'You can resume the download when you are ready.',
              )}
            </Text>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Icon / Spinner area */}
      <View style={styles.iconArea}>
        {status === 'running' && (currentStatus === 'downloading' || currentStatus === 'verifying') ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : status === 'completed' ? (
          <Text style={styles.checkmark}>✅</Text>
        ) : status === 'error' ? (
          <Text style={styles.errorIcon}>⚠️</Text>
        ) : status === 'paused' ? (
          <Text style={styles.pauseIcon}>⏸️</Text>
        ) : (
          <ActivityIndicator size="large" color={COLORS.primary} />
        )}
      </View>

      {/* Title & status */}
      <Text style={styles.title}>
        {status === 'completed'
          ? t('onboarding.modelDownload.readyTitle', 'All set!')
          : t('onboarding.modelDownload.title', 'Setting up your tutor...')}
      </Text>

      <Text style={styles.subtitle}>
        {t(
          'onboarding.modelDownload.subtitle',
          'Downloading the AI model so your tutor works offline.',
        )}
      </Text>

      {/* Progress bar */}
      {status !== 'completed' && (
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.round(progress.overallProgress * 100)}%`,
                  backgroundColor:
                    status === 'error' ? COLORS.error : COLORS.primary,
                },
              ]}
            />
          </View>
          <Text style={styles.progressPercent}>
            {Math.round(progress.overallProgress * 100)}%
          </Text>
        </View>
      )}

      {/* Status message */}
      <View style={styles.statusArea}>{renderStatusMessage()}</View>

      <View style={styles.networkPanel}>
        <Text style={styles.networkLabel}>
          {t('onboarding.modelDownload.networkType', 'Network')}: {networkLabel}
        </Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>
            {t('onboarding.modelDownload.wifiOnly', 'Wi-Fi only')}
          </Text>
          <Switch
            value={wifiOnly}
            onValueChange={handleWifiOnlyChange}
            accessibilityLabel={t('onboarding.modelDownload.wifiOnly', 'Wi-Fi only')}
          />
        </View>
        {networkPolicy.showCellularWarning ? (
          <Text style={styles.warningText}>
            {wifiOnly
              ? t(
                  'onboarding.modelDownload.cellularBlocked',
                  'Mobile data is available, but downloads wait for Wi-Fi by default.',
                )
              : t(
                  'onboarding.modelDownload.cellularAllowed',
                  'Mobile data is on for this download.',
                )}
          </Text>
        ) : null}
      </View>

      {/* Action buttons */}
      <View style={styles.actionArea}>{renderActionButton()}</View>

      {/* Note about offline */}
      {status === 'running' && (
        <Text style={styles.footnote}>
          {t(
            'onboarding.modelDownload.footnote',
            'Models are downloaded once and work fully offline.',
          )}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  iconArea: {
    marginBottom: 16,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: { fontSize: 48 },
  errorIcon: { fontSize: 48 },
  pauseIcon: { fontSize: 48 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: COLORS.progressBg,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressPercent: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  statusArea: {
    marginBottom: 24,
    alignItems: 'center',
    minHeight: 60,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  bytesText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  etaText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  hintText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },
  successText: {
    color: COLORS.success,
  },
  errorText: {
    color: COLORS.error,
  },
  errorDetail: {
    fontSize: 12,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },
  actionArea: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  networkPanel: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  networkLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  switchRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  warningText: {
    fontSize: 13,
    color: COLORS.warning,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pauseBtn: {
    backgroundColor: COLORS.warning,
  },
  resumeBtn: {
    backgroundColor: COLORS.primary,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  footnote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 16,
  },
});
