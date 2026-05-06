/**
 * Mock for @tutor-sg/device-tier package used in mobile tests.
 * Provides pure-function stubs with BelowFloorModal as a renderable component.
 * Uses .tsx extension because BelowFloorModal contains JSX.
 */

import React from 'react';
import { View, Text } from 'react-native';

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

export const MODEL_MAP = {
  high: { llm: 'Gemma-2 4B', mt: 'Qwen 3.5 4B' },
  mid: { llm: 'Gemma-2 2B', mt: 'Qwen 3.5 2B' },
  low: { llm: 'none', mt: 'none' },
};

export const BELOW_FLOOR_MESSAGES = {
  en: 'Your device is too old to run the AI tutor. Please upgrade to a newer device.',
  zh: '您的设备太旧，无法运行AI家教。请升级到至少3 GB RAM的新设备。',
};

export const SETTINGS_KEY = 'device_tier';

export function assignTier(info: {
  totalRAM: number;
  chipset: string;
  npuAvailable: boolean;
}) {
  if (info.totalRAM < TIER_THRESHOLDS.FLOOR_RAM_GB) {
    return { tier: 'low' as const, belowFloor: true };
  }
  const isHighTier =
    info.totalRAM >= TIER_THRESHOLDS.HIGH_RAM_GB &&
    HIGH_TIER_CHIPSETS.some((c) => info.chipset.includes(c)) &&
    info.npuAvailable;
  if (isHighTier) {
    return { tier: 'high' as const, belowFloor: false };
  }
  return { tier: 'mid' as const, belowFloor: false };
}

export function buildCapabilities(
  info: { totalRAM: number; chipset: string; npuAvailable: boolean },
  tier?: 'high' | 'mid' | 'low',
) {
  const { tier: autoTier, belowFloor } = assignTier(info);
  return {
    tier: tier ?? autoTier,
    ramGB: info.totalRAM,
    chipset: info.chipset,
    npuAvailable: info.npuAvailable,
    belowFloor,
  };
}

export function BelowFloorModal({
  visible,
  language = 'en',
}: {
  visible: boolean;
  language?: 'en' | 'zh-Hans';
}) {
  if (!visible) return null;
  return (
    <View accessibilityRole="alert">
      <Text>
        {language === 'zh-Hans'
          ? BELOW_FLOOR_MESSAGES.zh
          : BELOW_FLOOR_MESSAGES.en}
      </Text>
    </View>
  );
}
