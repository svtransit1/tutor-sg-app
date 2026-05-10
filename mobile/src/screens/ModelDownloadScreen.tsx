import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import NetInfo from '@react-native-community/netinfo';

import { detectDeviceTier, modelEntriesToTasks } from '../services/device-tier';
import type { DeviceTier } from '../services/device-tier';
import { useModelDownload } from '../hooks/useModelDownload';
import ModelDownloadStatus from '../components/ModelDownloadStatus';
import { createRealDownloadEnv } from '../services/download-fs';
import {
  loadDownloadState,
  saveDownloadState,
  clearDownloadState,
} from '../services/download-persistence';
import type { DownloadTask } from '../models/model-download';

interface Props {
  onComplete: () => void;
  onBack?: () => void;
}

type ScreenPhase =
  | 'detecting'
  | 'restoring'
  | 'ready'
  | 'cellular-warning'
  | 'downloading'
  | 'paused'
  | 'completed'
  | 'error';

async function checkForSavedDownload(): Promise<{
  tasks: DownloadTask[];
  completedFileNames: string[];
} | null> {
  const saved = await loadDownloadState();
  if (!saved || saved.tasks.length === 0) return null;
  if (saved.completedFileNames.length >= saved.tasks.length) {
    await clearDownloadState();
    return null;
  }
  return {
    tasks: saved.tasks,
    completedFileNames: saved.completedFileNames,
  };
}

export default function ModelDownloadScreen({ onComplete, onBack }: Props) {
  const { t } = useTranslation();
  const [screenPhase, setScreenPhase] = useState<ScreenPhase>('detecting');
  const [tier, setTier] = useState<DeviceTier>('mid');
  const [downloadSize, setDownloadSize] = useState('');
  const [modelNames, setModelNames] = useState('');
  const [isCellularWarning, setIsCellularWarning] = useState(false);

  const handlePersist = useCallback(
    (tasks: DownloadTask[], completedFileNames: string[], downloadedBytes: number) => {
      saveDownloadState(tasks, completedFileNames, downloadedBytes).catch(
        () => {},
      );
    },
    [],
  );

  const download = useModelDownload({
    fs: createRealDownloadEnv().fs,
    crypto: createRealDownloadEnv().crypto,
    fetch: createRealDownloadEnv().fetch,
    onPersist: handlePersist,
  });

  const startFromTierDetection = useCallback(() => {
    const detection = detectDeviceTier();
    const destDir = createRealDownloadEnv().fs.getDocumentDirectory();
    const tasks = modelEntriesToTasks(detection.models, `${destDir}/models`);
    download.start(tasks);
  }, [download]);

  const resumeSavedDownload = useCallback(
    (savedTasks: DownloadTask[]) => {
      download.start(savedTasks);
    },
    [download],
  );

  useEffect(() => {
    if (download.isDone) {
      setScreenPhase('completed');
      clearDownloadState().catch(() => {});
      const timer = setTimeout(() => onComplete(), 800);
      return () => clearTimeout(timer);
    }
    if (download.isError) {
      setScreenPhase('error');
    }
    if (download.isDownloading) {
      setScreenPhase('downloading');
    }
    if (download.isPaused) {
      setScreenPhase('paused');
    }
  }, [
    download.isDone,
    download.isError,
    download.isDownloading,
    download.isPaused,
    onComplete,
  ]);

  useEffect(() => {
    const init = async () => {
      const saved = await checkForSavedDownload();
      if (saved) {
        setScreenPhase('restoring');
        resumeSavedDownload(saved.tasks);
        return;
      }

      const detection = detectDeviceTier();
      setTier(detection.tier);
      setDownloadSize(detection.downloadSizeLabel);
      setModelNames(detection.modelNamesLabel);

      if (detection.tier === 'unsupported') {
        setScreenPhase('error');
        return;
      }

      const netState = await NetInfo.fetch();
      const isCellular =
        netState.isConnected === true && netState.type === 'cellular';
      setIsCellularWarning(isCellular);
      setScreenPhase(isCellular ? 'cellular-warning' : 'ready');
    };

    init();
  }, [resumeSavedDownload]);

  const handleStartDownload = useCallback(() => {
    startFromTierDetection();
  }, [startFromTierDetection]);

  const tierLabel =
    tier === 'high'
      ? t('deviceTierResult.highPerformance')
      : t('deviceTierResult.standard');
  const tierDescription =
    tier === 'high'
      ? t('deviceTierResult.highDescription')
      : t('deviceTierResult.standardDescription');

  if (screenPhase === 'detecting' || screenPhase === 'restoring') {
    const msg =
      screenPhase === 'restoring'
        ? t('modelDownload.resumingSaved')
        : t('deviceTierResult.loading');
    return (
      <View style={styles.container} accessibilityLabel={t('modelDownload.title')}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.title}>{msg}</Text>
        </View>
      </View>
    );
  }

  if (screenPhase === 'downloading' || screenPhase === 'paused') {
    return (
      <ModelDownloadStatus
        progress={download.progress}
        error={download.error}
        errorI18nKey={download.errorI18nKey}
        isIdle={false}
        isChecking={false}
        isDownloading={download.isDownloading}
        isVerifying={download.isVerifying}
        isPaused={download.isPaused}
        isDone={false}
        isError={false}
        onStart={handleStartDownload}
        onPause={download.pause}
        onResume={download.resume}
        onCancel={() => {
          download.cancel();
          clearDownloadState().catch(() => {});
          onComplete();
        }}
        onRetry={download.retry}
      />
    );
  }

  if (screenPhase === 'error' && download.isError) {
    return (
      <ModelDownloadStatus
        progress={download.progress}
        error={download.error}
        errorI18nKey={download.errorI18nKey}
        isIdle={false}
        isChecking={false}
        isDownloading={false}
        isVerifying={false}
        isPaused={false}
        isDone={false}
        isError={true}
        onStart={handleStartDownload}
        onPause={download.pause}
        onResume={download.resume}
        onCancel={() => {
          download.cancel();
          clearDownloadState().catch(() => {});
          onComplete();
        }}
        onRetry={download.retry}
        onBack={onBack}
      />
    );
  }

  if (screenPhase === 'completed') {
    return (
      <ModelDownloadStatus
        progress={download.progress}
        error={null}
        errorI18nKey={null}
        isIdle={false}
        isChecking={false}
        isDownloading={false}
        isVerifying={false}
        isPaused={false}
        isDone={true}
        isError={false}
        onStart={handleStartDownload}
        onPause={download.pause}
        onResume={download.resume}
        onCancel={() => {
          download.cancel();
          clearDownloadState().catch(() => {});
          onComplete();
        }}
        onRetry={download.retry}
      />
    );
  }

  return (
    <View style={styles.container} accessibilityLabel={t('deviceTierResult.title')}>
      <View style={styles.content}>
        <View style={styles.mascotWrap}>
          <Text style={styles.mascot}>{'\uD83D\uDCDA'}</Text>
        </View>
        <Text style={styles.title}>{t('deviceTierResult.title')}</Text>
        <View style={styles.tierBadge}>
          <Text style={styles.tierBadgeText}>{tierLabel}</Text>
        </View>
        <Text style={styles.description}>{tierDescription}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            {t('deviceTierResult.downloadSize', { size: downloadSize })}
          </Text>
          <Text style={styles.infoLabel}>
            {t('deviceTierResult.modelNames', { models: modelNames })}
          </Text>
        </View>
        <Text style={styles.consent}>{t('deviceTierResult.consentText')}</Text>

        {isCellularWarning && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              {t('deviceTierResult.cellularWarning', { size: downloadSize })}
            </Text>
            <View style={styles.warningButtons}>
              <Pressable
                style={styles.secondaryBtn}
                onPress={() => setIsCellularWarning(false)}
                accessibilityRole="button"
              >
                <Text style={styles.secondaryBtnText}>
                  {t('deviceTierResult.cellularCancel')}
                </Text>
              </Pressable>
              <Pressable
                style={styles.primaryBtn}
                onPress={handleStartDownload}
                accessibilityRole="button"
              >
                <Text style={styles.primaryBtnText}>
                  {t('deviceTierResult.cellularProceed')}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {!isCellularWarning && (
          <Pressable
            style={styles.primaryBtn}
            onPress={handleStartDownload}
            accessibilityRole="button"
            accessibilityLabel={t('deviceTierResult.downloadNow')}
          >
            <Text style={styles.primaryBtnText}>{t('deviceTierResult.downloadNow')}</Text>
          </Pressable>
        )}

        <Pressable
          style={styles.textLink}
          onPress={() => onComplete()}
          accessibilityRole="button"
        >
          <Text style={styles.textLinkText}>{t('deviceTierResult.downloadLater')}</Text>
        </Pressable>

        {onBack && (
          <Pressable style={styles.textLink} onPress={onBack} accessibilityRole="button">
            <Text style={styles.textLinkText}>{'\u2190'} {t('common.back')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, alignItems: 'center', justifyContent: 'center' },
  mascotWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0F4FF', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  mascot: { fontSize: 48 },
  title: { fontSize: 26, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginBottom: 12 },
  description: { fontSize: 16, lineHeight: 24, color: '#6B7280', textAlign: 'center', marginBottom: 24, paddingHorizontal: 8 },
  tierBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
  tierBadgeText: { fontSize: 16, fontWeight: '600', color: '#2563EB' },
  infoRow: { width: '100%', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 16, gap: 8 },
  infoLabel: { fontSize: 16, color: '#4B5563', textAlign: 'center' },
  consent: { fontSize: 16, color: '#9CA3AF', textAlign: 'center', marginBottom: 24, paddingHorizontal: 16 },
  warningBox: { backgroundColor: '#FFF7ED', borderRadius: 12, padding: 16, marginBottom: 16, width: '100%' },
  warningText: { fontSize: 16, color: '#C2410C', textAlign: 'center', marginBottom: 12 },
  warningButtons: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  primaryBtn: { backgroundColor: '#2563EB', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, marginBottom: 12, minWidth: 200, alignItems: 'center' },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
  secondaryBtn: { backgroundColor: '#F3F4F6', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginBottom: 12 },
  secondaryBtnText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  textLink: { paddingVertical: 10, paddingHorizontal: 20 },
  textLinkText: { fontSize: 16, color: '#9CA3AF', fontWeight: '500', textDecorationLine: 'underline' },
});
