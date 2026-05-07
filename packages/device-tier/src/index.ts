// @tutor-sg/device-tier — Device tier detection + persistence

export type DeviceTier = 'high' | 'mid' | 'low'

export interface DeviceCapabilities {
  tier: DeviceTier
  ramGB: number
  chipset: string
  npuAvailable: boolean
  belowFloor: boolean
}

export interface NativeDeviceInfo {
  totalRAM: number
  chipset: string
  npuAvailable: boolean
}

export const SETTINGS_KEY = 'device_tier'

export const BELOW_FLOOR_MESSAGES = {
  en: 'Your device is too old to run the AI tutor.',
  zh: '您的设备太旧，无法运行AI家教。',
} as const

export const TIER_THRESHOLDS = {
  FLOOR_RAM_GB: 3,
  HIGH_RAM_GB: 8,
}

export function assignTier(info: NativeDeviceInfo): { tier: DeviceTier; belowFloor: boolean } {
  if (info.totalRAM < TIER_THRESHOLDS.FLOOR_RAM_GB) {
    return { tier: 'low', belowFloor: true }
  }
  if (info.totalRAM >= TIER_THRESHOLDS.HIGH_RAM_GB && info.npuAvailable) {
    return { tier: 'high', belowFloor: false }
  }
  return { tier: 'mid', belowFloor: false }
}

export function buildCapabilities(info: NativeDeviceInfo, tier?: DeviceTier): DeviceCapabilities {
  const { tier: autoTier, belowFloor } = assignTier(info)
  return {
    tier: tier ?? autoTier,
    ramGB: info.totalRAM,
    chipset: info.chipset,
    npuAvailable: info.npuAvailable,
    belowFloor,
  }
}
