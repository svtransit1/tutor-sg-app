export type {
  DeviceTier,
  DeviceCapabilities,
  NativeDeviceInfo,
  DeviceTierNativeModule,
  HighTierChipset,
} from './types';

export {
  TIER_THRESHOLDS,
  HIGH_TIER_CHIPSETS,
  MODEL_MAP,
  SETTINGS_KEY,
  BELOW_FLOOR_MESSAGES,
} from './types';

import {
  DeviceTier,
  DeviceCapabilities,
  NativeDeviceInfo,
  TIER_THRESHOLDS,
  HIGH_TIER_CHIPSETS,
} from './types';

function isHighTierChipset(chipset: string): boolean {
  return HIGH_TIER_CHIPSETS.some((c) => chipset.includes(c));
}

function hasModernNPU(info: NativeDeviceInfo): boolean {
  if (!info.npuAvailable) return false;
  return isHighTierChipset(info.chipset);
}

export function assignTier(info: NativeDeviceInfo): { tier: DeviceTier; belowFloor: boolean } {
  if (info.totalRAM < TIER_THRESHOLDS.FLOOR_RAM_GB) {
    return { tier: 'low', belowFloor: true };
  }

  const modernNPU = hasModernNPU(info);

  if (info.totalRAM >= TIER_THRESHOLDS.HIGH_RAM_GB && modernNPU) {
    return { tier: 'high', belowFloor: false };
  }

  return { tier: 'mid', belowFloor: false };
}

export function buildCapabilities(info: NativeDeviceInfo, tier?: DeviceTier): DeviceCapabilities {
  const { tier: autoTier, belowFloor } = assignTier(info);
  return {
    tier: tier ?? autoTier,
    ramGB: info.totalRAM,
    chipset: info.chipset,
    npuAvailable: info.npuAvailable,
    belowFloor,
  };
}
