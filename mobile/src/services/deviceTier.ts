/**
 * Mobile platform capability providers.
 *
 * Uses react-native-device-info + expo-file-system for real device data.
 * Pure classification logic lives in @tutor-sg/shared.
 */

import { Platform } from 'react-native';
import type {
  DeviceTier,
  DeviceCapabilities,
  DeviceCapabilityProvider,
  DeviceTierResult,
} from '@tutor-sg/shared';
import {
  classifyDeviceTier,
  MODERN_NPU_CHIPSETS,
} from '@tutor-sg/shared';

// Re-export types so consumers import from one place
export type { DeviceTier, DeviceCapabilities, DeviceTierResult } from '@tutor-sg/shared';

// ── Session cache ──────────────────────────────────────────────────

let cachedResult: DeviceTierResult | null = null;

/** Reset the cached tier (e.g. after Settings override). */
export function clearDeviceTierCache(): void {
  cachedResult = null;
}

// ── Chipset lookup tables ──────────────────────────────────────────

/**
 * iOS model identifier → chipset family.
 * Keyed by the internal model ID (e.g. "iPhone15,2").
 */
const IOS_MODEL_CHIPSET: Record<string, string> = {
  // iPhone 12 series (A14)
  'iPhone13,1': 'A14', 'iPhone13,2': 'A14', 'iPhone13,3': 'A14', 'iPhone13,4': 'A14',
  // iPhone 13 series (A15)
  'iPhone14,2': 'A15', 'iPhone14,3': 'A15', 'iPhone14,4': 'A15', 'iPhone14,5': 'A15',
  // iPhone 14 series (A15 / A16)
  'iPhone14,7': 'A15', 'iPhone14,8': 'A15', 'iPhone15,2': 'A16', 'iPhone15,3': 'A16',
  // iPhone 15 series (A16 / A17 Pro)
  'iPhone15,4': 'A16', 'iPhone15,5': 'A16', 'iPhone16,1': 'A17', 'iPhone16,2': 'A17',
  // iPhone 16 series (A18 / A18 Pro)
  'iPhone17,1': 'A18', 'iPhone17,2': 'A18', 'iPhone17,3': 'A18', 'iPhone17,4': 'A18',
  // iPhone SE
  'iPhone14,6': 'A15', 'iPhone12,8': 'A13',
};

/**
 * iOS model identifier → RAM in GB (conservative published values).
 */
const IOS_MODEL_RAM_GB: Record<string, number> = {
  'iPhone13,1': 4, 'iPhone13,2': 4,  // iPhone 12 / mini
  'iPhone13,3': 6, 'iPhone13,4': 6,  // iPhone 12 Pro / Pro Max
  'iPhone14,2': 4, 'iPhone14,3': 4,  // iPhone 13 / mini
  'iPhone14,4': 6, 'iPhone14,5': 6,  // iPhone 13 Pro / Pro Max
  'iPhone14,6': 4,                    // iPhone SE 3
  'iPhone14,7': 6, 'iPhone14,8': 6,  // iPhone 14 / Plus
  'iPhone15,2': 6, 'iPhone15,3': 6,  // iPhone 14 Pro / Pro Max
  'iPhone15,4': 6, 'iPhone15,5': 6,  // iPhone 15 / Plus
  'iPhone16,1': 8, 'iPhone16,2': 8,  // iPhone 15 Pro / Pro Max
  'iPhone17,1': 8, 'iPhone17,2': 8,  // iPhone 16 / Plus
  'iPhone17,3': 8, 'iPhone17,4': 8,  // iPhone 16 Pro / Pro Max
  'iPhone12,8': 3,                    // iPhone SE 2
};

// ── iOS provider ───────────────────────────────────────────────────

class IosCapabilityProvider implements DeviceCapabilityProvider {
  async getCapabilities(): Promise<DeviceCapabilities> {
    const DeviceInfo = (await import('react-native-device-info')).default;
    const FileSystem = (await import('expo-file-system'));

    // RAM: use model table first, then fall back to heuristic
    const modelId = DeviceInfo.getDeviceId();
    let ramBytes: number;

    if (IOS_MODEL_RAM_GB[modelId]) {
      ramBytes = IOS_MODEL_RAM_GB[modelId]! * 1024 * 1024 * 1024;
    } else {
      // Fallback: use total memory from DeviceInfo if available, else conservative 4 GB
      const totalMem = await DeviceInfo.getTotalMemory();
      ramBytes = totalMem > 0 ? totalMem : 4 * 1024 * 1024 * 1024;
    }

    const chipset = IOS_MODEL_CHIPSET[modelId] ?? 'unknown';
    const hasModernNpu = MODERN_NPU_CHIPSETS.has(chipset);
    const thermalHeadroom = inferIosThermalHeadroom(chipset);

    // Free storage
    const freeStorageBytes = await getFreeStorage(FileSystem);

    return { ramBytes, chipset, hasModernNpu, thermalHeadroom, freeStorageBytes };
  }
}

// ── Android provider ───────────────────────────────────────────────

class AndroidCapabilityProvider implements DeviceCapabilityProvider {
  async getCapabilities(): Promise<DeviceCapabilities> {
    const DeviceInfo = (await import('react-native-device-info')).default;
    const FileSystem = (await import('expo-file-system'));

    // RAM: use getTotalMemory() which reads /proc/meminfo on Android
    const totalMem = await DeviceInfo.getTotalMemory();
    const ramBytes = totalMem > 0 ? totalMem : 4 * 1024 * 1024 * 1024;

    // Chipset: Build.SOC_MODEL (API 31+) via getDeviceName or hardware property
    const hardware = await DeviceInfo.getDevice();
    const chipset = inferAndroidChipset(hardware, DeviceInfo);

    const hasModernNpu = MODERN_NPU_CHIPSETS.has(chipset);
    const thermalHeadroom = inferAndroidThermalHeadroom(chipset, ramBytes);

    // Free storage
    const freeStorageBytes = await getFreeStorage(FileSystem);

    return { ramBytes, chipset, hasModernNpu, thermalHeadroom, freeStorageBytes };
  }
}

// ── Storage helper ─────────────────────────────────────────────────

async function getFreeStorage(FileSystem: any): Promise<number> {
  try {
    const info = await FileSystem.getFreeDiskStorageAsync();
    return typeof info === 'number' ? info : 10 * 1024 * 1024 * 1024;
  } catch {
    return 10 * 1024 * 1024 * 1024; // assume plenty if we can't read
  }
}

// ── Chipset inference ──────────────────────────────────────────────

function inferAndroidChipset(hardware: string, DeviceInfo: any): string {
  // Try known patterns from Build.HARDWARE / ro.board.platform
  const h = hardware.toLowerCase();

  // Qualcomm
  if (h.includes('qcom') || h.includes('sm8450')) return 'SD8Gen1';
  if (h.includes('sm8475')) return 'SD8+Gen1';
  if (h.includes('sm8550')) return 'SD8Gen2';
  if (h.includes('sm8650')) return 'SD8Gen3';
  if (h.includes('sm8750')) return 'SD8Gen4';
  if (h.includes('sm7475')) return 'SD7+Gen2';

  // Google Tensor
  if (h.includes('gs101') || h.includes('whitefin')) return 'TensorG1';
  if (h.includes('gs201') || h.includes('cloudripper')) return 'TensorG2';
  if (h.includes('gs301') || h.includes('zuma')) return 'TensorG3';
  if (h.includes('gs401') || h.includes('zumapro')) return 'TensorG4';

  // Samsung Exynos
  if (h.includes('exynos2200')) return 'Exynos2200';
  if (h.includes('exynos2300')) return 'Exynos2300';
  if (h.includes('exynos2400')) return 'Exynos2400';

  // MediaTek
  const brand = (DeviceInfo?.getBrand?.() ?? '').toLowerCase();
  const model = (DeviceInfo?.getModel?.() ?? '').toLowerCase();
  if (brand.includes('redmi') || model.includes('redmi')) {
    if (model.includes('note 14') || model.includes('note 13')) return 'Dimensity8300';
    if (model.includes('note 12')) return 'Dimensity1080';
    return ''; // Redmi 9 / budget — no modern NPU
  }

  return ''; // Unknown — conservative
}

function inferIosThermalHeadroom(chipset: string): 'good' | 'moderate' | 'poor' {
  if (['A16', 'A17', 'A18', 'A19', 'M1', 'M2', 'M3', 'M4'].includes(chipset)) return 'good';
  if (['A14', 'A15'].includes(chipset)) return 'good';
  if (['A12', 'A13'].includes(chipset)) return 'moderate';
  return 'moderate';
}

function inferAndroidThermalHeadroom(
  chipset: string,
  ramBytes: number,
): 'good' | 'moderate' | 'poor' {
  if (!chipset) return 'moderate';
  // Modern flagships: good thermal
  if (['SD8Gen2', 'SD8Gen3', 'SD8Gen4', 'SD8Elite', 'TensorG3', 'TensorG4',
       'Dimensity9300', 'Dimensity9400'].includes(chipset)) return 'good';
  // Previous gen: moderate
  if (['SD8Gen1', 'SD8+Gen1', 'TensorG2', 'Dimensity9000', 'Dimensity9200',
       'Exynos2200'].includes(chipset)) return 'good';
  // Budget: poor thermal if low RAM, otherwise moderate
  if (ramBytes < 4 * 1024 * 1024 * 1024) return 'poor';
  return 'moderate';
}

// ── Mock provider (tests) ──────────────────────────────────────────

export class MockCapabilityProvider implements DeviceCapabilityProvider {
  constructor(private capabilities: DeviceCapabilities) {}

  async getCapabilities(): Promise<DeviceCapabilities> {
    return { ...this.capabilities };
  }

  static forTier(tier: DeviceTier): MockCapabilityProvider {
    const gb = 1024 * 1024 * 1024;
    const caps: Record<DeviceTier, DeviceCapabilities> = {
      high: {
        ramBytes: 8 * gb,
        chipset: 'A17',
        hasModernNpu: true,
        thermalHeadroom: 'good',
        freeStorageBytes: 50 * gb,
      },
      mid: {
        ramBytes: 4 * gb,
        chipset: 'A13',
        hasModernNpu: false,
        thermalHeadroom: 'moderate',
        freeStorageBytes: 20 * gb,
      },
      low: {
        ramBytes: 2 * gb,
        chipset: 'A10',
        hasModernNpu: false,
        thermalHeadroom: 'poor',
        freeStorageBytes: 2 * gb,
      },
    } as Record<DeviceTier, DeviceCapabilities>;
    return new MockCapabilityProvider(caps[tier]);
  }
}

// ── Factory ─────────────────────────────────────────────────────────

export function createPlatformCapabilityProvider(): DeviceCapabilityProvider {
  if (Platform.OS === 'ios') {
    return new IosCapabilityProvider();
  }
  return new AndroidCapabilityProvider();
}

// ── High-level detector (cached) ───────────────────────────────────

/**
 * One-shot: detect the device tier using the platform capability provider.
 * Result is cached for the session; use `clearDeviceTierCache()` to reset.
 */
export async function detectDeviceTier(
  provider?: DeviceCapabilityProvider,
): Promise<DeviceTierResult> {
  if (cachedResult) return cachedResult;

  const p = provider ?? createPlatformCapabilityProvider();
  const capabilities = await p.getCapabilities();
  cachedResult = classifyDeviceTier(capabilities);
  return cachedResult;
}
