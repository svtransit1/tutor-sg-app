/**
 * DeviceTierProvider — React context provider for device tier detection.
 *
 * Responsibilities:
 * 1. At mount, detect device capabilities (RAM, chipset, NPU) using the
 *    appropriate native module or fallback.
 * 2. Derive the device tier and below-floor status via assignTier().
 * 3. Expose tier + capabilities to the entire app tree via useDeviceTier().
 * 4. If belowFloor, render a blocking modal (BelowFloorGuard) that prevents
 *    any child UI from being reachable.
 *
 * Per ADD §3.4: Runtime detection at first launch.
 * Per locked decisions: below floor → "device too old" message.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { Platform, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { assignTier, buildCapabilities } from './detect';
import { BelowFloorModal } from './components/BelowFloorModal';
import type { DeviceTier, DeviceCapabilities } from './types';

// ── Types ──────────────────────────────────────────────────────────

export interface DeviceTierContextValue {
  /** The detected device tier. */
  tier: DeviceTier;
  /** Full capabilities object. */
  capabilities: DeviceCapabilities;
  /** Whether the device is below the minimum floor. */
  belowFloor: boolean;
  /** Whether detection is still in progress. */
  loading: boolean;
  /** Error message if detection failed. */
  error: string | null;
  /** Re-run device detection. */
  refresh: () => Promise<void>;
}

interface DeviceTierProviderProps {
  children: React.ReactNode;
  /** Async function to detect native device info. Override for testing. */
  detectInfo?: () => Promise<{ totalRAM: number; chipset: string; npuAvailable: boolean }>;
  /** Override locale for BelowFloorModal (default: from i18n). */
  language?: 'en' | 'zh-Hans';
}

// ── Context ────────────────────────────────────────────────────────

const DeviceTierContext = createContext<DeviceTierContextValue | null>(null);

// ── Default detection function ─────────────────────────────────────

async function detectDeviceInfo(): Promise<{ totalRAM: number; chipset: string; npuAvailable: boolean }> {
  // In production, this would call a native module (DeviceTierNativeModule).
  // For now, use Platform.OS stub — real implementation replaces this
  // when native modules are wired.
  await new Promise((r) => setTimeout(r, 800));
  return {
    totalRAM: Platform.OS === 'ios' ? 8 : 4,
    chipset: Platform.OS === 'ios' ? 'A17' : 'SDM778G',
    npuAvailable: true,
  };
}

// ── Loading fallback ───────────────────────────────────────────────

function LoadingFallback() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.loadingText}>
        Checking device compatibility...
      </Text>
    </View>
  );
}

// ── Provider ───────────────────────────────────────────────────────

export function DeviceTierProvider({
  children,
  detectInfo,
  language,
}: DeviceTierProviderProps) {
  const [tier, setTier] = useState<DeviceTier>('mid');
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    tier: 'mid', ramGB: 4, chipset: '', npuAvailable: false, belowFloor: false,
  });
  const [belowFloor, setBelowFloor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const detect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const detector = detectInfo ?? detectDeviceInfo;
      const info = await detector();
      if (!mounted.current) return;

      const { tier: detectedTier, belowFloor: isBelow } = assignTier(info);
      const caps = buildCapabilities(info);

      setTier(detectedTier);
      setCapabilities(caps);
      setBelowFloor(isBelow);
    } catch (err) {
      if (!mounted.current) return;
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      // On detection failure, default to mid tier (safe fallback)
      setTier('mid');
      setBelowFloor(false);
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [detectInfo]);

  useEffect(() => {
    detect();
    return () => { mounted.current = false; };
  }, [detect]);

  const value = useMemo<DeviceTierContextValue>(
    () => ({
      tier,
      capabilities,
      belowFloor,
      loading,
      error,
      refresh: detect,
    }),
    [tier, capabilities, belowFloor, loading, error, detect],
  );

  // ── Loading state: show spinner until detection completes ────
  if (loading) {
    return <LoadingFallback />;
  }

  // ── Below-floor guard: block all child UI ────────────────────
  if (belowFloor) {
    return (
      <DeviceTierContext.Provider value={value}>
        <BelowFloorModal visible language={language} />
      </DeviceTierContext.Provider>
    );
  }

  return (
    <DeviceTierContext.Provider value={value}>
      {children}
    </DeviceTierContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────

export function useDeviceTier(): DeviceTierContextValue {
  const ctx = useContext(DeviceTierContext);
  if (!ctx) {
    throw new Error('useDeviceTier must be used within a DeviceTierProvider');
  }
  return ctx;
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});
