// @tutor-sg/device-tier — Device tier detection + persistence

import { Platform } from 'react-native'

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

export interface DeviceTierNativeModule {
  getTotalMemory(): Promise<number>
  getChipset(): Promise<string>
  isNPUAvailable(): Promise<boolean>
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

export const HIGH_TIER_CHIPSETS = [
  'A18',
  'A17',
  'A16',
  'A15',
  'Snapdragon 8 Gen',
  'Dimensity 9300',
  'Dimensity 9400',
]

export const MODEL_MAP = {}

export function isHighTierChipset(chipset: string): boolean {
  return HIGH_TIER_CHIPSETS.some((c) => chipset.includes(c))
}

export function hasModernNPU(info: NativeDeviceInfo): boolean {
  if (!info.npuAvailable) return false
  return isHighTierChipset(info.chipset)
}

export function assignTier(info: NativeDeviceInfo): { tier: DeviceTier; belowFloor: boolean } {
  if (info.totalRAM < TIER_THRESHOLDS.FLOOR_RAM_GB) {
    return { tier: 'low', belowFloor: true }
  }
  const modernNPU = hasModernNPU(info)
  if (info.totalRAM >= TIER_THRESHOLDS.HIGH_RAM_GB && modernNPU) {
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

export async function openDatabase() {
  console.warn('[device-tier] openDatabase stub')
}

export async function ensureSettingsTable() {
  console.warn('[device-tier] ensureSettingsTable stub')
}

export async function saveDeviceTier(tier: string) {
  console.warn('[device-tier] saveDeviceTier stub', tier)
}

export async function loadDeviceTier(): Promise<string | null> {
  console.warn('[device-tier] loadDeviceTier stub')
  return null
}

export async function clearDeviceTier() {
  console.warn('[device-tier] clearDeviceTier stub')
}
