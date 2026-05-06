/**
 * Device-tier detection module.
 *
 * Detects device capabilities (RAM, chipset, NPU, thermal headroom) and classifies
 * the device into a tier that determines which LLM models to download and use.
 *
 * ## Tiers (per decisions-locked.md / ARCHITECTURE.md §3.4)
 *
 * | Tier         | RAM        | NPU                          | Models                  |
 * |--------------|------------|------------------------------|-------------------------|
 * | `high`       | ≥ 6 GB     | Modern (A14+/SD8Gen1+/T G2+) | Gemma E4B / Qwen 4B     |
 * | `mid`        | ≥ 4 GB     | Any (or ≥6GB w/o modern NPU) | Gemma E2B / Qwen 2B     |
 * | `unsupported`| < 4 GB     | —                            | None (blocked)          |
 *
 * ## Platform-specific detection
 *
 * iOS: NSProcessInfo.processInfo.physicalMemory + device model → chipset inference
 * Android: /proc/meminfo + ActivityManager.MemoryInfo + ro.board.platform
 *
 * Native module bridging is abstracted behind DeviceCapabilityProvider so the
 * pure classification logic remains testable without native code.
 */

import { Platform } from 'react-native';

// ── Types ──────────────────────────────────────────────────────────

/** Device tier as defined by the architecture. */
export type DeviceTier = 'high' | 'mid' | 'unsupported';

/** Raw capabilities used to classify a device. */
export interface DeviceCapabilities {
  /** Total physical RAM in bytes. */
  ramBytes: number;
  /** Human-readable chipset / SoC identifier (e.g. "A16", "SD8Gen2"). */
  chipset: string;
  /** Whether the device has a modern NPU / Neural Engine capable of efficient INT8/FP16 inference. */
  hasModernNpu: boolean;
  /** Estimated thermal headroom for sustained LLM inference. */
  thermalHeadroom: 'good' | 'moderate' | 'poor';
}

/** Tier result including metadata for display / diagnostics. */
export interface DeviceTierResult {
  tier: DeviceTier;
  capabilities: DeviceCapabilities;
  /** Human-readable tier label (En). */
  labelEn: string;
  /** Human-readable tier label (zh-Hans). */
  labelZh: string;
}

// ── Capability provider interface ──────────────────────────────────

/** Platform-agnostic interface for fetching device capabilities. */
export interface DeviceCapabilityProvider {
  /** Resolve device capabilities. May be async (native module reads). */
  getCapabilities(): Promise<DeviceCapabilities>;
}

// ── Pure classification ────────────────────────────────────────────

/** Minimum RAM for the mid tier (bytes). */
const MID_TIER_RAM_BYTES = 4 * 1024 * 1024 * 1024; // 4 GB

/** Minimum RAM for the high tier (bytes). */
const HIGH_TIER_RAM_BYTES = 6 * 1024 * 1024 * 1024; // 6 GB

/** Chipset prefixes that indicate a modern NPU. */
const MODERN_NPU_CHIPSETS = new Set([
  // Apple
  'A14', 'A15', 'A16', 'A17', 'A18', 'A19',
  'M1', 'M2', 'M3', 'M4',
  // Qualcomm
  'SD8Gen1', 'SD8+Gen1', 'SD8Gen2', 'SD8Gen3', 'SD8Gen4', 'SD8Elite',
  'SD7+Gen2', 'SD7+Gen3',
  // MediaTek
  'Dimensity9000', 'Dimensity9200', 'Dimensity9300', 'Dimensity9400',
  'Dimensity8300', 'Dimensity8400',
  // Google
  'TensorG2', 'TensorG3', 'TensorG4', 'TensorG5',
  // Samsung
  'Exynos2200', 'Exynos2300', 'Exynos2400',
]);

/**
 * Pure function: classify a device into a tier based on capabilities.
 * Zero side effects — suitable for unit testing.
 */
export function classifyDeviceTier(capabilities: DeviceCapabilities): DeviceTierResult {
  const { ramBytes, hasModernNpu, thermalHeadroom } = capabilities;

  let tier: DeviceTier;

  if (ramBytes < MID_TIER_RAM_BYTES) {
    tier = 'unsupported';
  } else if (ramBytes >= HIGH_TIER_RAM_BYTES && hasModernNpu) {
    tier = 'high';
  } else {
    tier = 'mid';
  }

  // If thermal headroom is poor, downgrade high → mid for safety.
  // High-tier models (E4B) can cause thermal throttling on borderline devices.
  if (tier === 'high' && thermalHeadroom === 'poor') {
    tier = 'mid';
  }

  const labels: Record<DeviceTier, { labelEn: string; labelZh: string }> = {
    high: { labelEn: 'High Performance', labelZh: '高性能' },
    mid: { labelEn: 'Standard', labelZh: '标准' },
    unsupported: { labelEn: 'Unsupported', labelZh: '不支持' },
  };

  return {
    tier,
    capabilities,
    labelEn: labels[tier].labelEn,
    labelZh: labels[tier].labelZh,
  };
}

// ── Platform capability providers ──────────────────────────────────

/**
 * iOS capability provider.
 *
 * Uses `expo-constants` device model + year class to infer RAM and NPU.
 * For production accuracy, replace with a native module reading
 * `NSProcessInfo.processInfo.physicalMemory` directly.
 */
class IosCapabilityProvider implements DeviceCapabilityProvider {
  async getCapabilities(): Promise<DeviceCapabilities> {
    // Dynamically import expo-constants to avoid crash in test environments
    const Constants = (await import('expo-constants')).default;
    const model = Constants.expoConfig?.extra?.deviceModel as string
      ?? Constants.deviceName
      ?? 'unknown';

    // Infer RAM from device model (conservative estimates)
    // iPhone 12/12 mini (A14): 4 GB
    // iPhone 12 Pro/Pro Max (A14): 6 GB
    // iPhone 13/13 mini (A15): 4 GB
    // iPhone 13 Pro/Pro Max (A15): 6 GB
    // iPhone 14/14 Plus (A15): 6 GB
    // iPhone 14 Pro/Pro Max (A16): 6 GB
    // iPhone 15/15 Plus (A16): 6 GB
    // iPhone 15 Pro/Pro Max (A17 Pro): 8 GB
    // iPhone 16/16 Plus (A18): 8 GB
    // iPhone 16 Pro/Pro Max (A18 Pro): 8 GB
    // iPad: typically 4–16 GB depending on model
    const ramGb = estimateIosRam(model);
    const ramBytes = ramGb * 1024 * 1024 * 1024;

    const chipset = inferIosChipset(model);
    const hasModernNpu = chipset !== null && MODERN_NPU_CHIPSETS.has(chipset);

    const thermalHeadroom = inferIosThermalHeadroom(model, chipset);

    return { ramBytes, chipset: chipset ?? 'unknown', hasModernNpu, thermalHeadroom };
  }
}

/**
 * Android capability provider.
 *
 * Uses a heuristic based on device metadata available through expo-constants.
 * For production accuracy, replace with a native module reading
 * `/proc/meminfo` + `ActivityManager.MemoryInfo` + `ro.board.platform`.
 */
class AndroidCapabilityProvider implements DeviceCapabilityProvider {
  async getCapabilities(): Promise<DeviceCapabilities> {
    const Constants = (await import('expo-constants')).default;

    // Try to get total memory. expo-constants doesn't expose this directly,
    // but we can use device year class as a rough proxy.
    // A native module should replace this with real MemTotal from /proc/meminfo.
    const deviceName = (Constants.deviceName as string) ?? 'unknown';

    // Heuristic: device name often includes "Pro", "Ultra", "Plus" for higher-RAM variants
    const ramBytes = estimateAndroidRam(deviceName, Constants as any);

    const chipset = ''; // Cannot determine without native module / Build.HARDWARE
    const hasModernNpu = false; // Conservative: assume no unless proven otherwise
    const thermalHeadroom = 'moderate'; // Default for unknown Android devices

    return { ramBytes, chipset, hasModernNpu, thermalHeadroom };
  }
}

/**
 * Mock capability provider for tests / development.
 * Accepts a fixed capabilities record and returns it immediately.
 */
export class MockCapabilityProvider implements DeviceCapabilityProvider {
  constructor(private capabilities: DeviceCapabilities) {}

  async getCapabilities(): Promise<DeviceCapabilities> {
    return { ...this.capabilities };
  }

  /** Create a provider for a known device tier. */
  static forTier(tier: DeviceTier): MockCapabilityProvider {
    const caps: Record<DeviceTier, DeviceCapabilities> = {
      high: {
        ramBytes: 8 * 1024 * 1024 * 1024,
        chipset: 'A17',
        hasModernNpu: true,
        thermalHeadroom: 'good',
      },
      mid: {
        ramBytes: 4 * 1024 * 1024 * 1024,
        chipset: 'A13',
        hasModernNpu: false,
        thermalHeadroom: 'moderate',
      },
      unsupported: {
        ramBytes: 2 * 1024 * 1024 * 1024,
        chipset: 'A10',
        hasModernNpu: false,
        thermalHeadroom: 'poor',
      },
    };
    return new MockCapabilityProvider(caps[tier]);
  }
}

// ── Factory ─────────────────────────────────────────────────────────

/**
 * Return the platform-appropriate capability provider.
 */
export function createPlatformCapabilityProvider(): DeviceCapabilityProvider {
  if (Platform.OS === 'ios') {
    return new IosCapabilityProvider();
  }
  return new AndroidCapabilityProvider();
}

// ── High-level detector ────────────────────────────────────────────

/**
 * One-shot: detect the device tier using the platform capability provider.
 */
export async function detectDeviceTier(
  provider?: DeviceCapabilityProvider,
): Promise<DeviceTierResult> {
  const p = provider ?? createPlatformCapabilityProvider();
  const capabilities = await p.getCapabilities();
  return classifyDeviceTier(capabilities);
}

// ── iOS heuristics ─────────────────────────────────────────────────

/**
 * Estimate RAM in GB for iOS devices based on model identifier.
 * These are conservative estimates. Production should use
 * `NSProcessInfo.processInfo.physicalMemory`.
 */
function estimateIosRam(model: string): number {
  const lower = model.toLowerCase();

  // iPhone 16 series (A18): 8 GB
  if (lower.includes('iphone16')) return 8;
  // iPhone 15 Pro series (A17 Pro): 8 GB
  if (lower.includes('iphone15,4') || lower.includes('iphone15,5') ||
      lower.includes('iphone 15 pro')) return 8;
  // iPhone 15 non-Pro (A16): 6 GB
  if (lower.includes('iphone15')) return 6;
  // iPhone 14 Pro series (A16): 6 GB
  if (lower.includes('iphone14 pro')) return 6;
  // iPhone 14 non-Pro (A15): 6 GB
  if (lower.includes('iphone14')) return 6;
  // iPhone 13 Pro series (A15): 6 GB
  if (lower.includes('iphone13,3') || lower.includes('iphone13,4') ||
      lower.includes('iphone 13 pro')) return 6;
  // iPhone 13 non-Pro (A15): 4 GB
  if (lower.includes('iphone13')) return 4;
  // iPhone 12 Pro series (A14): 6 GB
  if (lower.includes('iphone12,3') || lower.includes('iphone12,5') ||
      lower.includes('iphone 12 pro')) return 6;
  // iPhone 12 non-Pro (A14): 4 GB
  if (lower.includes('iphone12')) return 4;
  // iPhone 11 series (A13): 4 GB
  if (lower.includes('iphone11')) return 4;
  // iPhone SE 2020 (A13): 3 GB
  if (lower.includes('iphone12,8') || lower.includes('iphone se 2')) return 3;
  // iPhone XS/XR (A12): 3-4 GB
  if (lower.includes('iphone11,') || lower.includes('iphone xs') || lower.includes('iphone xr')) return 3;

  // iPad (most recent iPads have 4-8 GB)
  if (lower.includes('ipad')) {
    if (lower.includes('pro')) return 8;
    if (lower.includes('air')) return 8;
    return 4; // iPad base model
  }

  // Default: assume 4 GB for any unknown iOS 16+ device
  return 4;
}

/** Infer Apple chipset family from device model string. */
function inferIosChipset(model: string): string | null {
  const lower = model.toLowerCase();

  if (lower.includes('iphone18') || lower.includes('ipad16')) return 'A19';
  if (lower.includes('iphone17') || lower.includes('ipad15')) return 'A18';
  if (lower.includes('iphone16,1') || lower.includes('iphone16,2') ||
      lower.includes('iphone 15 pro')) return 'A17';
  if (lower.includes('iphone16')) return 'A18'; // iPhone 16 non-Pro = A18
  if (lower.includes('iphone15,4') || lower.includes('iphone15,5')) return 'A17';
  if (lower.includes('iphone15')) return 'A16';
  if (lower.includes('iphone14 pro')) return 'A16';
  if (lower.includes('iphone14')) return 'A15';
  if (lower.includes('iphone13 pro')) return 'A15';
  if (lower.includes('iphone13')) return 'A15';
  if (lower.includes('iphone12 pro')) return 'A14';
  if (lower.includes('iphone12')) return 'A14';
  if (lower.includes('iphone11')) return 'A13';
  if (lower.includes('iphone xs') || lower.includes('iphone xr')) return 'A12';

  // iPad
  if (lower.includes('ipad pro')) return 'M4';
  if (lower.includes('ipad air')) return 'M2';
  if (lower.includes('ipad mini')) return 'A15';
  if (lower.includes('ipad')) return 'A14';

  return null;
}

/** Estimate thermal headroom for iOS devices. */
function inferIosThermalHeadroom(model: string, chipset: string | null): 'good' | 'moderate' | 'poor' {
  if (!chipset) return 'moderate';

  // A16+ and M-series have excellent thermal management
  if (['A16', 'A17', 'A18', 'A19', 'M1', 'M2', 'M3', 'M4'].includes(chipset)) {
    return 'good';
  }
  // A14/A15 still decent
  if (['A14', 'A15'].includes(chipset)) {
    return 'good';
  }
  // A12/A13: may throttle under sustained load
  if (['A12', 'A13'].includes(chipset)) {
    return 'moderate';
  }

  return 'moderate';
}

// ── Android heuristics ─────────────────────────────────────────────

/**
 * Estimate Android RAM from device metadata.
 *
 * This is a coarse heuristic. Production should read MemTotal from
 * /proc/meminfo via a native module. Even better: ActivityManager.MemoryInfo
 * gives the exact totalMem in bytes.
 */
function estimateAndroidRam(deviceName: string, _constants: any): number {
  const lower = deviceName.toLowerCase();
  const gb = 1024 * 1024 * 1024;

  // High-end flagships (2023+)
  if (lower.includes('s24') || lower.includes('s25') ||
      lower.includes('pixel 8 pro') || lower.includes('pixel 9') ||
      lower.includes('oneplus 12') || lower.includes('oneplus 13') ||
      lower.includes('xiaomi 14') || lower.includes('xiaomi 15')) {
    return 12 * gb;
  }

  // Mid-high flagships
  if (lower.includes('s23') ||
      lower.includes('pixel 8') || lower.includes('pixel 7 pro') ||
      lower.includes('oneplus 11') || lower.includes('xiaomi 13')) {
    return 8 * gb;
  }

  // Older flagships / mid-range
  if (lower.includes('s22') || lower.includes('pixel 7') || lower.includes('pixel 6 pro') ||
      lower.includes('oneplus 10') || lower.includes('xiaomi 12') ||
      lower.includes('redmi note 13') || lower.includes('redmi note 14') ||
      lower.includes('galaxy a54') || lower.includes('galaxy a55')) {
    return 6 * gb;
  }

  // Budget / older devices (typically 3-4 GB)
  if (lower.includes('redmi') || lower.includes('galaxy a') ||
      lower.includes('oppo a') || lower.includes('realme') ||
      lower.includes('pixel 6') || lower.includes('pixel 5')) {
    return 4 * gb;
  }

  // Unknown Android: assume 4 GB (conservative, matches our minimum)
  return 4 * gb;
}
