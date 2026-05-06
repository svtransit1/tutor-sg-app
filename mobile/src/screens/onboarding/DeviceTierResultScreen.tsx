/**
 * DeviceTierResultScreen — Onboarding step 3/7.
 *
 * After language selection and device-tier sniffing, this screen shows
 * the detected tier and asks for consent to download the AI models.
 *
 * Per AC:
 * - Shows "High Performance" (E4B) or "Standard" (E2B) with explanation
 * - Shows estimated download size
 * - "Download now" primary + "Download later (Wi-Fi only)" secondary
 * - Cellular data warning if on cellular
 * - Consent: "Models run entirely on this device. Nothing leaves your phone."
 * - Transitions to ModelDownloadScreen on proceed
 * - Bilingual EN + zh-Hans
 * - Accessibility: labels, min 16pt text
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  type TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import NetInfo from '@react-native-community/netinfo';
import { useDeviceTier } from '../../hooks/useDeviceTier';
import type { DeviceTier, NativeDeviceInfo } from '@tutor-sg/device-tier';

// ── Types ──────────────────────────────────────────────────────────

interface DeviceTierResultScreenProps {
  /** Called when user chooses to download now */
  onDownloadNow?: () => void;
  /** Called when user chooses to download later */
  onDownloadLater?: () => void;
  /** Optional injectable detection function (for testing) */
  detectTierFn?: () => NativeDeviceInfo;
}

type ScreenPhase = 'detecting' | 'result' | 'cellular_confirm';

// ── Component ──────────────────────────────────────────────────────

export default function DeviceTierResultScreen({
  onDownloadNow,
  onDownloadLater,
  detectTierFn,
}: DeviceTierResultScreenProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'zh-Hans' ? 'zh-Hans' : 'en';

  const { loading, error, belowFloor, tier, displayInfo } = useDeviceTier(locale, detectTierFn);

  const [phase, setPhase] = useState<ScreenPhase>('detecting');
  const [isCellular, setIsCellular] = useState(false);
  const [cellularModalVisible, setCellularModalVisible] = useState(false);

  // Check cellular connection once detection is done
  useEffect(() => {
    if (!loading && tier && tier !== 'low') {
      const unsubscribe = NetInfo.addEventListener((netState) => {
        const cellular = netState.type === 'cellular' && netState.isConnected === true;
        setIsCellular(cellular);
      });
      // One initial check
      NetInfo.fetch().then((netState) => {
        setIsCellular(netState.type === 'cellular' && netState.isConnected === true);
      });
      return () => unsubscribe();
    }
  }, [loading, tier]);

  // Update phase when detection completes
  useEffect(() => {
    if (!loading && tier && tier !== 'low') {
      setPhase('result');
    }
  }, [loading, tier]);

  // ── Handlers ─────────────────────────────────────────────────

  const handleDownloadNow = useCallback(() => {
    if (isCellular) {
      setCellularModalVisible(true);
    } else {
      onDownloadNow?.();
    }
  }, [isCellular, onDownloadNow]);

  const handleCellularProceed = useCallback(() => {
    setCellularModalVisible(false);
    onDownloadNow?.();
  }, [onDownloadNow]);

  const handleCellularCancel = useCallback(() => {
    setCellularModalVisible(false);
  }, []);

  // ── Detecting phase ──────────────────────────────────────────

  if (phase === 'detecting') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color="#4A90D9" />
          <Text style={styles.loadingText} accessibilityRole="text">
            {t('deviceTierResult.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error state ──────────────────────────────────────────────

  if (error || belowFloor || !displayInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContent}>
          <Text style={styles.iconText}>⚠️</Text>
          <Text style={styles.title}>
            {belowFloor ? t('onboarding.welcome.title') : t('deviceTierResult.error')}
          </Text>
          <Text style={styles.description}>
            {belowFloor
              ? 'Your device is too old to run the AI tutor. Please upgrade to a newer device with at least 3 GB RAM.'
              : t('deviceTierResult.error')}
          </Text>
          {!belowFloor && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setPhase('detecting')}
              accessibilityRole="button"
              accessibilityLabel={t('deviceTierResult.loading')}
            >
              <Text style={styles.primaryButtonText}>{t('deviceTierResult.loading')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ── Result phase ─────────────────────────────────────────────

  const isHighTier = tier === 'high';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>{isHighTier ? '🚀' : '📱'}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title} accessibilityRole="header">
            {t('deviceTierResult.title')}
          </Text>

          {/* Tier label + indicator */}
          <View style={styles.tierBadge}>
            <View
              style={[styles.tierDot, isHighTier ? styles.tierDotHigh : styles.tierDotStandard]}
            />
            <Text style={styles.tierLabel}>
              {t(isHighTier ? 'deviceTierResult.highPerformance' : 'deviceTierResult.standard')}
            </Text>
          </View>

          {/* Tier description */}
          <Text style={styles.description}>
            {t(
              isHighTier
                ? 'deviceTierResult.highDescription'
                : 'deviceTierResult.standardDescription',
            )}
          </Text>

          {/* Download info card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {t('deviceTierResult.downloadSize', {
                  size: displayInfo.downloadSize,
                })}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {t('deviceTierResult.modelNames', {
                  models: displayInfo.modelNames,
                })}
              </Text>
            </View>
          </View>

          {/* Consent text */}
          <View style={styles.consentContainer}>
            <Text style={styles.consentIcon}>🔒</Text>
            <Text style={styles.consentText}>{t('deviceTierResult.consentText')}</Text>
          </View>

          {/* Buttons */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleDownloadNow}
            accessibilityRole="button"
            accessibilityLabel={t('deviceTierResult.downloadNow')}
          >
            <Text style={styles.primaryButtonText}>{t('deviceTierResult.downloadNow')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onDownloadLater}
            accessibilityRole="button"
            accessibilityLabel={t('deviceTierResult.downloadLater')}
          >
            <Text style={styles.secondaryButtonText}>{t('deviceTierResult.downloadLater')}</Text>
          </TouchableOpacity>

          {/* Cellular warning */}
          {isCellular && (
            <View style={styles.cellularBanner}>
              <Text style={styles.cellularBannerText}>
                {t('deviceTierResult.cellularWarning', {
                  size: displayInfo.downloadSize,
                })}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Cellular confirmation modal ───────────────────────────── */}
      <Modal
        visible={cellularModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCellularCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalIcon}>📶</Text>
            <Text style={styles.modalTitle}>
              {t('deviceTierResult.cellularWarning', {
                size: displayInfo.downloadSize,
              })}
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleCellularProceed}
              accessibilityRole="button"
              accessibilityLabel={t('deviceTierResult.cellularProceed')}
            >
              <Text style={styles.primaryButtonText}>{t('deviceTierResult.cellularProceed')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleCellularCancel}
              accessibilityRole="button"
              accessibilityLabel={t('deviceTierResult.cellularCancel')}
            >
              <Text style={styles.secondaryButtonText}>{t('deviceTierResult.cellularCancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
  } as TextStyle,
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 16,
    gap: 8,
  },
  tierDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tierDotHigh: {
    backgroundColor: '#22C55E',
  },
  tierDotStandard: {
    backgroundColor: '#F59E0B',
  },
  tierLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
  } as TextStyle,
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  } as TextStyle,
  infoCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    gap: 10,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  } as TextStyle,
  consentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 16,
    gap: 12,
    marginBottom: 28,
    width: '100%',
  },
  consentIcon: {
    fontSize: 20,
  },
  consentText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#166534',
    fontWeight: '500',
  } as TextStyle,
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  } as TextStyle,
  secondaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '500',
  } as TextStyle,
  loadingText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  } as TextStyle,
  cellularBanner: {
    width: '100%',
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 12,
  },
  cellularBannerText: {
    fontSize: 14,
    color: '#9A3412',
    textAlign: 'center',
    lineHeight: 20,
  } as TextStyle,
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  modalIcon: {
    fontSize: 40,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  } as TextStyle,
});
