/**
 * useDeviceTier — detects device tier on mount using the @tutor-sg/device-tier package.
 *
 * Returns loading / detected tier / below-floor / error states.
 * Designed for the onboarding flow (Step 3): shows result and asks
 * for download consent.
 *
 * Per ADD §3.4: sniffs RAM + chipset + NPU at first launch.
 *
 * Testability: accepts an optional detectTierFn parameter for dependency injection.
 */
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  type DeviceTier,
  type DeviceCapabilities,
  type NativeDeviceInfo,
  buildCapabilities,
} from '@tutor-sg/device-tier';
import { getTierDisplayInfo, TierDisplayInfo } from './tierDisplayInfo';

// ── Types ──────────────────────────────────────────────────────────

export interface DeviceTierState {
  loading: boolean;
  capabilities: DeviceCapabilities | null;
  error: string | null;
}

export { TierDisplayInfo };

// ── Default platform detection ─────────────────────────────────────

function defaultDetectNativeInfo(): NativeDeviceInfo {
  const totalRAM =
    (Constants.manifest?.extra?.deviceRamGB as number) ?? (Platform.OS === 'ios' ? 4 : 6);

  const chipset =
    (Constants.manifest?.extra?.deviceChipset as string | undefined) ??
    (Platform.OS === 'ios' ? 'A14' : 'unknown');

  const npuAvailable =
    (Constants.manifest?.extra?.deviceNPU as boolean | undefined) ?? Platform.OS === 'ios';

  return { totalRAM, chipset, npuAvailable };
}

// ── Hook ───────────────────────────────────────────────────────────

export function useDeviceTier(
  locale: 'en' | 'zh-Hans' = 'en',
  detectTierFn?: () => NativeDeviceInfo,
): DeviceTierState & {
  displayInfo: TierDisplayInfo | null;
  belowFloor: boolean;
  tier: DeviceTier | null;
} {
  const [state, setState] = useState<DeviceTierState>({
    loading: true,
    capabilities: null,
    error: null,
  });

  useEffect(() => {
    try {
      const nativeInfo = (detectTierFn ?? defaultDetectNativeInfo)();
      const capabilities = buildCapabilities(nativeInfo);
      setState({
        loading: false,
        capabilities,
        error: null,
      });
    } catch (err) {
      setState({
        loading: false,
        capabilities: null,
        error: err instanceof Error ? err.message : 'Device detection failed',
      });
    }
  }, [detectTierFn]);

  const tier = state.capabilities?.tier ?? null;
  const belowFloor = state.capabilities?.belowFloor ?? false;
  const displayInfo = tier && tier !== 'low' ? getTierDisplayInfo(tier, locale) : null;

  return {
    ...state,
    tier,
    belowFloor,
    displayInfo,
  };
}
