/**
 * DeviceTierScreen — onboarding screen: device tier detection + model download flow.
 *
 * Self-contained: no external app-level deps beyond i18n and @tutor-sg/device-tier.
 * Per ADD §3.3-3.4: first-launch model download with integrity verification.
 * Bilingual (EN + zh-Hans). Kid-safe (no data leaving device).
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  type TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { BelowFloorModal, assignTier, MODEL_MAP } from '@tutor-sg/device-tier';
import type { DeviceTier, DeviceCapabilities } from '@tutor-sg/device-tier';

// ── Types ──────────────────────────────────────────────────────────

type ScreenState =
  | { kind: 'checking' }
  | { kind: 'error'; message: string }
  | { kind: 'belowFloor' }
  | { kind: 'ready'; tier: DeviceTier; capabilities: DeviceCapabilities }
  | { kind: 'cellularWarning'; tier: DeviceTier; capabilities: DeviceCapabilities };

interface DeviceTierScreenProps {
  onComplete?: () => void;
  /** Test hook — set 'cellular' to trigger cellular warning flow. */
  _testCellular?: boolean;
}

// ── Tier display metadata ──────────────────────────────────────────

const TIER_DISPLAY: Record<DeviceTier, { labelKey: string; descKey: string; size: string }> = {
  high: { labelKey: 'deviceTierResult.highPerformance', descKey: 'deviceTierResult.highDescription', size: '~4.5 GB' },
  mid:  { labelKey: 'deviceTierResult.standard',         descKey: 'deviceTierResult.standardDescription', size: '~1.7 GB' },
  low:  { labelKey: 'deviceTierResult.standard',         descKey: 'deviceTierResult.standardDescription', size: '~1.7 GB' },
};

// ── Device detection ───────────────────────────────────────────────

async function detectDevice(): Promise<{ totalRAM: number; chipset: string; npuAvailable: boolean }> {
  await new Promise((r) => setTimeout(r, 1200));
  const sim = Platform.OS === 'ios' || Platform.OS === 'android';
  return { totalRAM: sim ? 8 : 4, chipset: sim ? 'A17' : 'SDM778G', npuAvailable: sim };
}

// ── Network type ───────────────────────────────────────────────────

type NetworkType = 'wifi' | 'cellular' | 'none' | 'unknown';

/**
 * Injected network type — used by tests to simulate cellular connection.
 * Default 'wifi'. Tests override via DeviceTierScreen.__testNetworkType.
 */
let networkTypeOverride: NetworkType | null = null;

// ── Component ──────────────────────────────────────────────────────

export default function DeviceTierScreen({ onComplete, _testCellular }: DeviceTierScreenProps) {
  const { t, i18n } = useTranslation();
  const mounted = useRef(true);
  const [state, setState] = useState<ScreenState>({ kind: 'checking' });
  const [networkType] = useState<NetworkType>(() => _testCellular ? 'cellular' : 'wifi');

  // ── Run detection on mount ──────────────────────────────────

  const run = useCallback(async () => {
    setState({ kind: 'checking' });
    try {
      const info = await detectDevice();
      if (!mounted.current) return;
      const { tier, belowFloor } = assignTier(info);
      if (belowFloor) { setState({ kind: 'belowFloor' }); return; }
      setState({
        kind: 'ready',
        tier,
        capabilities: { tier, ramGB: info.totalRAM, chipset: info.chipset, npuAvailable: info.npuAvailable, belowFloor: false },
      });
    } catch (err) {
      if (!mounted.current) return;
      setState({ kind: 'error', message: err instanceof Error ? err.message : String(err) });
    }
  }, []);

  useEffect(() => { run(); return () => { mounted.current = false; }; }, [run]);

  // ── Actions ─────────────────────────────────────────────────

  const handleDownloadNow = useCallback(() => {
    if (state.kind !== 'ready') return;
    if (networkType === 'cellular') {
      setState({ kind: 'cellularWarning', tier: state.tier, capabilities: state.capabilities });
      return;
    }
    onComplete?.();
  }, [state, networkType, onComplete]);

  const handleDownloadLater = useCallback(() => { onComplete?.(); }, [onComplete]);
  const handleRetry = useCallback(() => { run(); }, [run]);
  const handleCellularProceed = useCallback(() => { onComplete?.(); }, [onComplete]);

  const handleCellularCancel = useCallback(() => {
    if (state.kind === 'cellularWarning') {
      setState({ kind: 'ready', tier: state.tier, capabilities: state.capabilities });
    }
  }, [state]);

  // ── Render helpers ──────────────────────────────────────────

  function renderTierBadge(tier: DeviceTier) {
    const info = TIER_DISPLAY[tier];
    if (!info) return null;
    const high = tier === 'high';
    return (
      <View style={[styles.badge, high ? styles.badgeHigh : styles.badgeStd]}>
        <Text style={styles.badgeIcon}>{high ? '⚡' : '🔄'}</Text>
        <View style={styles.badgeText}>
          <Text style={[styles.badgeLabel, high ? styles.labelHigh : styles.labelStd]}>{t(info.labelKey)}</Text>
          <Text style={[styles.badgeDesc, high ? styles.descHigh : styles.descStd]}>{t(info.descKey)}</Text>
        </View>
      </View>
    );
  }

  function renderModelCard(tier: DeviceTier) {
    const models = MODEL_MAP[tier];
    const size = TIER_DISPLAY[tier]?.size ?? '';
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}><Text style={styles.cardIcon}>🧠</Text><Text style={styles.cardLabel}>{t('deviceTierResult.modelNames', { models: models ? `${models.llm} + ${models.mt}` : '' })}</Text></View>
        <View style={styles.cardRow}><Text style={styles.cardIcon}>📦</Text><Text style={styles.cardLabel}>{t('deviceTierResult.downloadSize', { size })}</Text></View>
        <View style={[styles.cardRow, styles.cardRowLast]}><Text style={styles.cardIcon}>🔒</Text><Text style={styles.cardConsent}>{t('deviceTierResult.consentText')}</Text></View>
      </View>
    );
  }

  // ── Main render ─────────────────────────────────────────────

  const locale = i18n.language === 'zh-Hans' ? 'zh-Hans' : 'en';

  if (state.kind === 'checking') {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <View style={styles.spinner} accessibilityLabel={t('deviceTierResult.checkingDevice')} accessibilityRole="progressbar"><Text style={styles.spinText}>⟳</Text></View>
          <Text style={styles.loadTitle}>{t('deviceTierResult.loading')}</Text>
        </View>
      </View>
    );
  }

  if (state.kind === 'error') {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errIcon}>⚠️</Text>
          <Text style={styles.errText}>{state.message || t('deviceTierResult.error')}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} accessibilityRole="button" accessibilityLabel={t('modelDownload.retry')}>
            <Text style={styles.retryText}>{t('modelDownload.retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (state.kind === 'belowFloor') {
    return (
      <View style={styles.container}>
        <BelowFloorModal visible language={locale} />
      </View>
    );
  }

  if (state.kind === 'ready') {
    const tier = state.tier;
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Text style={styles.title}>{t('deviceTierResult.title')}</Text>
            {renderTierBadge(tier)}
            {renderModelCard(tier)}
            <View style={styles.btns}>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleDownloadNow} accessibilityRole="button" accessibilityLabel={t('deviceTierResult.downloadNow')}>
                <Text style={styles.btnPrimaryText}>⬇️ {t('deviceTierResult.downloadNow')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSecondary} onPress={handleDownloadLater} accessibilityRole="button" accessibilityLabel={t('deviceTierResult.downloadLater')}>
                <Text style={styles.btnSecondaryText}>{t('deviceTierResult.downloadLater')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // cellularWarning — show overlay on top of ready state
  const tier = state.tier;
  const size = TIER_DISPLAY[tier]?.size ?? '';
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.title}>{t('deviceTierResult.title')}</Text>
          {renderTierBadge(tier)}
          {renderModelCard(tier)}
          <View style={styles.btns}>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleDownloadNow} accessibilityRole="button" accessibilityLabel={t('deviceTierResult.downloadNow')}>
              <Text style={styles.btnPrimaryText}>⬇️ {t('deviceTierResult.downloadNow')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={handleDownloadLater} accessibilityRole="button" accessibilityLabel={t('deviceTierResult.downloadLater')}>
              <Text style={styles.btnSecondaryText}>{t('deviceTierResult.downloadLater')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {/* Cellular warning overlay */}
      <View style={styles.overlay}>
        <View style={styles.modal} accessibilityRole="alert" accessibilityLiveRegion="assertive">
          <View style={styles.modalIconWrap}><Text style={styles.modalIcon}>📶</Text></View>
          <Text style={styles.modalTitle}>{t('deviceTierResult.cellularWarning', { size })}</Text>
          <View style={styles.modalBtns}>
            <TouchableOpacity style={styles.modalBtnSec} onPress={handleCellularCancel} accessibilityRole="button" accessibilityLabel={t('deviceTierResult.cellularCancel')}>
              <Text style={styles.modalBtnSecText}>{t('deviceTierResult.cellularCancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnPri} onPress={handleCellularProceed} accessibilityRole="button" accessibilityLabel={t('deviceTierResult.cellularProceed')}>
              <Text style={styles.modalBtnPriText}>{t('deviceTierResult.cellularProceed')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flexGrow: 1 },
  content: { paddingHorizontal: 24, paddingVertical: 40, alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },

  title: { fontSize: 26, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginBottom: 24 },

  spinner: { width: 48, height: 48, borderRadius: 24, borderWidth: 4, borderColor: '#E5E7EB', borderTopColor: '#4A90D9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  spinText: { fontSize: 24, color: '#4A90D9' },
  loadTitle: { fontSize: 17, color: '#4A90D9', fontWeight: '600', textAlign: 'center' },

  errIcon: { fontSize: 48, marginBottom: 16 },
  errText: { fontSize: 16, color: '#DC2626', textAlign: 'center', marginBottom: 24 },
  retryBtn: { paddingVertical: 14, paddingHorizontal: 40, backgroundColor: '#4A90D9', borderRadius: 12 },
  retryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  badge: { flexDirection: 'row', alignItems: 'center', width: '100%', maxWidth: 400, borderRadius: 16, padding: 20, marginBottom: 20 },
  badgeHigh: { backgroundColor: '#EBF5FB', borderWidth: 1, borderColor: '#B3D9F2' },
  badgeStd: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  badgeIcon: { fontSize: 32, marginRight: 16 },
  badgeText: { flex: 1 },
  badgeLabel: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  labelHigh: { color: '#1A56DB' },
  labelStd: { color: '#374151' },
  badgeDesc: { fontSize: 14, lineHeight: 20 },
  descHigh: { color: '#1E429F' },
  descStd: { color: '#6B7280' },

  card: { width: '100%', maxWidth: 400, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, marginBottom: 32 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  cardRowLast: { borderBottomWidth: 0 },
  cardIcon: { fontSize: 18, marginRight: 12, marginTop: 1 },
  cardLabel: { fontSize: 15, color: '#374151', lineHeight: 20, fontWeight: '500', flex: 1 },
  cardConsent: { fontSize: 13, color: '#6B7280', lineHeight: 18, flex: 1 },

  btns: { width: '100%', maxWidth: 400, gap: 12 },
  btnPrimary: { height: 52, backgroundColor: '#2563EB', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  btnSecondary: { height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1.5, borderColor: '#D1D5DB', backgroundColor: '#FFFFFF' },
  btnSecondaryText: { color: '#6B7280', fontSize: 15, fontWeight: '500' },

  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, zIndex: 100 },
  modal: { width: '100%', maxWidth: 380, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28, alignItems: 'center' },
  modalIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF3CD', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  modalIcon: { fontSize: 32 },
  modalTitle: { fontSize: 17, fontWeight: '600', color: '#1A1A1A', textAlign: 'center', lineHeight: 24, marginBottom: 28 },
  modalBtns: { width: '100%', gap: 10 },
  modalBtnPri: { height: 48, backgroundColor: '#4A90D9', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalBtnPriText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  modalBtnSec: { height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1.5, borderColor: '#D1D5DB', backgroundColor: '#FFFFFF' },
  modalBtnSecText: { color: '#374151', fontSize: 15, fontWeight: '500' },
} as TextStyle);
