export type DeviceTier = 'high' | 'mid' | 'low';

export interface DeviceCapabilities {
  tier: DeviceTier;
  ramGB: number;
  chipset: string;
  npuAvailable: boolean;
  belowFloor: boolean;
}

export interface NativeDeviceInfo {
  totalRAM: number;
  chipset: string;
  npuAvailable: boolean;
}

export interface DeviceTierNativeModule {
  getTotalMemory(): Promise<number>;
  getChipset(): Promise<string>;
  isNPUAvailable(): Promise<boolean>;
}

export const SETTINGS_KEY = 'device_tier';

export const BELOW_FLOOR_MESSAGES = {
  en: 'Your device is too old to run the AI tutor. Please upgrade to a newer device with at least 3 GB RAM.',
  zh: '您的设备太旧，无法运行AI家教。请升级到至少3 GB RAM的新设备。',
} as const;

export const TIER_THRESHOLDS = {
  HIGH_RAM_GB: 6,
  MID_RAM_GB: 4,
  FLOOR_RAM_GB: 3,
} as const;

export const HIGH_TIER_CHIPSETS = [
  'A14', 'A15', 'A16', 'A17', 'A18',
  'SDM8 Gen1', 'SDM8 Gen2', 'SDM8 Gen3',
  'Tensor G2', 'Tensor G3', 'Tensor G4',
] as const;

export type HighTierChipset = (typeof HIGH_TIER_CHIPSETS)[number];

export const MODEL_MAP: Record<DeviceTier, { llm: string; mt: string }> = {
  high: { llm: 'Gemma-2 4B', mt: 'Qwen 3.5 4B' },
  mid: { llm: 'Gemma-2 2B', mt: 'Qwen 3.5 2B' },
  low: { llm: 'none', mt: 'none' },
} as const;
