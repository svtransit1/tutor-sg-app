/**
 * DeviceTierScreen — Onboarding step 3/7.
 *
 * Per ADD §3.3-3.4 and FIX-B2 spec:
 * - Detects device tier (RAM + chipset + NPU sniff)
 * - Shows tier info (high/standard badge + description)
 * - Shows model info (which models, download sizes)
 * - Shows download CTAs with cellular data warning
 * - Below-floor devices get a polite "too old" modal
 *
 * Bilingual: all UI strings via i18n (en + zh-Hans).
 * Kid-safe: no analytics, no data-leaving-device paths.
 * Accessibility: VoiceOver/TalkBack labels on all interactable elements.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  AccessibilityInfo,
  type TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { BelowFloorModal } from '@tutor-sg/device-tier';
import { assignTier, MODEL_MAP } from '@tutor-sg/device-tier';
import type { DeviceTier, DeviceCapabilities } from '@tutor-sg/device-tier';
import OnboardingProgressIndicator from '../../components/OnboardingProgressIndicator';

// ── Types ──────────────────────────────────────────────────────────

type ScreenState =
  | { kind: 'checking' }
  | { kind: 'error'; message: string }
  | { kind: 'belowFloor' }
  | { kind: 'ready'; tier: DeviceTier; capabilities: DeviceCapabilities }
  | { kind: 'cellularWarning'; tier: DeviceTier; capabilities: DeviceCapabilities };

interface DeviceTierScreenProps {
  /** Called when the user proceeds past this screen (after download or skip). */
  onComplete?: () => void;
}

// ── Tier metadata for display ──────────────────────────────────────

interface TierDisplayInfo {
  labelKey: string;
  descriptionKey: string;
  downloadSize: string;
}

const TIER_DISPLAY: Record<DeviceTier, TierDisplayInfo> = {
  high: {
    labelKey: 'deviceTierResult.highPerformance',
    descriptionKey: 'deviceTierResult.highDescription',
    downloadSize: '~4.5 GB',
  },
  mid: {
    labelKey: 'deviceTierResult.standard',
    descriptionKey: 'deviceTierResult.standardDescription',
    downloadSize: '~1.7 GB',
  },
  low: {
    labelKey: 'deviceTierResult.standard',
    descriptionKey: 'deviceTierResult.standardDescription',
    downloadSize: '~1.7 GB',
  },
};

// ── Device detection ───────────────────────────────────────────────

/**
 * Sniffs device hardware info.
 *
 * Returns a Promise so the screen can show a loading state.
 * In production, this would call NativeModules to get RAM/chipset/NPU.
 * For now, returns a best-effort snapshot using Platform + defaults.
 *
 * TODO(Wolf): Wire up actual NativeDeviceInfo module when available.
 *   Until then, the tier detection is visual-only and defaults to 'mid'.
 */
async function detectDeviceInfo(): Promise<{
  totalRAM: number;
  chipset: string;
  npuAvailable: boolean;
}> {
  // Simulate detection delay for UX
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const isSimulator = Platform.OS === 'ios' || Platform.OS === 'android';

  return {
    totalRAM: isSimulator ? 8 : 4,
    chipset: isSimulator ? 'A17' : 'SDM778G',
    npuAvailable: isSimulator,
  };
}

// ── Component ──────────────────────────────────────────────────────

export default function DeviceTierScreen({ onComplete }: DeviceTierScreenProps) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const networkStatus = useNetworkStatus();
  const isMounted = useRef(true);

  const [screenState, setScreenState] = useState<ScreenState>({ kind: 'checking' });

  // ── Detect device on mount ───────────────────────────────────

  const runDetection = useCallback(async () => {
    setScreenState({ kind: 'checking' });

    try {
      const info = await detectDeviceInfo();
      if (!isMounted.current) return;

      const { tier, belowFloor } = assignTier(info);

      if (belowFloor) {
        setScreenState({ kind: 'belowFloor' });
        return;
      }

      const capabilities: DeviceCapabilities = {
        tier,
        ramGB: info.totalRAM,
        chipset: info.chipset,
        npuAvailable: info.npuAvailable,
        belowFloor: false,
      };

      setScreenState({ kind: 'ready', tier, capabilities });

      // Announce tier result for screen readers
      const labelKey = TIER_DISPLAY[tier].labelKey;
      try {
        AccessibilityInfo.announceForAccessibility(
          `${t('deviceTierResult.title')} ${t(labelKey)}`,
        );
      } catch {
        // Graceful degradation in test env
      }
    } catch (err) {
      if (!isMounted.current) return;
      setScreenState({
        kind: 'error',
        message: err instanceof Error ? err.message : t('deviceTierResult.error'),
      });
    }
  }, [t]);

  useEffect(() => {
    runDetection();
    return () => {
      isMounted.current = false;
    };
  }, [runDetection]);

  // ── Download action ──────────────────────────────────────────

  const handleDownloadNow = useCallback(() => {
    if (screenState.kind !== 'ready') return;

    // Check if on cellular data
    if (networkStatus.type === 'cellular') {
      setScreenState({
        kind: 'cellularWarning',
        tier: screenState.tier,
        capabilities: screenState.capabilities,
      });
      return;
    }

    // On Wi-Fi or unknown — proceed with download
    // TODO(Wolf): Wire up ModelDownloadService to start actual download.
    // For now, just proceed to next onboarding step.
    onComplete?.();
  }, [screenState, networkStatus.type, onComplete]);

  const handleDownloadLater = useCallback(() => {
    // Skip download, proceed to next step
    onComplete?.();
  }, [onComplete]);

  const handleRetry = useCallback(() => {
    runDetection();
  }, [runDetection]);

  // ── Cellular warning actions ─────────────────────────────────

  const handleCellularProceed = useCallback(() => {
    // User chose to download over cellular
    // TODO(Wolf): Wire up ModelDownloadService
    onComplete?.();
  }, [onComplete]);

  const handleCellularCancel = useCallback(() => {
    if (screenState.kind === 'cellularWarning') {
      setScreenState({ kind: 'ready', tier: screenState.tier, capabilities: screenState.capabilities });
    }
  }, [screenState]);

  // ── Build model names string ─────────────────────────────────

  function getModelNames(tier: DeviceTier): string {
    const models = MODEL_MAP[tier];
    if (!models || models.llm === 'none') return '';
    return `${models.llm} + ${models.mt}`;
  }

  function getDownloadSize(tier: DeviceTier): string {
    return TIER_DISPLAY[tier]?.downloadSize ?? '';
  }

  // ── Render helpers ───────────────────────────────────────────

  function renderTierBadge(tier: DeviceTier) {
    const info = TIER_DISPLAY[tier];
    if (!info) return null;

    const isHigh = tier === 'high';
    return (
      <View
        style={[
          styles.tierBadge,
          isHigh ? styles.tierBadgeHigh : styles.tierBadgeStandard,
        ]}
        accessibilityRole="text"
        accessibilityLabel={`${t('deviceTierResult.tierLabel')}: ${t(info.labelKey)}`}
      >
        <Text
          style={[
            styles.tierBadgeIcon,
            isHigh ? styles.tierBadgeIconHigh : styles.tierBadgeIconStandard,
          ]}
        >
          {isHigh ? '⚡' : '🔄'}
        </Text>
        <View style={styles.tierBadgeTextContainer}>
          <Text
            style={[
              styles.tierBadgeLabel,
              isHigh ? styles.tierBadgeLabelHigh : styles.tierBadgeLabelStandard,
            ]}
          >
            {t(info.labelKey)}
          </Text>
          <Text
            style={[
              styles.tierBadgeDescription,
              isHigh ? styles.tierBadgeDescriptionHigh : styles.tierBadgeDescriptionStandard,
            ]}
          >
            {t(info.descriptionKey)}
          </Text>
        </View>
      </View>
    );
  }

  function renderModelInfoCard(tier: DeviceTier) {
    const modelNames = getModelNames(tier);
    const downloadSize = getDownloadSize(tier);

    return (
      <View style={styles.modelInfoCard} accessibilityRole="summary">
        {/* Model names */}
        <View style={styles.modelInfoRow}>
          <Text style={styles.modelInfoIcon}>🧠</Text>
          <View style={styles.modelInfoTextContainer}>
            <Text style={styles.modelInfoLabel}>
              {t('deviceTierResult.modelNames', { models: modelNames })}
            </Text>
          </View>
        </View>

        {/* Download size */}
        <View style={styles.modelInfoRow}>
          <Text style={styles.modelInfoIcon}>📦</Text>
          <View style={styles.modelInfoTextContainer}>
            <Text style={styles.modelInfoLabel}>
              {t('deviceTierResult.downloadSize', { size: downloadSize })}
            </Text>
          </View>
        </View>

        {/* Privacy consent */}
        <View style={[styles.modelInfoRow, styles.modelInfoRowLast]}>
          <Text style={styles.modelInfoIcon}>🔒</Text>
          <View style={styles.modelInfoTextContainer}>
            <Text style={styles.modelInfoConsent}>
              {t('deviceTierResult.consentText')}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  function renderLoadingState() {
    return (
      <View style={styles.stateContainer}>
        <View style={styles.loadingSpinner} accessibilityRole="progressbar">
          <Text style={styles.spinnerText}>⟳</Text>
        </View>
        <Text style={styles.loadingTitle}>{t('deviceTierResult.loading')}</Text>
        <Text style={styles.loadingSubtitle}>
          {t('onboarding.progress.step', { current: 3, total: 7 })}
        </Text>
      </View>
    );
  }

  function renderErrorState() {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>
          {screenState.kind === 'error' ? screenState.message : t('deviceTierResult.error')}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRetry}
          accessibilityRole="button"
          accessibilityLabel={t('modelDownload.retry')}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>{t('modelDownload.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderReadyState(tier: DeviceTier) {
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Progress indicator */}
        <OnboardingProgressIndicator currentStep={3} totalSteps={7} />

        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{t('deviceTierResult.title')}</Text>

          {/* Tier badge */}
          {renderTierBadge(tier)}

          {/* Model info card */}
          {renderModelInfoCard(tier)}

          {/* Download CTAs */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleDownloadNow}
              accessibilityRole="button"
              accessibilityLabel={t('deviceTierResult.downloadNow')}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonIcon}>⬇️</Text>
                <Text style={styles.primaryButtonText}>
                  {t('deviceTierResult.downloadNow')}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleDownloadLater}
              accessibilityRole="button"
              accessibilityLabel={t('deviceTierResult.downloadLater')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                {t('deviceTierResult.downloadLater')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // ── Cellular warning modal ───────────────────────────────────

  function renderCellularWarningOverlay() {
    if (screenState.kind !== 'cellularWarning') return null;

    const downloadSize = getDownloadSize(screenState.tier);

    return (
      <View style={styles.modalOverlay}>
        <View
          style={styles.modalContent}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          {/* Warning icon */}
          <View style={styles.modalIconContainer}>
            <Text style={styles.modalIcon}>📶</Text>
          </View>

          {/* Warning message */}
          <Text style={styles.modalTitle}>
            {t('deviceTierResult.cellularWarning', { size: downloadSize })}
          </Text>

          {/* Action buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalSecondaryButton}
              onPress={handleCellularCancel}
              accessibilityRole="button"
              accessibilityLabel={t('deviceTierResult.cellularCancel')}
              activeOpacity={0.8}
            >
              <Text style={styles.modalSecondaryButtonText}>
                {t('deviceTierResult.cellularCancel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalPrimaryButton}
              onPress={handleCellularProceed}
              accessibilityRole="button"
              accessibilityLabel={t('deviceTierResult.cellularProceed')}
              activeOpacity={0.8}
            >
              <Text style={styles.modalPrimaryButtonText}>
                {t('deviceTierResult.cellularProceed')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ── Main render ──────────────────────────────────────────────

  const currentLocale = i18n.language === 'zh-Hans' ? 'zh-Hans' : 'en';
  const safePadding = { paddingTop: insets.top, paddingBottom: insets.bottom };

  switch (screenState.kind) {
    case 'checking':
      return (
        <View style={[styles.container, safePadding]}>
          <OnboardingProgressIndicator currentStep={3} totalSteps={7} />
          {renderLoadingState()}
        </View>
      );

    case 'error':
      return (
        <View style={[styles.container, safePadding]}>
          <OnboardingProgressIndicator currentStep={3} totalSteps={7} />
          {renderErrorState()}
        </View>
      );

    case 'belowFloor':
      return (
        <View style={[styles.container, safePadding]}>
          <BelowFloorModal visible language={currentLocale} />
        </View>
      );

    case 'ready':
    case 'cellularWarning':
      const tier = screenState.kind === 'ready'
        ? screenState.tier
        : screenState.tier;
      return (
        <View style={[styles.container, safePadding]}>
          {renderReadyState(tier)}
          {renderCellularWarningOverlay()}
        </View>
      );

    default:
      return (
        <View style={[styles.container, safePadding]}>
          <OnboardingProgressIndicator currentStep={3} totalSteps={7} />
          {renderLoadingState()}
        </View>
      );
  }
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
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 48,
  },

  // ── Title ──────────────────────────────────────────────────────
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: { letterSpacing: -0.3 },
      android: { letterSpacing: 0 },
    }),
  } as TextStyle,

  // ── Loading state ──────────────────────────────────────────────
  loadingSpinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#E5E7EB',
    borderTopColor: '#4A90D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  spinnerText: {
    fontSize: 24,
    color: '#4A90D9',
  },
  loadingTitle: {
    fontSize: 17,
    color: '#4A90D9',
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  } as TextStyle,
  loadingSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },

  // ── Error state ────────────────────────────────────────────────
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  } as TextStyle,
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    backgroundColor: '#4A90D9',
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,

  // ── Tier badge ─────────────────────────────────────────────────
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  tierBadgeHigh: {
    backgroundColor: '#EBF5FB',
    borderWidth: 1,
    borderColor: '#B3D9F2',
  },
  tierBadgeStandard: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tierBadgeIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  tierBadgeIconHigh: {},
  tierBadgeIconStandard: {},
  tierBadgeTextContainer: {
    flex: 1,
  },
  tierBadgeLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  } as TextStyle,
  tierBadgeLabelHigh: {
    color: '#1A56DB',
  },
  tierBadgeLabelStandard: {
    color: '#374151',
  },
  tierBadgeDescription: {
    fontSize: 14,
    lineHeight: 20,
  } as TextStyle,
  tierBadgeDescriptionHigh: {
    color: '#1E429F',
  },
  tierBadgeDescriptionStandard: {
    color: '#6B7280',
  },

  // ── Model info card ────────────────────────────────────────────
  modelInfoCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 32,
  },
  modelInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modelInfoRowLast: {
    borderBottomWidth: 0,
  },
  modelInfoIcon: {
    fontSize: 18,
    marginRight: 12,
    marginTop: 1,
  },
  modelInfoTextContainer: {
    flex: 1,
  },
  modelInfoLabel: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 20,
    fontWeight: '500',
  } as TextStyle,
  modelInfoConsent: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  } as TextStyle,

  // ── Download CTAs ──────────────────────────────────────────────
  ctaSection: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonIcon: {
    fontSize: 18,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  } as TextStyle,
  secondaryButton: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  } as TextStyle,

  // ── Cellular warning modal ─────────────────────────────────────
  // ── Cellular warning overlay ───────────────────────────────────
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 100,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF3CD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalIcon: {
    fontSize: 32,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  } as TextStyle,
  modalActions: {
    width: '100%',
    gap: 10,
  },
  modalPrimaryButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  modalSecondaryButton: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  modalSecondaryButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '500',
  } as TextStyle,
});
